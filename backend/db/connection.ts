import * as pgPromise from "pg-promise";
import type { IDatabase, IMain } from "pg-promise";

const pgp: IMain = pgPromise();
const db: IDatabase<string> = pgp(process.env.LOCAL_DATABASE_URL || "");

export default db;

