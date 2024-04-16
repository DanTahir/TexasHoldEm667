import pgPromise from "pg-promise";
import type { IDatabase } from "pg-promise";
import signale from "signale";
const pgp = pgPromise({
  connect(e) {
    const cp = e.client.connectionParameters;
    signale.success("Connected to database: ", cp.database);
  },
});
const db: IDatabase<string> = pgp(process.env.DATABASE_URL || "");

export default db;
