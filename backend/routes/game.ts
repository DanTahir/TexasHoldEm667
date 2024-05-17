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
  getPlayersNotFolded,
  getPlayersNotFoldedOrAllIn,
  PlayerWithUserInfo,
  getPlayerByUserAndLobbyId,
  updateStatus,
  updateStatusUserAndLobby,
  getPlayerByMaxBet,
  updateStake,
  getPlayerByGameIDAndPlayOrder,
  getPlayersNotSpectating,
  getPlayerById,
  updateAllInAmount,
} from "@backend/db/dao/PlayerDao";
import {
  GameLobby,
  createLobby,
  getCommunityCards,
  getGameLobbyById,
  updateCommunityCards,
  updateDealer,
  updateGameStage,
  updateTurnsToZero,
  updateTurnsByOne,
  GameStage,
  updatePot,
  updateCurrentPlayer,
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

router.post(
  "/:id/checkCurrentPlayer",
  validateGameExists,
  async (req: Request, _res: Response) => {
    const gameID = req.params.id;
    const userID = req.session.user.id;
    const players = await getPlayersByLobbyId(gameID);
    // Add your logic here to emit the event
    const io = req.app.get("io");
    console.log("checking activatenewplayer");
    for (const player of players) {
      if (userID === player.user_id) {
        if (player.player_id === req.body.currentPlayer) {
          console.log("emitting activatenewplayer");
          io.to(userID).emit(`game:activatenewplayer:${gameID}`);
        }
      }
    }
  },
);

router.get(
  "/:id",
  validateGameExists,
  async (request: Request, response: Response, next: NextFunction) => {
    const userID = request.session.user.id;

    const gameID = request.params.id;
    const userName = request.session.user.username;
    const players = await getPlayersByLobbyId(gameID);
    const thisPlayer = players.find((player) => player.user_id === userID);

    const game = await getGameLobbyById(gameID);
    const thisPlayerCards = await getPlayerCards(userID, gameID);

    const communityCards = await getCommunityCards(gameID);

    // This allows for easier access from EJS. I wouldn't do this otherwise.
    const player_map: Record<string, string | number> = {};
    for (const player of players) {
      player_map[`player_${player.play_order}`] =
        `${player.username}\n$(${player.stake})\nbet: $${player.bet}\n${player.status}`;
    }
    player_map.player_count = players.length;

    try {
      response.render(Views.GameLobby, {
        gameName: request.body.name,
        id: request.params.id,
        players: player_map,
        gameStage: game.game_stage,
        thisPlayerCards,
        thisPlayerPosition: thisPlayer?.play_order || 0,
        communityCards,
        userName: userName,
        pot: game.pot,
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
type raisePayload = {
  raiseValue: number;
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
    let createdPlayer: PlayerWithUserInfo;
    try {
      createdPlayer = await getPlayerByUserAndLobbyId(userID, gameID);
    } catch (error) {
      res.status(500).send("Unable to join game. Try again later.");
      return;
    }

    const io = req.app.get("io");

    io.emit(`game:join:${gameID}`, {
      playOrder,
      numPlayers: players.length + 1,
      player: createdPlayer.username,
      stake: createdPlayer.stake,
      bet: createdPlayer.bet,
      status: createdPlayer.status,
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
  const userID = req.session.user.id;
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
      signale.warn(`cannot start game: game not in waiting state`);
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

    // Make sure player is acutally playing in this game.
    if (!players.some((player) => player.user_id === userID)) {
      signale.warn(
        `cannot start game: player with user ID ${userID} is not in game`,
      );
      res.status(403).send("You must be a part of this game to start it.");
      return;
    }

    const [dealer, smallBlindPlayer, bigBlindPlayer] = players;

    // Set dealer for this round.
    await updateDealer(gameID, dealer.player_id);

    // If not enough money in stake, then kick and abort start.
    let kickedPlayer: boolean = false;
    for (const player of players) {
      if (player.stake < game.big_blind) {
        await kickPlayer(gameID, player, bigBlindPlayer.username, io);
        kickedPlayer = true;
      }
    }
    if (kickedPlayer) {
      res
        .status(403)
        .send("Aborting game...some player(s) did not have enough money");
      return;
    }

    // Take money from big blind and small blind.
    updateBet(smallBlindPlayer.player_id, game.big_blind / 2);
    updateStake(
      smallBlindPlayer.player_id,
      smallBlindPlayer.stake - game.big_blind / 2,
    );
    updateBet(bigBlindPlayer.player_id, game.big_blind);
    updateStake(
      bigBlindPlayer.player_id,
      bigBlindPlayer.stake - game.big_blind,
    );
    io.emit(`game:foldraisecall:${gameID}`, {
      playOrder: smallBlindPlayer.play_order,
      playerName: smallBlindPlayer.username,
      stake: smallBlindPlayer.stake - game.big_blind / 2,
      bet: game.big_blind / 2,
      status: smallBlindPlayer.status,
    });
    io.emit(`game:foldraisecall:${gameID}`, {
      playOrder: bigBlindPlayer.play_order,
      playerName: bigBlindPlayer.username,
      stake: bigBlindPlayer.stake - game.big_blind,
      bet: game.big_blind,
      status: bigBlindPlayer.status,
    });

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

    for (const player of players) {
      const cards = await getPlayerCards(player.user_id, gameID);
      io.to(player.user_id).emit(`game:deal:${gameID}`, {
        cards,
        playOrder: player.play_order,
      });
    }

    getNextPlayer(req, res, bigBlindPlayer.user_id);
  } finally {
    routesCurrentlyStarting[gameID] = false;
  }
});

async function getNextPlayer(
  request: Request,
  response: Response,
  lastPlayerUserID: string,
): Promise<void> {
  const gameLobbyID = request.params.id;

  let lastPlayer: PlayerWithUserInfo;
  try {
    lastPlayer = await getPlayerByUserAndLobbyId(lastPlayerUserID, gameLobbyID);
  } catch (error) {
    signale.warn("Last player not found");
    return;
  }

  const io = request.app.get("io");

  io.to(lastPlayer.user_id).emit(`game:deactivateoldplayer:${gameLobbyID}`);

  const playersNotFolded = await getPlayersNotFolded(gameLobbyID);
  if (playersNotFolded.length === 1) {
    const winnerArrayArray: Array<Array<PlayerWithUserInfo>> = new Array<
      Array<PlayerWithUserInfo>
    >();
    winnerArrayArray.push(playersNotFolded);

    await awardWinner(request, response, winnerArrayArray);
    return;
  } else if (playersNotFolded.length === 0) {
    signale.warn("All players folded, no winner left to select");
    response.status(403).send("Zero players left");
    return;
  }

  const playersNotFoldedOrAllIn = await getPlayersNotFoldedOrAllIn(gameLobbyID);
  if (playersNotFoldedOrAllIn.length === 1) {
    try {
      const playerMaxBet = await getPlayerByMaxBet(gameLobbyID);
      if (playersNotFoldedOrAllIn[0].bet === playerMaxBet.bet) {
        await dummyDecideWinner(request, response, playersNotFolded);
        return;
      }
    } catch (error) {
      signale.warn(error);
    }
  } else if (playersNotFoldedOrAllIn.length === 0) {
    await dummyDecideWinner(request, response, playersNotFolded);
    return;
  }

  let gameLobby: GameLobby;
  try {
    gameLobby = await getGameLobbyById(gameLobbyID);
  } catch (error) {
    // TODO: handle error for game not found
    signale.warn(`game ${gameLobbyID} not found`);
    response.redirect(Screens.Home);
    return;
  }

  let players: Array<PlayerWithUserInfo> | null = null;
  try {
    players = await getPlayersByLobbyId(gameLobbyID);
  } catch (error) {
    signale.warn(error);
    return;
  }
  if (!players) {
    signale.warn("players was empty");
    return;
  }

  if (lastPlayer.status != "all-in" && lastPlayer.status != "folded") {
    await updateTurnsByOne(gameLobbyID);
  }

  if (gameLobby.turns >= playersNotFoldedOrAllIn.length) {
    try {
      const playerMaxBet = await getPlayerByMaxBet(gameLobbyID);
      let newRound = true;
      console.log(`max bet: ${playerMaxBet.bet}`);
      for (let i = 0; i < playersNotFoldedOrAllIn.length; i++) {
        console.log(`player bet: ${playersNotFoldedOrAllIn[i].bet}`);
        if (playersNotFoldedOrAllIn[i].bet != playerMaxBet.bet) {
          console.log("newRound set to false");
          newRound = false;
        }
      }
      if (newRound) {
        await startNextRound(request, response, gameLobbyID);
        return;
      }
    } catch (error) {
      signale.warn(error);
    }
  }

  let nextPlayer: PlayerWithUserInfo | null = null;
  for (let i = 0; i < players.length; i++) {
    if (lastPlayer.play_order === players[i].play_order) {
      if (i === players.length - 1) {
        nextPlayer = players[0];
      } else {
        nextPlayer = players[i + 1];
      }
      if (nextPlayer.status != "playing") {
        lastPlayer = nextPlayer;
        i = -1;
      }
    }
  }
  if (nextPlayer === null) {
    return;
  }

  await updateCurrentPlayer(gameLobbyID, nextPlayer.player_id);

  io.to(nextPlayer?.user_id).emit(`game:activatenewplayer:${gameLobbyID}`);
  io.emit(`game:announcenewplayer:${gameLobbyID}`, {
    newPlayerName: nextPlayer?.username,
  });
}

async function awardWinner(
  request: Request,
  _response: Response,
  winners: Array<Array<PlayerWithUserInfo>>,
): Promise<void> {
  const gameLobbyID = request.params.id;
  const lobby = await getGameLobbyById(gameLobbyID);
  let remainingPot = lobby.pot;

  const bettingPlayers = await getPlayersByLobbyId(gameLobbyID);
  for (const player of bettingPlayers) {
    remainingPot += player.bet;
    await updateBet(player.player_id, 0);
  }

  let lastAllInAmount = 0;
  let announceWinnerString = ``;
  for (let i = 0; i < winners.length; i++) {
    if (winners[i].length === 1) {
      const winner = winners[i][0];
      if (winner.status != "all-in" || winner.allin_amount >= remainingPot) {
        await updateStake(winner.player_id, winner.stake + remainingPot);
        announceWinnerString += `Winner Rank ${i + 1}: ${winner.username} - winnings: $${remainingPot}\n`;
        remainingPot = 0;
        break;
      } else {
        const actualAllInAmount = winner.allin_amount - lastAllInAmount;
        await updateStake(winner.player_id, winner.stake + actualAllInAmount);
        remainingPot -= actualAllInAmount;
        lastAllInAmount = winner.allin_amount;
        announceWinnerString += `Winner Rank ${i + 1}: ${winner.username} - winnings: $${actualAllInAmount}\n`;
      }
    } else {
      let splitPot = remainingPot / winners[i].length;
      remainingPot = 0;

      const allInWinners = winners[i].filter(
        (winner) => winner.status === "all-in",
      );
      if (allInWinners) {
        const allInWinnersSorted = allInWinners.sort(
          (winnerA, winnerB) => winnerA.allin_amount - winnerB.allin_amount,
        );

        for (const allInWinner of allInWinnersSorted) {
          const winAmount =
            allInWinner.allin_amount / winners[i].length -
            lastAllInAmount / winners[i].length;
          let reportedWinAmount = 0;
          if (splitPot <= winAmount) {
            await updateStake(
              allInWinner.player_id,
              allInWinner.stake + splitPot,
            );
            reportedWinAmount = splitPot;
          } else {
            await updateStake(
              allInWinner.player_id,
              allInWinner.stake + winAmount,
            );
            remainingPot += splitPot - winAmount;
            reportedWinAmount = winAmount;
          }
          announceWinnerString += `Winner Rank ${i + 1}: ${allInWinner.username} - winnings: $${reportedWinAmount}\n`;
        }
        if (allInWinners.length > 0) {
          lastAllInAmount = 0;
          for (const allInWinner of allInWinners) {
            lastAllInAmount += allInWinner.allin_amount / winners[i].length;
          }
        }
      }
      const playingWinners = winners[i].filter(
        (winner) => winner.status === "playing",
      );
      if (playingWinners) {
        splitPot += remainingPot / playingWinners.length;
        remainingPot = 0;
        for (const playingWinner of playingWinners) {
          await updateStake(
            playingWinner.player_id,
            playingWinner.stake + splitPot,
          );
          announceWinnerString += `Winner Rank ${i + 1}: ${playingWinner.username} - winnings: $${splitPot}\n`;
        }
        break;
      }
    }
  }

  await updatePot(gameLobbyID, 0);
  await updateGameStage(gameLobbyID, "final");
  const io = request.app.get("io");
  io.emit(`game:updatepot:${gameLobbyID}`, {
    pot: 0,
  });
  io.emit(`game:showresetbutton:${gameLobbyID}`);
  const cards = await getCommunityCards(gameLobbyID);
  io.emit(`game:showFlop:${gameLobbyID}`, {
    card1: cards?.flop_1,
    card2: cards?.flop_2,
    card3: cards?.flop_3,
  });
  io.emit(`game:showTurn:${gameLobbyID}`, {
    card: cards?.turn,
  });
  io.emit(`game:showRiver:${gameLobbyID}`, {
    card: cards?.river,
  });
  const players = await getPlayersByLobbyId(gameLobbyID);
  for (const player of players) {
    io.emit(`game:foldraisecall:${gameLobbyID}`, {
      playOrder: player.play_order,
      playerName: player.username,
      stake: player.stake,
      bet: player.bet,
      status: player.status,
    });
    const cards = await getPlayerCards(player.user_id, gameLobbyID);
    io.emit(`game:deal:${gameLobbyID}`, {
      cards,
      playOrder: player.play_order,
    });
  }
  io.emit(`game:announcewinner:${gameLobbyID}`, {
    announceWinnerString: announceWinnerString,
  });
}

async function decideWinner(): Promise<void> {}

async function dummyDecideWinner(
  request: Request,
  response: Response,
  activePlayers: Array<PlayerWithUserInfo>,
): Promise<void> {
  const firstTie: Array<PlayerWithUserInfo> = new Array<PlayerWithUserInfo>();
  const secondTie: Array<PlayerWithUserInfo> = new Array<PlayerWithUserInfo>();
  const arrayOfTies: Array<Array<PlayerWithUserInfo>> = new Array<
    Array<PlayerWithUserInfo>
  >();
  if (activePlayers[0]) {
    firstTie.push(activePlayers[0]);
  }
  if (activePlayers[1]) {
    firstTie.push(activePlayers[1]);
  }
  if (activePlayers[2]) {
    secondTie.push(activePlayers[2]);
  }
  if (activePlayers[3]) {
    secondTie.push(activePlayers[3]);
  }
  if (firstTie.length > 0) {
    arrayOfTies.push(firstTie);
  }
  if (secondTie.length > 0) {
    arrayOfTies.push(secondTie);
  }

  await awardWinner(request, response, arrayOfTies);
}

async function startNextRound(
  request: Request,
  response: Response,
  gameLobbyID: string,
): Promise<void> {
  const activePlayers = await getPlayersNotSpectating(gameLobbyID);
  const lobby: GameLobby = await getGameLobbyById(gameLobbyID);
  let pot: number = lobby.pot;
  const io = request.app.get("io");

  for (const player of activePlayers) {
    pot = pot + player.bet;
    await updateBet(player.player_id, 0);
    io.emit(`game:foldraisecall:${gameLobbyID}`, {
      playOrder: player.play_order,
      playerName: player.username,
      stake: player.stake,
      bet: 0,
      status: player.status,
    });
  }

  console.log(`Pot: ${pot}`);
  await updatePot(gameLobbyID, pot);

  io.emit(`game:updatepot:${gameLobbyID}`, {
    pot: pot,
  });

  let nextStage: GameStage;
  const cards = await getCommunityCards(gameLobbyID);

  if (lobby.game_stage === "preflop") {
    nextStage = "flop";
    io.emit(`game:showFlop:${gameLobbyID}`, {
      card1: cards?.flop_1,
      card2: cards?.flop_2,
      card3: cards?.flop_3,
    });
  } else if (lobby.game_stage === "flop") {
    nextStage = "turn";
    io.emit(`game:showTurn:${gameLobbyID}`, {
      card: cards?.turn,
    });
  } else if (lobby.game_stage === "turn") {
    nextStage = "river";
    io.emit(`game:showRiver:${gameLobbyID}`, {
      card: cards?.river,
    });
  } else {
    const playersNotFolded = await getPlayersNotFolded(gameLobbyID);
    await dummyDecideWinner(request, response, playersNotFolded);
    await decideWinner();
    return;
  }

  await updateGameStage(gameLobbyID, nextStage);
  await updateTurnsToZero(gameLobbyID);

  const dealer = await getPlayerById(lobby.dealer as string);

  await getNextPlayer(request, response, dealer.user_id);
}

router.post(
  "/:id/quit",
  validateGameExists,
  async (req: Request, res: Response) => {
    const gameID = req.params.id;
    const userID = req.session.user.id;

    try {
      const player: Player = await getPlayerByUserAndLobbyId(userID, gameID);

      const user = await readUserFromID(userID);
      await updateUserBalance(user.username, user.balance + player.stake);
      const pot = req.body.pot;
      await updatePot(gameID, pot + player.bet);
      const dealer = req.body.dealer;
      const currentPlayer = req.body.currentPlayer;
      if (dealer === player.player_id) {
        const players = await getPlayersByLobbyId(gameID);
        if (players.length > 1) {
          let newPlayer = null;
          let position = player.play_order;
          while (!newPlayer) {
            position++;
            if (position > 6) {
              position = 1;
            }
            newPlayer = await getPlayerByGameIDAndPlayOrder(gameID, position);
          }
          await updateDealer(gameID, newPlayer.player_id);
        }
      }
      if (currentPlayer === player.player_id) {
        await getNextPlayer(req, res, userID);
      }
      await removePlayerByPlayerId(player.player_id);

      const io = req.app.get("io");
      const playOrder = player.play_order;
      res.status(200).send();
      io.emit(`game:quit:${gameID}`, {
        playOrder,
      });
    } catch (error) {
      // TODO: handle error for game not found
      signale.warn(`user ${userID} not found in game ${gameID}`);
      res.status(403).send("You're not in this game!");
      return;
    }
  },
);

router.post("/:id/fold", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id;

  await updateStatusUserAndLobby(userID, gameLobbyID, "folded");

  let foldedPlayer: PlayerWithUserInfo;
  try {
    foldedPlayer = await getPlayerByUserAndLobbyId(userID, gameLobbyID);
  } catch (error) {
    signale.warn("folded player not found");
    return;
  }
  const io = request.app.get("io");
  io.emit(`game:foldraisecall:${gameLobbyID}`, {
    playOrder: foldedPlayer.play_order,
    playerName: foldedPlayer.username,
    stake: foldedPlayer.stake,
    bet: foldedPlayer.bet,
    status: foldedPlayer.status,
  });

  await getNextPlayer(request, response, userID);
});

router.get("/:id/dummyStart", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const gamestage: GameStage = "preflop";
  const userID = request.session.user.id;
  await updateGameStage(gameLobbyID, gamestage);
  await updateTurnsToZero(gameLobbyID);

  const players = await getPlayersByLobbyId(gameLobbyID);

  if (players.length < 4) {
    signale.warn("not enough players");
    response.status(403).send("Not enough players");
    return;
  }

  for (let i = 0; i < players.length; i++) {
    await updateStatus(players[i].player_id, "playing");
    players[i].status = "playing";
  }

  await getNextPlayer(request, response, userID);

  response.status(200).send();
});

router.post("/:id/call", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id;

  let callingPlayer: PlayerWithUserInfo | null = null;
  try {
    callingPlayer = await getPlayerByUserAndLobbyId(userID, gameLobbyID);
  } catch (error) {
    signale.warn("calling player not found");
    response.status(403).send("calling player not found");
    return;
  }
  if (!callingPlayer) {
    return;
  }

  let maxBetPlayer: PlayerWithUserInfo | null = null;
  try {
    maxBetPlayer = await getPlayerByMaxBet(gameLobbyID);
  } catch (error) {
    signale.warn("max bet player not found");
    response.status(403).send("max bet player not found");
    return;
  }
  if (!maxBetPlayer) {
    return;
  }
  const difference = maxBetPlayer.bet - callingPlayer.bet;
  if (difference >= callingPlayer.stake) {
    callingPlayer.bet += callingPlayer.stake;
    callingPlayer.stake = 0;
    callingPlayer.status = "all-in";
    const game = await getGameLobbyById(gameLobbyID);
    const playersNotFolded = await getPlayersNotFolded(gameLobbyID);
    const playersNotFoldedOrAllIn =
      await getPlayersNotFoldedOrAllIn(gameLobbyID);
    callingPlayer.allin_amount = game.pot;
    for (const playerNotFolded of playersNotFolded) {
      if (playerNotFolded.status === "all-in") {
        callingPlayer.allin_amount += playerNotFolded.bet;
      }
    }
    callingPlayer.allin_amount +=
      callingPlayer.bet * playersNotFoldedOrAllIn.length;
    await updateStake(callingPlayer.player_id, callingPlayer.stake);
    await updateBet(callingPlayer.player_id, callingPlayer.bet);
    await updateStatus(callingPlayer.player_id, callingPlayer.status);
    await updateAllInAmount(
      callingPlayer.player_id,
      callingPlayer.allin_amount,
    );
  } else {
    callingPlayer.bet += difference;
    callingPlayer.stake -= difference;
    await updateStake(callingPlayer.player_id, callingPlayer.stake);
    await updateBet(callingPlayer.player_id, callingPlayer.bet);
  }
  const io = request.app.get("io");

  io.emit(`game:foldraisecall:${gameLobbyID}`, {
    playOrder: callingPlayer.play_order,
    playerName: callingPlayer.username,
    stake: callingPlayer.stake,
    bet: callingPlayer.bet,
    status: callingPlayer.status,
  });

  await getNextPlayer(request, response, userID);
});

router.post(
  "/:id/raise",
  async (request: TypedRequestBody<raisePayload>, response: Response) => {
    const gameLobbyID = request.params.id;
    const userID = request.session.user.id;
    const { raiseValue } = request.body;
    console.log("Hello from raise route");
    let raisingPlayer: PlayerWithUserInfo | null = null;
    try {
      raisingPlayer = await getPlayerByUserAndLobbyId(userID, gameLobbyID);
    } catch (error) {
      signale.warn("raising player not found");
      response.status(403).send("raising player not found");
      return;
    }
    if (!raisingPlayer) {
      return;
    }

    let maxBetPlayer: PlayerWithUserInfo | null = null;
    try {
      maxBetPlayer = await getPlayerByMaxBet(gameLobbyID);
    } catch (error) {
      signale.warn("max bet player not found");
      response.status(403).send("max bet player not found");
      return;
    }
    if (!maxBetPlayer) {
      return;
    }
    const newMax = maxBetPlayer.bet + raiseValue;
    const difference = newMax - raisingPlayer.bet;

    if (difference >= raisingPlayer.stake) {
      raisingPlayer.bet += raisingPlayer.stake;
      raisingPlayer.stake = 0;
      raisingPlayer.status = "all-in";
      const game = await getGameLobbyById(gameLobbyID);
      const playersNotFolded = await getPlayersNotFolded(gameLobbyID);
      const playersNotFoldedOrAllIn =
        await getPlayersNotFoldedOrAllIn(gameLobbyID);
      raisingPlayer.allin_amount = game.pot;
      for (const playerNotFolded of playersNotFolded) {
        if (playerNotFolded.status === "all-in") {
          raisingPlayer.allin_amount += playerNotFolded.bet;
        }
      }
      raisingPlayer.allin_amount +=
        raisingPlayer.bet * playersNotFoldedOrAllIn.length;
      await updateStake(raisingPlayer.player_id, raisingPlayer.stake);
      await updateBet(raisingPlayer.player_id, raisingPlayer.bet);
      await updateStatus(raisingPlayer.player_id, raisingPlayer.status);
      await updateAllInAmount(
        raisingPlayer.player_id,
        raisingPlayer.allin_amount,
      );
    } else {
      raisingPlayer.bet += difference;
      raisingPlayer.stake -= difference;
      await updateStake(raisingPlayer.player_id, raisingPlayer.stake);
      await updateBet(raisingPlayer.player_id, raisingPlayer.bet);
    }

    const io = request.app.get("io");

    io.emit(`game:foldraisecall:${gameLobbyID}`, {
      playOrder: raisingPlayer.play_order,
      playerName: raisingPlayer.username,
      stake: raisingPlayer.stake,
      bet: raisingPlayer.bet,
      status: raisingPlayer.status,
    });

    await getNextPlayer(request, response, userID);
  },
);

router.post("/:id/reset", async (request: Request, response: Response) => {
  const gameLobbyID = request.params.id;
  const userID = request.session.user.id;
  const players = await getPlayersByLobbyId(gameLobbyID);
  if (!players.some((player) => player.user_id === userID)) {
    signale.warn(
      `cannot reset game: player with user ID ${userID} is not in game`,
    );
    response.status(403).send("You must be a part of this game to reset it.");
    return;
  }

  updateGameStage(gameLobbyID, "waiting");
  const io = request.app.get("io");
  for (const player of players) {
    await updateStatus(player.player_id, "playing");
    io.emit(`game:foldraisecall:${gameLobbyID}`, {
      playOrder: player.play_order,
      playerName: player.username,
      stake: player.stake,
      bet: player.bet,
      status: "playing",
    });
  }
  io.emit(`game:reset:${gameLobbyID}`);
});
