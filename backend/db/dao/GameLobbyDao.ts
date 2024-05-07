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

export async function updateFlops(
  game_lobby_id: string,
  flop_1: string,
  flop_2: string,
  flop_3: string,
) {
  await db.none(
    "UPDATE game_lobbies SET flop_1=$2, flop_2=$3, flop_3=$4 WHERE game_lobby_id=$1",
    [game_lobby_id, flop_1, flop_2, flop_3],
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
  db.none('UPDATE game_lobbies SET turns = turns + 1 WHERE game_lobby_id = $1', [gameLobbyID]);
}

export async function updateTurnsToZero(gameLobbyID: string) {
  db.none('UPDATE game_lobbies SET turns = 0 WHERE game_lobby_id = $1', [gameLobbyID]);
}

export async function resetGame(game_lobby_id: string) {
  const RESET_SQL = `
    UPDATE game_lobbies
    SET pot=0, call_amount=0, flop_1=NULL, flop_2=NULL, flop_3=NULL, river=NULL, turn=NULL
    WHERE game_lobby_id=$1`;

  await db.none(RESET_SQL, [game_lobby_id]);
}
