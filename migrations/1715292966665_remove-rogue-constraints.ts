/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Drop default constraints for players.
  pgm.dropConstraint("players", "players_card_1_fkey");
  pgm.dropConstraint("players", "players_card_2_fkey");
  pgm.dropConstraint("players", "players_game_lobby_id_fkey");
  pgm.dropConstraint("players", "players_user_id_fkey");

  // Drop default constraints for game lobbies.
  pgm.dropConstraint("game_lobbies", "game_lobbies_current_player_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_dealer_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_flop_1_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_flop_2_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_flop_3_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_turn_fkey");
  pgm.dropConstraint("game_lobbies", "game_lobbies_river_fkey");

  // Drop default constraints for cards.
  pgm.dropConstraint("cards", "cards_game_lobby_id_fkey");

  // Remove the sessions table (we are using express-sessions.);
  pgm.dropTable("sessions");
}

export async function down(_pgm: MigrationBuilder): Promise<void> {}
