import { db } from "@backend/db/connection.js";

export interface GameLobby {
  game_lobby_id: string;
  name: string;
  game_stage: string;
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
}

export async function createLobby(name: string): Promise<string> {
  return await db.one(
    "INSERT INTO game_lobbies (name) VALUES ($1) RETURNING game_lobby_id",
    [name],
  );
}

export async function deleteLobby(game_lobby_id: string) {
  await db.none("DELETE FROM game_lobbies WHERE game_lobby_id=$1", [
    game_lobby_id,
  ]);
}

export async function getGameLobbyById(lobbyId: string): Promise<GameLobby> {
  return await db.one("SELECT * FROM game_lobbies WHERE game_lobby_id=$1", [
    lobbyId,
  ]);
}

export async function getGameLobbyByName(name: string): Promise<GameLobby> {
  return await db.one("SELECT * FROM game_lobbies WHERE name=$1", [name]);
}

export async function getRecentGames(): Promise<GameLobby[] | null> {
  return await db.manyOrNone(
    "SELECT * FROM game_lobbies ORDER BY created_at DESC LIMIT 10",
  );
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
  game_stage: string,
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

export async function resetGame(game_lobby_id: string) {
  const RESET_SQL = `
    UPDATE game_lobbies
    SET pot=0, call_amount=0, flop_1=NULL, flop_2=NULL, flop_3=NULL, river=NULL, turn=NULL
    WHERE game_lobby_id=$1`;

  await db.none(RESET_SQL, [game_lobby_id]);
}
