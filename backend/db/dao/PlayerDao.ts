import { db } from "@backend/db/connection.js";

export interface Player {
  player_id?: {
    player_id: string;
  };
  status?: string;
  stake: number;
  bet?: number;
  play_order: number;
  user_id: string;
  game_lobby_id: string;
  card_1?: string;
  card_2?: string;
}

export async function createPlayer(
  player: Player,
): Promise<{ player_id: string }> {
  const CREATE_PLAYER_SQL =
    "INSERT INTO players (user_id, status, game_lobby_id, play_order, stake) VALUES ($1, $2, $3, $4, $5) RETURNING player_id";
  const { user_id, status, game_lobby_id, play_order, stake } = player;

  return await db.one(CREATE_PLAYER_SQL, [
    user_id,
    status,
    game_lobby_id,
    play_order,
    stake,
  ]);
}

export async function getPlayersByLobbyId(
  game_lobby_id: string,
): Promise<Player[] | null> {
  return await db.manyOrNone(
    "SELECT * FROM players WHERE game_lobby_id=$1 ORDER by play_order ASC",
    [game_lobby_id],
  );
}

export async function getPlayerByUserAndLobbyId(
  user_id: string,
  game_lobby_id: string,
): Promise<Player> {
  return await db.one(
    "SELECT * FROM players WHERE user_id=$1 AND game_lobby_id=$2",
    [user_id, game_lobby_id],
  );
}

export async function getPlayerById(player_id: string): Promise<Player> {
  return await db.one("SELECT * FROM players WHERE player_id=$1", [player_id]);
}

export async function removePlayerByPlayerId(player_id: string) {
  await db.none("DELETE FROM players WHERE player_id=$1", [player_id]);
}

export async function removePlayerByUserAndLobbyId(
  user_id: string,
  game_lobby_id: string,
) {
  await db.none("DELETE FROM players WHERE user_id=$1 AND game_lobby_id=$2", [
    user_id,
    game_lobby_id,
  ]);
}

export async function updateStake(player_id: string, stake: number) {
  await db.none("UPDATE players SET stake=$2 WHERE player_id=$1", [
    player_id,
    stake,
  ]);
}

export async function updateBet(player_id: string, bet: number) {
  await db.none("UPDATE players SET bet=$2 WHERE player_id=$1", [
    player_id,
    bet,
  ]);
}

export async function updatePlayOrder(player_id: string, playOrder: number) {
  await db.none("UPDATE players SET play_order=$2 WHERE player_id=$1", [
    player_id,
    playOrder,
  ]);
}

export async function updateStatus(player_id: string, status: string) {
  await db.none("UPDATE players SET status=$2 WHERE player_id=$1", [
    player_id,
    status,
  ]);
}

export async function updateCards(
  player_id: string,
  card_1: string,
  card_2: string,
) {
  await db.none("UPDATE players SET card_1=$2, card_2=$3 WHERE player_id=$1", [
    player_id,
    card_1,
    card_2,
  ]);
}

export async function updatePlayer(player: Player) {
  const { status, stake, bet, play_order, card_1, card_2, player_id } = player;

  if (player_id == undefined) {
    throw new Error("player_id is needed to update players");
  }

  const UPDATE_PLAYER_SQL = `
    UPDATE players SET
        status=$1,
        stake=$2,
        bet=$3,
        play_order=$4,
        card_1=$5,
        card_2?=$6
    WHERE player_id=$7
    `;

  await db.none(UPDATE_PLAYER_SQL, [
    status,
    stake,
    bet ? bet : 0,
    play_order,
    card_1 ? card_1 : null,
    card_2 ? card_2 : null,
    player_id,
  ]);
}
