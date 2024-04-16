import db from '../connection';

export interface Player {
    player_id?: String,
    status: String,
    stake: Number,
    bet?: Number,
    play_order: Number,
    user_id: String,
    game_lobby_id: String,
    card_1?: String,
    card_2?: String
}

export async function createPlayer(player: Player): Promise<String | null> {
    const CREATE_PLAYER_SQL = 'INSERT INTO players (user_id, game_lobby_id, play_order, status, stake) VALUES ($1, $2, $3, $4, $5) RETURNING player_id';
    const {user_id, game_lobby_id, play_order, status, stake} = player;

    return await db.one(CREATE_PLAYER_SQL, [user_id, game_lobby_id, play_order, status, stake]);
}

export async function getPlayersByLobbyId(game_lobby_id: String): Promise<Player[] | null> {
    return await db.manyOrNone('SELECT * FROM players WHERE game_lobby_id=$1 ORDER by play_order ASC', [game_lobby_id])
}

export async function getPlayerByUserAndLobbyId(user_id: String, game_lobby_id: String): Promise<Player | null> {
    return await db.one('SELECT * FROM players WHERE user_id=$1 AND game_lobby_id=$2', [user_id, game_lobby_id]);
}

export async function getPlayerById(player_id: String): Promise<Player | null> {
    return await db.one('SELECT * FROM players WHERE player_id=$1', [player_id])
}

export async function removePlayerByPlayerId(player_id: String): Promise<Boolean | null> {
    await db.none('DELETE FROM players WHERE player_id=$1', [player_id]);
    return true;
}

export async function removePlayerByUserAndLobbyId(user_id: String, game_lobby_id: String): Promise<Boolean | null> {
    await db.none('DELETE FROM players WHERE user_id=$1 AND game_lobby_id=$2', [user_id, game_lobby_id]);
    return true;
}

export async function updateStake(player_id: String, stake: Number): Promise<Boolean | null> {
    await db.none('UPDATE players SET stake=$2 WHERE player_id=$1', [player_id, stake]);
    return true;
}

export async function updateBet(player_id: String, bet: number): Promise<Boolean | null> {
    await db.none('UPDATE players SET bet=$2 WHERE player_id=$1', [player_id, bet]);
    return true;
}

export async function updatePlayOrder(player_id: String, playOrder: Number): Promise<Boolean | null> {
    await db.none('UPDATE players SET play_order=$2 WHERE player_id=$1', [player_id, playOrder]);
    return true;
}

export async function updateStatus(player_id: String, status: string): Promise<Boolean | null> {
    await db.none('UPDATE players SET status=$2 WHERE player_id=$1', [player_id, status]);
    return true;
}

export async function updateCards(player_id: String, card_1: String, card_2: String): Promise<Boolean | null> {
    await db.none('UPDATE players SET card_1=$2, card_2=$3 WHERE player_id=$1', [player_id, card_1, card_2])
    return true;
}

export async function updatePlayer(player: Player): Promise<Boolean | null> {
    const {status, stake, bet, play_order, card_1, card_2, player_id} = player;

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
    `

    await db.none(UPDATE_PLAYER_SQL, [status, stake, bet? bet : 0, play_order, card_1? card_1 : null, card_2? card_2 : null, player_id]);
    return true;
}