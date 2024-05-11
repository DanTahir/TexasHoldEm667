import { User } from "@backend/middleware/db/UserDao";
import { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    user: User;
  }

  interface FormRedirect {
    form: {
      message: string;
      [key: string]: number | string;
    };
  }
}

declare module "node:http" {
  interface IncomingMessage {
    session: Session & Partial<SessionData> & Partial<FormRedirect>;
    user: User;
  }
}
