import {
  MigrationBuilder,
  ColumnDefinitions,
  PgLiteral,
} from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("users", {
    id: {
      type: "UUID",
      primaryKey: true,
      default: new PgLiteral("gen_random_uuid()"),
    },
    username: {
      type: "TEXT",
      unique: true,
      notNull: true,
    },
    email: {
      type: "TEXT",
      unique: true,
      notNull: true,
    },
    password: {
      type: "BYTEA",
      notNull: true,
    },
    balance: {
      type: "INT",
      notNull: true,
    },
    profile_image: {
      type: "TEXT",
    },
    created_at: {
      type: "TIMESTAMP",
      notNull: true,
      default: new PgLiteral("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createTable("sessions", {
    id: {
      type: "SERIAL",
      primaryKey: true,
    },
    user_id: {
      type: "UUID",
      notNull: true,
    },
    cookie: {
      type: "TEXT",
      notNull: true,
    },
    expiry_date: {
      type: "TIMESTAMP",
      notNull: true,
      default: new PgLiteral("NOW() + '7 days'::INTERVAL"),
    },
  });

  pgm.createConstraint(
    {
      schema: "public",
      name: "sessions",
    },
    "sessions_user_id_fkey",
    {
      foreignKeys: {
        columns: "user_id",
        references: "public.users(id)",
      },
    },
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("users");
}
