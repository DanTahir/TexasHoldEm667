import { db } from "@backend/db/connection.js";
import { User } from "./UserDao";
import { suit } from "./CardDao";

export type PlayerStatus = "playing" | "folded" | "all-in" | "spectating";

export type Player = {
  player_id: string;
  status: PlayerStatus;
  stake: number;
  bet: number;
  play_order: number;
  user_id: string;
  game_lobby_id: string;
  card_1?: string;
  card_2?: string;
};

export type CreatePlayerPayload = {
  userID: string;
  status: PlayerStatus;
  gameLobbyID: string;
  playOrder: number;
  stake: number;
};

export type PlayerWithUserInfo = User & Player;

export async function createPlayer(
  player: CreatePlayerPayload,
): Promise<string> {
  const CREATE_PLAYER_SQL =
    "INSERT INTO players (user_id, status, game_lobby_id, play_order, stake) VALUES ($1, $2, $3, $4, $5) RETURNING player_id";
  const { userID, status, gameLobbyID, playOrder, stake } = player;

  const { player_id } = await db.one(CREATE_PLAYER_SQL, [
    userID,
    status,
    gameLobbyID,
    playOrder,
    stake,
  ]);

  return player_id;
}

export async function getPlayersByLobbyId(gameLobbyID: string) {
  const players: Array<PlayerWithUserInfo> = await db.manyOrNone(
    `
      SELECT * FROM players AS p
        INNER JOIN users AS u
          ON u.id = p.user_id
        WHERE game_lobby_id=$1
        ORDER BY play_order ASC
    `,
    [gameLobbyID],
  );
  return players;
}

export async function getPlayersNotFolded(gameLobbyID: string) {
  const playersNotFolded: Array<PlayerWithUserInfo> = await db.manyOrNone(
    `
      SELECT * FROM players AS p
      INNER JOIN users AS u ON u.id = p.user_id
      WHERE status NOT IN ('folded', 'spectating')
      AND game_lobby_id=$1
      ORDER BY play_order ASC
    `,
    [gameLobbyID],
  );

  return playersNotFolded;
}

export async function getPlayersNotFoldedOrAllIn(gameLobbyID: string) {
  const playersNotFoldedOrAllIn: Array<PlayerWithUserInfo> =
    await db.manyOrNone(
      `
      SELECT * FROM players AS p
      INNER JOIN users AS u ON u.id = p.user_id
      WHERE status NOT IN ('folded', 'spectating', 'all-in')
      AND game_lobby_id=$1
      ORDER BY play_order ASC
    `,
      [gameLobbyID],
    );

  return playersNotFoldedOrAllIn;
}

export async function getPlayersNotSpectating(gameLobbyID: string) {
  const playersNotFolded: Array<PlayerWithUserInfo> = await db.manyOrNone(
    `
      SELECT * FROM players AS p
      INNER JOIN users AS u ON u.id = p.user_id
      WHERE status != 'spectating'
      AND game_lobby_id=$1
      ORDER BY play_order ASC
    `,
    [gameLobbyID],
  );

  return playersNotFolded;
}

export async function getPlayerByMaxBet(gameLobbyID: string) {
  const playerByMaxBet: PlayerWithUserInfo = await db.one(
    `
    SELECT * FROM players AS p
    INNER JOIN users AS u ON u.id = p.user_id
    WHERE game_lobby_id=$1
    ORDER BY p.bet DESC
    LIMIT 1
    `,
    [gameLobbyID],
  );

  return playerByMaxBet;
}

export async function getPlayerByUserAndLobbyId(
  user_id: string,
  game_lobby_id: string,
): Promise<PlayerWithUserInfo> {
  return await db.one(
    `
      SELECT * FROM players AS p
      INNER JOIN users AS u ON u.id = p.user_id 
      WHERE user_id=$1 AND game_lobby_id=$2
    `,
    [user_id, game_lobby_id],
  );
}

export async function getPlayerById(
  player_id: string,
): Promise<PlayerWithUserInfo> {
  return await db.one(
    `
      SELECT * FROM players AS p
      INNER JOIN users AS u ON u.id = p.user_id 
      WHERE player_id=$1
    `,
    [player_id],
  );
}

export async function getPlayerByGameIDAndPlayOrder(
  game_lobby_id: string,
  play_order: number,
) {
  const player: Player | null = await db.oneOrNone(
    "SELECT * FROM players WHERE game_lobby_id = $1 AND play_order = $2",
    [game_lobby_id, play_order],
  );
  return player;
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

export async function updateStatusUserAndLobby(
  user_id: string,
  game_lobby_id: string,
  status: string,
) {
  await db.none(
    "UPDATE players SET status=$3 WHERE user_id=$1 AND game_lobby_id=$2",
    [user_id, game_lobby_id, status],
  );
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

type PlayerHand = {
  userID: string;
  playerID: string;
  card1: {
    value: number;
    suit: suit;
  };
  card2: {
    value: number;
    suit: suit;
  };
};

export async function getPlayerCards(userID: string, gameID: string) {
  const query = `
    SELECT
      p.user_id, p.player_id, c1.game_card_id,
      c1.value AS value_1, c1.suit AS suit_1,
      c2.value AS value_2, c2.suit AS suit_2
    FROM players AS p
    INNER JOIN cards AS c1 ON p.card_1 = c1.game_card_id
    INNER JOIN cards AS c2 ON p.card_2 = c2.game_card_id
    WHERE
      p.user_id = $1
      AND p.game_lobby_id = $2
    LIMIT 1
  `;

  const result = await db.oneOrNone(query, [userID, gameID]);

  if (!result) return null;

  const formattedValue: PlayerHand = {
    userID,
    playerID: result.player_id,
    card1: {
      value: result.value_1,
      suit: result.suit_1,
    },
    card2: {
      value: result.value_2,
      suit: result.suit_2,
    },
  };

  return formattedValue;
}
