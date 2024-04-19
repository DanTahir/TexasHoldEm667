import { db } from "../connection.js";

export interface Card {
  game_card_id?: string;
  game_lobby_id: string;
  card_id: number;
  suit: string;
  value: number;
  shuffled_order: number;
}

export async function createCard(card: Card): Promise<string> {
  return await db.one(
    "INSERT INTO cards (game_lobby_id, card_id, suit, value, shuffled_order) VALUES ($1, $2, $3, $4, $5) RETURNING game_card_id",
    [
      card.game_lobby_id,
      card.card_id,
      card.suit,
      card.value,
      card.shuffled_order,
    ],
  );
}

export async function getCardByGameCardId(game_card_id: string): Promise<Card> {
  return await db.one("SELECT * FROM cards WHERE game_card_id=$1", [
    game_card_id,
  ]);
}

export async function getCardsByGame(
  game_lobby_id: string,
): Promise<Card[] | null> {
  return await db.manyOrNone(
    "SELECT * FROM cards WHERE game_lobby_id=$1 ORDER BY shuffled_order ASC",
    [game_lobby_id],
  );
}

export async function deleteCard(game_card_id: string) {
  await db.none("DELETE FROM cards WHERE game_card_id=$1", [game_card_id]);
}

export async function updatePlayOrder(
  game_card_id: number,
  play_order: number,
) {
  await db.none("UPDATE cards SET play_order=$2 WHERE game_card_id=$1", [
    game_card_id,
    play_order,
  ]);
}
