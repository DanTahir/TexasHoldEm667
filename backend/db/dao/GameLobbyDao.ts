import { db } from "@backend/db/connection.js";

export type GameStage =
  | "waiting"
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "final";

export interface GameLobby {
  game_lobby_id: string;
  name: string;
  game_stage: GameStage;
  buy_in: number;
  pot: number;
  big_blind: number;
  dealer?: string;
  current_player?: string;
  flop_1?: string;
  flop_2?: string;
  flop_3?: string;
  turn?: string;
  river?: string;
  num_players?: number;
  turns: number;
}

export async function createLobby(
  name: string,
  buy_in: number,
): Promise<string> {
  const { game_lobby_id } = await db.one(
    "INSERT INTO game_lobbies (name, buy_in) VALUES ($1, $2) RETURNING game_lobby_id",
    [name, buy_in],
  );

  return game_lobby_id;
}

export async function deleteLobby(game_lobby_id: string) {
  await db.none("DELETE FROM game_lobbies WHERE game_lobby_id=$1", [
    game_lobby_id,
  ]);
}

export async function getGameLobbyById(lobbyId: string): Promise<GameLobby> {
  const gameLobby: GameLobby = await db.one(
    "SELECT * FROM game_lobbies WHERE game_lobby_id=$1",
    [lobbyId],
  );

  return gameLobby;
}

export async function getGameLobbyByName(name: string): Promise<GameLobby> {
  const { game_lobby } = await db.one(
    "SELECT * FROM game_lobbies WHERE name=$1",
    [name],
  );

  return game_lobby;
}

type GameLobbyNameAndPlayerCount = {
  id: string;
  name: string;
  players: number;
};

export async function getRecentGames() {
  const recentGameQuery = `
  SELECT l.game_lobby_id, l.name, COUNT(p.game_lobby_id) AS num_players        
    FROM game_lobbies AS l
  LEFT JOIN 
    players AS p
  ON 
    (l.game_lobby_id = p.game_lobby_id)
  GROUP BY 
    l.game_lobby_id
  ORDER BY 
    created_at DESC`;

  const game_lobbies: GameLobbyNameAndPlayerCount[] =
    await db.manyOrNone(recentGameQuery);

  return game_lobbies;
}

export async function updateCurrentPlayer(
  game_lobby_id: string,
  player_id: string,
) {
  await db.none(
    "UPDATE game_lobbies SET current_player=$2 WHERE game_lobby_id=$1",
    [game_lobby_id, player_id],
  );
}

export async function updateDealer(game_lobby_id: string, player_id: string) {
  await db.none("UPDATE game_lobbies SET dealer=$2 WHERE game_lobby_id=$1", [
    game_lobby_id,
    player_id,
  ]);
}

export async function updateGameStage(
  game_lobby_id: string,
  game_stage: GameStage,
) {
  await db.none(
    "UPDATE game_lobbies SET game_stage=$2 WHERE game_lobby_id=$1",
    [game_lobby_id, game_stage],
  );
}

export async function updateBuyIn(game_lobby_id: string, buy_in: number) {
  await db.none("UPDATE game_lobbies SET buy_in=$2 WHERE game_lobby_id=$1", [
    game_lobby_id,
    buy_in,
  ]);
}

export async function updatePot(game_lobby_id: string, pot: number) {
  await db.none("UPDATE game_lobbies SET pot=$2 WHERE game_lobby_id=$1", [
    game_lobby_id,
    pot,
  ]);
}

export async function updateCommunityCards(
  game_lobby_id: string,
  flop_1: string,
  flop_2: string,
  flop_3: string,
  turn: string,
  river: string,
) {
  await db.none(
    `UPDATE game_lobbies SET
      flop_1=$2,
      flop_2=$3,
      flop_3=$4,
      turn=$5,
      river=$6
    WHERE game_lobby_id=$1`,
    [game_lobby_id, flop_1, flop_2, flop_3, turn, river],
  );
}

export async function updateRiver(game_lobby_id: string, river: string) {
  await db.none("UPDATE game_lobbies SET river=$2 WHERE game_lobby_id=$1", [
    game_lobby_id,
    river,
  ]);
}

export async function updateTurn(game_lobby_id: string, turn: string) {
  await db.none("UPDATE game_lobbies SET turn=$2 WHERE game_lobby_id=$1", [
    game_lobby_id,
    turn,
  ]);
}

export async function updateTurnsByOne(gameLobbyID: string) {
  db.none(
    "UPDATE game_lobbies SET turns = turns + 1 WHERE game_lobby_id = $1",
    [gameLobbyID],
  );
}

export async function updateTurnsToZero(gameLobbyID: string) {
  db.none("UPDATE game_lobbies SET turns = 0 WHERE game_lobby_id = $1", [
    gameLobbyID,
  ]);
}

export async function resetGame(game_lobby_id: string) {
  const RESET_SQL = `
    UPDATE game_lobbies
    SET pot=0, call_amount=0, flop_1=NULL, flop_2=NULL, flop_3=NULL, river=NULL, turn=NULL
    WHERE game_lobby_id=$1`;

  await db.none(RESET_SQL, [game_lobby_id]);
}

type CommunityCards = {
  flop_1: {
    value: string;
    suit: string;
  };
  flop_2: {
    value: string;
    suit: string;
  };
  flop_3: {
    value: string;
    suit: string;
  };
  turn: {
    value: string;
    suit: string;
  };
  river: {
    value: string;
    suit: string;
  };
};

export async function getCommunityCards(
  gameID: string,
): Promise<CommunityCards | null> {
  const query = `
    SELECT
      c1.value AS flop_1_value, c1.suit AS flop_1_suit,
      c2.value AS flop_2_value, c2.suit AS flop_2_suit,
      c3.value AS flop_3_value, c3.suit AS flop_3_suit,
      c4.value AS turn_value, c4.suit AS turn_suit,
      c5.value AS river_value, c5.suit AS river_suit
    FROM game_lobbies AS l
    INNER JOIN cards AS c1 ON l.flop_1 = c1.game_card_id
    INNER JOIN cards AS c2 ON l.flop_2 = c2.game_card_id
    INNER JOIN cards AS c3 ON l.flop_3 = c3.game_card_id
    INNER JOIN cards AS c4 ON l.turn = c4.game_card_id
    INNER JOIN cards AS c5 ON l.river = c5.game_card_id
    WHERE l.game_lobby_id = $1
    LIMIT 1
  `;

  const result = await db.oneOrNone(query, [gameID]);

  if (!result) return null;

  return {
    flop_1: {
      value: result.flop_1_value,
      suit: result.flop_1_suit,
    },
    flop_2: {
      value: result.flop_2_value,
      suit: result.flop_2_suit,
    },
    flop_3: {
      value: result.flop_3_value,
      suit: result.flop_3_suit,
    },
    turn: {
      value: result.turn_value,
      suit: result.turn_suit,
    },
    river: {
      value: result.river_value,
      suit: result.river_suit,
    },
  };
}
