/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createType('game_stage_enum', ['waiting', 'pre_flop', 'flop', 'turn', 'river']);

    pgm.createTable("Game", {
      game_id: "id",
      game_stage: {
        type: 'game_stage_enum',
        default: 'waiting',
      },  
      buy_in: {
        type: "int",
        notNull: true,
        default: 1000,
      },
      pot: {
        type: "int",
        notNull: true,
        default: 0,
      },
      big_blind: {
        type: "int",
        notNull: true,
        default: 50,
      },
      name: {
        type: "varchar(50)",
        notNull: true,
        unique: true,
      },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      dealer: {
        type: "int",
        references: "Player",
      },
      current_player: {
        type: "int",
        references: "Player",
      },
      flop_1: {
        type: "int",
        references: "Card",
      },
      flop_2: {
        type: "int",
        references: "Card",
      },
      flop_3: {
        type: "int",
        references: "Card",
      },
      turn: {
        type: "int",
        references: "Card",
      },
      river: {
        type: "int",
        references: "Card",
      },
    });




  };

  exports.down = (pgm) => {
    pgm.dropTable("Game");
  };
