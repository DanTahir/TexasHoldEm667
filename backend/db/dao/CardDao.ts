import { db } from "../connection.js";
import pgPromise from "pg-promise";

const pgp = pgPromise();

export type suit = "spades" | "clubs" | "hearts" | "diamonds";

export interface Card {
  game_card_id?: string;
  game_lobby_id: string;
  card_id: number;
  suit: suit;
  value: number;
  shuffled_order: number;
}

function initDeck(gameLobbyID: string): Card[] {
  const suits: suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const deck: Card[] = [];
  let i = 1;
  for (const suit of suits) {
    for (let value = 2; value <= 14; value++) {
      deck.push({
        game_lobby_id: gameLobbyID,
        card_id: i,
        suit,
        value,
        shuffled_order: 0,
      });
      i++;
    }
  }
  return deck;
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffledDeck = deck.slice();

  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  // Assign random order between 1 and 52 to each card
  shuffledDeck.forEach((card, index) => {
    card.shuffled_order = index + 1;
  });

  return shuffledDeck;
}

export async function createDeck(game_lobby_id: string) {
  try {
    const deck = shuffleDeck(initDeck(game_lobby_id));
    const cs = new pgp.helpers.ColumnSet(
      ["game_lobby_id", "card_id", "suit", "value", "shuffled_order"],
      { table: "cards" },
    );
    const values = deck.map((card) => ({
      game_lobby_id: card.game_lobby_id,
      card_id: card.card_id,
      suit: card.suit,
      value: card.value,
      shuffled_order: card.shuffled_order,
    }));

    const query = pgp.helpers.insert(values, cs);
    // Execute the INSERT statement
    await db.none(query);

    console.log("Deck of cards inserted successfully.");
  } catch (error) {
    console.error("Error inserting deck:", error);
  }
}

export async function deleteDeck(gameLobbyID: string) {
  return await db.none("DELETE FROM cards WHERE game_lobby_id = $1", [
    gameLobbyID,
  ]);
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
