import db from '../connection';

export interface GameLobby {
    game_lobby_id: String,
    name: String,
    game_stage: String,
    buy_in: BigInt,
    pot: BigInt,
    big_blind: BigInt,
    dealer?: String,
    current_player?: String,
    flop_1?: String,
    flop_2?: String,
    flop_3?: String,
    turn?: String,
    river?: String
}

export async function createLobby(name: String): Promise<String> {
    return await db.one('INSERT INTO game_lobbies (name) VALUES ($1) RETURNING game_lobby_id', [name]);
}

export async function deleteLobby(game_lobby_id: String) {
    await db.none('DELETE FROM game_lobbies WHERE game_lobby_id=$1', [game_lobby_id]);
} 

export async function getGameLobbyById(lobbyId: String): Promise<GameLobby> {
    return await db.one('SELECT * FROM game_lobbies WHERE game_lobby_id=$1', [lobbyId]);
}

export async function getGameLobbyByName(name: String): Promise<GameLobby> {
    return await db.one('SELECT * FROM game_lobbies WHERE name=$1', [name]);
} 

export async function getRecentGames(): Promise<GameLobby[] | null> {
    return await db.manyOrNone('SELECT * FROM game_lobbies ORDER BY created_at DESC LIMIT 10');
} 

export async function updateCurrentPlayer(game_lobby_id: String, player_id: String) {
    await db.none('UPDATE game_lobbies SET current_player=$2 WHERE game_lobby_id=$1', [game_lobby_id, player_id]);
}

export async function updateDealer(game_lobby_id: String, player_id: String) {
    await db.none('UPDATE game_lobbies SET dealer=$2 WHERE game_lobby_id=$1', [game_lobby_id, player_id]);
}

export async function updateGameStage(game_lobby_id: String, game_stage: string) {
    await db.none('UPDATE game_lobbies SET game_stage=$2 WHERE game_lobby_id=$1', [game_lobby_id, game_stage]);
}

export async function updateBuyIn(game_lobby_id: String, buy_in: BigInt) {
    await db.none('UPDATE game_lobbies SET buy_in=$2 WHERE game_lobby_id=$1', [game_lobby_id, buy_in]);
}

export async function updatePot(game_lobby_id: String, pot: BigInt) {
    await db.none('UPDATE game_lobbies SET pot=$2 WHERE game_lobby_id=$1', [game_lobby_id, pot]);
}

export async function updateFlops(game_lobby_id: String, flop_1: String, flop_2: String, flop_3: String) {
    await db.none('UPDATE game_lobbies SET flop_1=$2, flop_2=$3, flop_3=$4 WHERE game_lobby_id=$1', [game_lobby_id, flop_1, flop_2, flop_3]);
}

export async function updateRiver(game_lobby_id: String, river: String) {
    await db.none('UPDATE game_lobbies SET river=$2 WHERE game_lobby_id=$1', [game_lobby_id, river]);
}

export async function updateTurn(game_lobby_id: String, turn: String) {
    await db.none('UPDATE game_lobbies SET turn=$2 WHERE game_lobby_id=$1', [game_lobby_id, turn]);
}

export async function resetGame(game_lobby_id: String) {
    const RESET_SQL = `
    UPDATE game_lobbies
    SET pot=0, call_amount=0, flop_1=NULL, flop_2=NULL, flop_3=NULL, river=NULL, turn=NULL
    WHERE game_lobby_id=$1`

    await db.none(RESET_SQL, [game_lobby_id]);
}
