import { UUID } from 'crypto';
import db from './connection';

const CREATE_PLAYER = 'INSERT INTO players (user, room, play_order, status) VALUES ($1, $2, $3, $4)';
const GET_PLAYER = 'SELECT * FROM players WHERE user=$1 AND room=$2'
const REMOVE_PLAYER = 'DELETE FROM players WHERE user=$1 AND room=$2';
const SET_STAKE = 'UPDATE players SET stake=$3 WHERE user=$1 AND room=$2';
const SET_BET = 'UPDATE players SET bet=$3 WHERE user=$1 AND room=$2';
const SET_PLAY_ORDER = 'UPDATE players SET play_order=$3 WHERE user=$1 AND room=$2';
const SET_STATUS = 'UPDATE players SET status=$3 WHERE user=$1 AND room=$2';
const SET_CARDS = 'UPDATE players SET card1=$3, card2=$4 WHERE user=$1 AND room=$2';

const create = (userId: UUID, roomId: UUID, playOrder: Number, status: string): Promise<any> => db.one(CREATE_PLAYER, [userId, roomId, playOrder, status]);

const get_player = (userId: UUID, roomId: UUID): Promise<any> => db.one(GET_PLAYER, [userId, roomId]);

const remove = (userId: UUID, roomId: UUID): Promise<any> => db.one(REMOVE_PLAYER, [userId, roomId]);

const set_stake = (userId: UUID, roomId: UUID, stake: BigInt): Promise<any> => db.one(SET_STAKE, [userId, roomId, stake]);

const set_bet = (userId: UUID, roomId: UUID, bet: BigInt): Promise<any> => db.one(SET_BET, [userId, roomId, bet]);

const set_play_order = (userId: UUID, roomId: UUID, playOrder: Number): Promise<any> => db.one(SET_PLAY_ORDER, [userId, roomId, playOrder]);

const set_status = (userId: UUID, roomId: UUID, status: string): Promise<any> => db.one(SET_STATUS, [userId, roomId, status])

const set_cards = (userId: UUID, roomId: UUID, card1: Number, card2: Number): Promise<any> => db.one(SET_CARDS, [userId, roomId, card1, card2]);

module.exports = {
    create,
    get_player,
    remove,
    set_stake,
    set_bet,
    set_play_order,
    set_status,
    set_cards
}