import { User } from "@backend/middleware/db/UserDao";
import { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

declare module "node:http" {
  interface IncomingMessage {
    session: Session & Partial<SessionData>;
  }
}
