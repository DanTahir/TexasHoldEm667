/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable("User", {
      user_id: "id",
      username: {
        type: "varchar(25)",
        notNull: true,
        unique: true,
      },
      email: {
        type: "varchar(256)",
        notNull: true,
        unique: true,
      },
      password: {
        type: "varchar(256)",
        notNull: true,
      },
      date_of_birth: {
        type: "date",
        notNull: true,
      },
      balance: {
        type: "integer",
        notNull: true,
        default: 10000,
      },
      profile_pic: {
        type: "varchar(256)",
      },
      created_at: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
    });
  };

  exports.down = (pgm) => {
    pgm.dropTable("User");
  };
