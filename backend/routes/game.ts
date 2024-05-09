import { Screens, Views } from "@backend/views";
import express, { Router, Request, Response, NextFunction } from "express";
import {
  CreatePlayerPayload,
  Player,
  createPlayer,
  getPlayerCards,
  getPlayersByLobbyId,
  removePlayerByPlayerId,
  updateBet,
  updateCards,
} from "@backend/db/dao/PlayerDao";
import {
  GameLobby,
  createLobby,
  getGameLobbyById,
  updateCommunityCards,
  updateDealer,
  updateGameStage,
} from "@backend/db/dao/GameLobbyDao";
import {
  Card,
  createDeck,
  deleteDeck,
  getCardsByGame,
} from "@backend/db/dao/CardDao";
import { TypedRequestBody } from "@backend/types";
import { validateGameExists } from "@backend/middleware/validate-game-exists";
import { ConstraintError } from "@backend/error/ConstraintError";
import {
  addToUserBalance,
  readUserFromID,
  updateUserBalance,
} from "@backend/db/dao/UserDao";
import signale from "signale";
import { Socket } from "socket.io";
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
    const userID = request.session.user.id;

    const gameID = request.params.id;
    const players = await getPlayersByLobbyId(gameID);
    const thisPlayer = players.find((player) => player.user_id === userID)!;

    const game = await getGameLobbyById(gameID);
    const thisPlayerCards = await getPlayerCards(userID, gameID);

    // This allows for easier access from EJS. I wouldn't do this otherwise.
    const player_map: Record<string, string | number> = {};
    for (const player of players) {
      player_map[`player_${player.play_order}`] =
        `${player.username}\nStake: $${player.stake}`;
    }
    player_map.player_count = players.length;

    console.log(thisPlayer);

    try {
      response.render(Views.GameLobby, {
        gameName: request.body.name,
        id: request.params.id,
        players: player_map,
        gameStage: game.game_stage,
        thisPlayerCards,
        thisPlayerPosition: thisPlayer.play_order,
        // communityCards: [
        //   game.flop_1,
        //   game.flop_2,
        //   game.flop_3,
        //   game.turn,
        //   game.river,
        // ],
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
      numPlayers: players.length + 1,
    });
  },
);

async function kickPlayer(
  gameLobbyID: string,
  player: Player,
  username: string,
  socket: Socket,
) {
  await removePlayerByPlayerId(player.player_id);

  await addToUserBalance(username, player.stake);

  socket.emit(`game:kick:${gameLobbyID}`, {
    playerID: player.player_id,
    username,
  });
}

const routesCurrentlyStarting: Record<string, boolean> = {};

router.post("/:id/start", async (req, res) => {
  const gameID = req.params.id;
  try {
    const io = req.app.get("io");

    // A dumb locking mechanism. But it seems to work.
    if (routesCurrentlyStarting[gameID]) {
      res.status(403).send("Starting this game already...please be patient!");
      return;
    }
    routesCurrentlyStarting[gameID] = true;

    // Make sure game has not started.
    const game = await getGameLobbyById(gameID);
    if (game.game_stage !== "waiting") {
      signale.warn(`cannot start game: less than 2 players`);
      res.status(403).send("This game has already started");
      return;
    }

    // Check for player count, just in case people leave before.
    const players = await getPlayersByLobbyId(gameID);
    if (players.length < 4) {
      signale.warn(`cannot start game: less than 2 players`);
      res
        .status(403)
        .send(
          "Not enough players to start game. You need at least 2 players to start.",
        );
      return;
    }

    const [dealer, smallBlindPlayer, bigBlindPlayer] = players;

    // Set dealer for this round.
    await updateDealer(gameID, dealer.player_id);

    // Take money from big blind and small blind.
    // If not enough money in stake, then kick and abort start.
    if (smallBlindPlayer.stake < game.big_blind / 2) {
      await kickPlayer(gameID, smallBlindPlayer, bigBlindPlayer.username, io);
      res
        .status(403)
        .send("Aborting game...small blind did not have enough money");
      return;
    }
    updateBet(smallBlindPlayer.player_id, game.big_blind / 2);

    if (bigBlindPlayer.stake < game.big_blind) {
      await kickPlayer(gameID, bigBlindPlayer, bigBlindPlayer.username, io);
      res
        .status(403)
        .send("Aborting game...big blind did not have enough money");
      return;
    }
    updateBet(bigBlindPlayer.player_id, game.big_blind);

    // Remove all cards/recreate deck
    let deck: Array<Card> = [];
    try {
      await deleteDeck(gameID);
      await createDeck(gameID);
      deck = await getCardsByGame(gameID);
    } catch (error) {
      signale.error("error recreating deck:", error);
      res.status(500).send("Unable to create deck. Try again later");
      return;
    }

    // Deal cards
    for (const player of players) {
      const card1 = deck.pop()!;
      const card2 = deck.pop()!;

      updateCards(player.player_id, card1.game_card_id, card2.game_card_id);
    }
    const [flop1, flop2, flop3, turn, river] = deck;
    await updateCommunityCards(
      gameID,
      flop1.game_card_id,
      flop2.game_card_id,
      flop3.game_card_id,
      turn.game_card_id,
      river.game_card_id,
    );

    // Move game state to pre_flop
    await updateGameStage(gameID, "preflop");
    io.emit(`game:start:${gameID}`, {});

    // for (const player of players) {
    //   const cards = getPlayerCards(player.user_id);
    //   io.to(player.user_id).emit('' {cards})
    // }
  } finally {
    routesCurrentlyStarting[gameID] = false;
  }
});
