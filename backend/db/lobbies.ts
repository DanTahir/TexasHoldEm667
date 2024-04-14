import { UUID } from 'crypto';
import db from './connection';

const CREATE = 'INSERT INTO game_lobbies DEFAULT RETURNING id';
const DESTROY = 'DELETE FROM game_lobbies where id=$1';
const GET_GAME = 'SELECT * FROM game_lobbies where id=$1';
const SET_PLAYER = 'UPDATE game_lobbies SET current_player=$2 WHERE id=$1';
const SET_DEALER = 'UPDATE game_lobbies SET dealer=$2 WHERE id=$1';
const SET_GAME_STAGE = 'UPDATE game_lobbies SET game_stage=$2 WHERE id=$1';
const SET_BUY_IN = 'UPDATE game_lobbies SET buy_in=$2 WHERE id=$1';
const SET_POT = 'UPDATE game_lobbies SET pot=$2 WHERE id=$1';
const SET_FLOPS = 'UPDATE game_lobbies SET flop_1=$2, flop_2=$3, flop_3=$4 WHERE id=$1';
const SET_RIVER = 'UPDATE game_lobbies SET river=$2 WHERE id=$1';
const SET_TURN = 'UPDATE game_lobbies SET turn=$2 WHERE id=$1';
const RESET_GAME = `UPDATE game_lobbies
                    SET pot=0, call_amount=0, flop1=NULL, flop2=NULL, flop3=NULL, river=NULL, turn=NULL
                    WHERE id=$1`;

const create = (): Promise<any> => db.one(CREATE);

const destroy = (lobbyId: UUID): Promise<any> => db.one(DESTROY, [lobbyId]);

const get_game = (lobbyId: UUID): Promise<any> => db.one(GET_GAME, [lobbyId]);

const set_current_player = (lobbyId: UUID, nextPlayerId: UUID): Promise<any> => db.one(SET_PLAYER, [lobbyId, nextPlayerId]);

const set_dealer = (lobbyId: UUID, newDealerId: UUID): Promise<any> => db.one(SET_DEALER, [lobbyId, newDealerId]);

const set_game_stage = (lobyId: UUID, gameStage: string): Promise<any> => db.one(SET_GAME_STAGE, [lobyId, gameStage]);

const set_buy_in = (lobbyId: UUID, buyIn: BigInt): Promise<any> => db.one(SET_BUY_IN, [lobbyId, buyIn]);

const set_pot = (lobbyId: UUID, newPot: BigInt): Promise<any> => db.one(SET_POT, [lobbyId, newPot])

const set_flops = (lobbyId: UUID, flop1: Number, flop2: Number, flop3: Number): Promise<any> => db.one(SET_FLOPS, [lobbyId, flop1, flop2, flop3]);

const set_river = (lobbyId: UUID, river: Number): Promise<any> => db.one(SET_RIVER, [lobbyId, river]);

const set_turn = (lobbyId: UUID, turn: Number): Promise<any> => db.one(SET_TURN, [lobbyId, turn]);

const reset_game = (lobbyId: UUID): Promise<any> => db.one(RESET_GAME, [lobbyId]);

module.exports = {
    create,
    destroy,
    get_game,
    set_current_player,
    set_dealer,
    set_game_stage,
    set_buy_in,
    set_pot,
    set_flops,
    set_river,
    set_turn,
    reset_game
}