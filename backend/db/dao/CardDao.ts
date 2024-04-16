import db from '../connection';

export interface Card {
    game_card_id?: String
    game_lobby_id: String,
    card_id: Number,
    suit: String,
    value: Number,
    shuffled_order: Number
}

export async function createCard(card : Card): Promise<String | null> {
    return await db.one('INSERT INTO cards (game_lobby_id, card_id, suit, value, shuffled_order) VALUES ($1, $2, $3, $4, $5) RETURNING game_card_id', 
        [card.game_lobby_id, card.card_id, card.suit, card.value, card.shuffled_order]);
}

export async function getCardByGameCardId(game_card_id: String): Promise<Card | null> {
    return await db.one("SELECT * FROM cards WHERE game_card_id=$1", [game_card_id])
}

export async function getCardsByGame(game_lobby_id: String): Promise<Card[] | null> {
    return await db.manyOrNone('SELECT * FROM cards WHERE game_lobby_id=$1 ORDER BY shuffled_order ASC', [game_lobby_id])
}

export async function deleteCard(game_card_id: String): Promise<Boolean | null> {
    await db.none('DELETE FROM cards WHERE game_card_id=$1', [game_card_id]);
    return true;
}

export async function updatePlayOrder(game_card_id: Number, play_order: Number): Promise<Boolean | null> {
    await db.none('UPDATE cards SET play_order=$2 WHERE game_card_id=$1', [game_card_id, play_order]);
    return true;
} 
