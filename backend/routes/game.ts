import { Screens, Views } from "@backend/views";
import express, { Router, Request, Response, NextFunction } from "express";
import {
  CreatePlayerPayload,
  createPlayer,
  getPlayersByLobbyId,
  getPlayersNotFolded,
  getPlayersNotFoldedOrAllIn,
  PlayerWithUserInfo,
  getPlayerByUserAndLobbyId,
  updateStatus,
  updateStatusUserAndLobby
} from "@backend/db/dao/PlayerDao";
import {
  GameLobby,
  createLobby,
  getGameLobbyById,
  updateTurnsByOne,
  updateGameStage,
  GameStage,
  updateCurrentPlayer
} from "@backend/db/dao/GameLobbyDao";
import { createDeck, deleteDeck } from "@backend/db/dao/CardDao";
import { TypedRequestBody } from "@backend/types";
import { validateGameExists } from "@backend/middleware/validate-game-exists";
import { ConstraintError } from "@backend/error/ConstraintError";
import { readUserFromID, updateUserBalance } from "@backend/db/dao/UserDao";
import signale from "signale";
export const router: Router = express.Router();

interface CreateRequestPayload {
  name: string;
  stake: number;
  user_id: string;
}

router.get(
  "/:id",
  validateGameExists,
  async (request: Request, response: Response, next: NextFunction) => {
    const gameID = request.params.id;
    const players = await getPlayersByLobbyId(gameID);

    // This allows for easier access from EJS. I wouldn't do this otherwise.
    const player_map: Record<string, string> = {};
    for (const player of players) {
      player_map[`player_${player.play_order}`] =
        `${player.username}\n$(${player.stake})`;
    }

    try {
      response.render(Views.GameLobby, {
        gameName: request.body.name,
        id: request.params.id,
        players: player_map,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/create",
  async (
    request: TypedRequestBody<CreateRequestPayload>,
    response: Response,
    _next: NextFunction,
  ) => {
    const requestBody: CreateRequestPayload = request.body;

    const name: string = requestBody.name;
    const stake: number = requestBody.stake;
    const userID: string = request.session.user.id;

    try {
      const gameLobbyID = await createLobby(name, stake);

      const player = await readUserFromID(userID);
      if (player.balance < stake) {
        throw Error("Not enough money for stake");
      }

      await updateUserBalance(player.username, player.balance - stake);

      const playerPayload: CreatePlayerPayload = {
        status: "playing",
        stake,
        playOrder: 1,
        userID,
        gameLobbyID,
      };
      await createPlayer(playerPayload);

      response.redirect(`/game/${gameLobbyID}`);
    } catch (error) {
      let message;

      if ((error as ConstraintError)?.constraint == "game_lobbies_name_key") {
        message = "Name already in use";
      } else {
        message = "Failed to create game";
      }

      const formData = {
        message,
        name,
        stake,
      };

      request.session.form = formData;

      response.redirect(Screens.Home);
    }
  },
);

type JoinGamePayload = {
  playOrder: number;
};

router.post(
  "/:id/join",
  async (req: TypedRequestBody<JoinGamePayload>, res) => {
    const gameID = req.params.id;
    const userID = req.session.user.id;
    const { playOrder } = req.body;

    let game: GameLobby;
    try {
      game = await getGameLobbyById(gameID);
    } catch (error) {
      // TODO: handle error for game not found
      signale.warn(`game ${gameID} not found`);
      res.redirect(Screens.Home);
      return;
    }

    const players = await getPlayersByLobbyId(gameID);
    if (players.length >= 6) {
      // TODO: add error message for max number of players reached
      signale.warn(`unable to join ${gameID}: max amount of players exceeded`);
      res.redirect(Screens.Home);
      return;
    }

    if (players.some((player) => player.user_id === userID)) {
      const message = `player ${userID} already in game ${gameID}`;
      signale.warn(message);
      res.status(403).send("You're already in this game!");
      return;
    }

    const player = await readUserFromID(userID);
    if (player.balance < game.buy_in) {
      const message = `unable to join ${gameID}: ${userID} does not have enough money`;
      signale.warn(message);
      res.status(403).send("You don't have enough money!");
      return;
    }

    await updateUserBalance(player.username, player.balance - game.buy_in);

    const playerPayload: CreatePlayerPayload = {
      userID: req.session.user.id,
      gameLobbyID: gameID,
      stake: game.buy_in,
      status: game.game_stage === "waiting" ? "playing" : "spectating",
      playOrder,
    };

    try {
      await createPlayer(playerPayload);
    } catch (error) {
      res.status(500).send("Unable to join game. Try again later.");
    }

    const io = req.app.get("io");

    io.emit(`game:join:${gameID}`, {
      playOrder,
      player: player.username,
      stake: game.buy_in,
    });
  },
);

router.get("/:id/createDeck", async (request: Request, response: Response) => {
  const gameID = request.params.id;

  try {
    await deleteDeck(gameID);
    await createDeck(gameID);
    response.status(200);
  } catch (error) {
    response.status(500).send("unable to create deck");
  }
});

async function getNextPlayer(request: Request, response: Response): Promise<void> {
  
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id;

  let lastPlayer:PlayerWithUserInfo;
  try{
    lastPlayer = await getPlayerByUserAndLobbyId(userID, gameLobbyID);
  }catch(error){
    signale.warn("Last player not found");
    return;
  }

  const io = request.app.get("io");

  io.to(lastPlayer.user_id).emit(`game:deactivateoldplayer:${gameLobbyID}`);
  
  const playersNotFolded = await getPlayersNotFolded(gameLobbyID);
  if (playersNotFolded.length === 1){
    await awardWinner(playersNotFolded[0].player_id);
    return;
  }
  else if (playersNotFolded.length === 0){
    signale.warn("All players folded, no winner left to select");
    response.status(403).send("Zero players left");
    return;
  }

  const playersNotFoldedOrAllIn = await getPlayersNotFoldedOrAllIn(gameLobbyID);
  if (playersNotFoldedOrAllIn.length <= 1){
    await decideWinner(gameLobbyID);
    return;
  }

  await updateTurnsByOne(gameLobbyID);

  let gameLobby: GameLobby;
  try {
    gameLobby = await getGameLobbyById(gameLobbyID);
  } catch (error) {
    // TODO: handle error for game not found
    signale.warn(`game ${gameLobbyID} not found`);
    response.redirect(Screens.Home);
    return;
  }

  const players = await getPlayersByLobbyId(gameLobbyID);

  if (gameLobby.turns >= players.length){
    let newRound = true;
    for (let i = 1; i < players.length; i++){
      if (players[i].bet != players[i-1].bet){
        newRound = false;
      }
    }
    if (newRound){
      await startNextRound(gameLobbyID);
      return;
    }
  }

  let nextPlayer:PlayerWithUserInfo | null = null;
  for (let i = 0 ; i < players.length; i++){
    if (lastPlayer.play_order === players[i].play_order){
      if (i === players.length - 1){
        nextPlayer = players[0];
      }
      else{
        nextPlayer = players[i + 1];
      }
      if (nextPlayer.status != 'playing'){
        lastPlayer = nextPlayer;
        i = -1;
      }
    }
  }
  if (nextPlayer === null){
    return;
  }

  await updateCurrentPlayer(gameLobbyID, nextPlayer.player_id);

  io.to(nextPlayer?.user_id).emit(`game:activatenewplayer:${gameLobbyID}`);
  io.emit(`game:announcenewplayer:${gameLobbyID}`, {
    newPlayerName: nextPlayer?.username,
  })



}


async function awardWinner(winnerID: string): Promise<void> {
  
  
}

async function decideWinner(gameLobbyID: string): Promise<void> {
  
}

async function startNextRound(gameLobbyID: string): Promise<void> {
  
}


router.get("/:id/fold", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id;

  await updateStatusUserAndLobby(userID, gameLobbyID, "folded");

  let foldedPlayer:PlayerWithUserInfo;
  try{
    foldedPlayer = await getPlayerByUserAndLobbyId(userID, gameLobbyID);
  }catch(error){
    signale.warn("folded player not found");
    return;
  }
  const io = request.app.get("io");
  io.emit(`game:fold:${gameLobbyID}`, {
    playOrder: foldedPlayer.play_order,
    playerName: foldedPlayer.username,
    stake: foldedPlayer.stake,
    bet: foldedPlayer.bet,
    status: foldedPlayer.status
  });

  await getNextPlayer(request, response);

});


router.get("/:id/dummyStart", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id
  const gamestage:GameStage = "preflop";
  await updateGameStage(gameLobbyID, gamestage);

  const players = await getPlayersByLobbyId(gameLobbyID);

  if (players.length < 4){
    signale.warn("not enough players");
    response.status(403).send("Not enough players");
    return;
  }

  for (let i = 0; i < players.length ; i++) {
    await updateStatus(players[i].player_id, "playing");
    players[i].status = "playing";
  }

  await getNextPlayer(request, response);

  response.status(200).send();
});