/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions, PgLiteral } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {

    pgm.createType('game_stage_enum', ['waiting', 'preflop', 'flop', 'turn', 'river', 'final']); 
    pgm.createTable("game_lobbies", {
        game_lobby_id: {
            type: "UUID",
            primaryKey: true,
            default: new PgLiteral("gen_random_uuid()"),
        },
        name: {
            type: "text",
            unique: true,
            notNull: true
        },
        game_stage: {
            type: "game_stage_enum",
            notNull: true,
            default: "waiting",
        },
        buy_in: {
            type: "bigint",
            notNull: true,
            default: 1000
        },
        pot: {
            type: "bigint",
            notNull: true,
            default: 0
        },
        big_blind: {
            type: "bigint",
            notNull: true,
            default: 50
        },

    });
    

    pgm.createType('status_enum', ['playing', 'folded', 'all-in', 'spectating']); 
    pgm.createTable("players", {
        player_id: {
            type: "UUID",
            primaryKey: true,
            default: new PgLiteral("gen_random_uuid()"),
        },
        status: {
            type: "status_enum",
            notNull: true,
        },
        stake: {
            type: "INT",
            notNull: true,
        },
        bet: {
            type: "INT",
            notNull: true,
            default: 0
        },
        play_order: {
            type: "INT",
            notNull: true,
        },

    });

    pgm.createType('suit_enum', ['hearts', 'diamonds', 'clubs', 'spades']); 
    pgm.createTable("cards", {
        game_card_id: {
            type: "UUID",
            primaryKey: true,
            default: new PgLiteral("gen_random_uuid()"),
        },
        card_id: {
            type: "INT",
            notNull: true,
        },
        shuffled_order: {
            type: "INT"
        },
        value: {
            type: "INT",
            notNull: true,
        },
        suit: {
            type: "suit_enum",
            notNull: true
        }
    });


    pgm.addColumn('game_lobbies', {
        dealer: {
            type: "UUID",
            references: "players"
        },
        current_player: {
            type: "UUID",
            references: "players"
        },
        flop_1: {
            type: "UUID",
            references: "cards"
        },
        flop_2: {
            type: "UUID",
            references: "cards"
        },
        flop_3: {
            type: "UUID",
            references: "cards"
        },
        turn: {
            type: "UUID",
            references: "cards"
        },
        river: {
            type: "UUID",
            references: "cards"
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_dealer', {
        foreignKeys: {
          columns: 'dealer',
          references: 'players(player_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_current_player', {
        foreignKeys: {
          columns: 'current_player',
          references: 'players(player_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_flop_1', {
        foreignKeys: {
          columns: 'flop_1',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_flop_2', {
        foreignKeys: {
          columns: 'flop_2',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_flop_3', {
        foreignKeys: {
          columns: 'flop_3',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_turn', {
        foreignKeys: {
          columns: 'turn',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('game_lobbies', 'fk_lobby_river', {
        foreignKeys: {
          columns: 'river',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addColumn('players', {
        user_id: {
            type: "UUID",
            references: "users",
            notNull: true 
        },
        game_lobby_id: {
            type: "UUID",
            references: "game_lobbies",
            notNull: true 
        },
        card_1: {
            type: "UUID",
            references: "cards"
        },
        card_2: {
            type: "UUID",
            references: "cards"
        }
    });
    pgm.addConstraint('players', 'fk_player_user_id', {
        foreignKeys: {
          columns: 'user_id',
          references: 'users(id)',
          onDelete: 'CASCADE' 
        }
    });
    pgm.addConstraint('players', 'fk_player_game_lobby_id', {
        foreignKeys: {
          columns: 'game_lobby_id',
          references: 'game_lobbies(game_lobby_id)',
          onDelete: 'CASCADE' 
        }
    });
    pgm.addConstraint('players', 'fk_players_card_1', {
        foreignKeys: {
          columns: 'card_1',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addConstraint('players', 'fk_players_card_2', {
        foreignKeys: {
          columns: 'card_2',
          references: 'cards(game_card_id)',
          onDelete: 'SET NULL' 
        }
    });
    pgm.addColumn('cards', {
        game_lobby_id: {
            type: "UUID",
            references: "game_lobbies",
            notNull: true
        },
    });
    pgm.addConstraint('cards', 'fk_card_game_lobby_id', {
        foreignKeys: {
          columns: 'game_lobby_id',
          references: 'game_lobbies(game_lobby_id)',
          onDelete: 'CASCADE' 
        }
    });

}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumns('game_lobbies', [
        'dealer', 
        'current_player', 
        'flop_1', 
        'flop_2', 
        'flop_3', 
        'turn', 
        'river'
    ]);
    pgm.dropColumns('players', [
        'user_id', 
        'game_lobby_id', 
        'card_1', 
        'card_2'
    ]);
    pgm.dropColumns('cards', [
        'game_lobby_id', 
    ]);
    pgm.dropTable("game_lobbies");
    pgm.dropTable("players");
    pgm.dropTable("cards");
    pgm.dropType('game_stage_enum');
    pgm.dropType('status_enum');
    pgm.dropType('suit_enum');
}
