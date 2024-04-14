import { UUID } from 'crypto';
import db from './connection';

const CREATE_CARD = 'INSERT INTO cards (game, suit, value) VALUES ($1, $2, $3)';
const REMOVE_CARD = 'DELETE FROM cards WHERE card_id=$1'
const SET_PLAY_ORDER = 'UPDATE cards SET play_order=$2 WHERE card_id=$1'

const create = (lobbyId: UUID, suit: string, value: Number): Promise<any> => db.one(CREATE_CARD, [lobbyId, suit, value]);

const remove = (cardId: Number): Promise<any> => db.one(REMOVE_CARD, [remove]);

const set_play_order = (cardId: Number, playOrder: Number): Promise<any> => db.one(SET_PLAY_ORDER, [cardId, playOrder]);

module.exports = {
    create,
    remove,
    set_play_order
}