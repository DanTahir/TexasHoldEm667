import pgPromise from "pg-promise";
import signale from "signale";

const pgp = pgPromise({
  connect(e) {
    const cp = e.client.connectionParameters;
    signale.success("Connected to database: ", cp.database);
  },
});

if (!process.env.DATABASE_URL) {
  throw Error("DATABASE_URL is not defined");
}

export const db = pgp(process.env.DATABASE_URL);
