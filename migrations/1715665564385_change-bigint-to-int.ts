/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("game_lobbies", "pot", {
    type: "INT",
    using: "pot::INT", // Cast the existing values to integer
  });
  pgm.alterColumn("game_lobbies", "buy_in", {
    type: "INT",
    using: "buy_in::INT", // Cast the existing values to integer
  });
  pgm.alterColumn("game_lobbies", "big_blind", {
    type: "INT",
    using: "big_blind::INT", // Cast the existing values to integer
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.alterColumn("game_lobbies", "pot", {
    type: "bigint",
    using: "pot::bigint", // Cast the existing values to integer
  });
  pgm.alterColumn("game_lobbies", "buy_in", {
    type: "bigint",
    using: "buy_in::bigint", // Cast the existing values to integer
  });
  pgm.alterColumn("game_lobbies", "big_blind", {
    type: "bigint",
    using: "big_blind::bigint", // Cast the existing values to integer
  });
}
