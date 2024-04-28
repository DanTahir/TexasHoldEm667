import { User } from "@backend/middleware/db/UserDao";
import { FormInfo } from "@backend/types";
import { Session, SessionData } from "express-session";

declare module "express-session" {
  interface SessionData {
    user: User;
  }

  interface FormRedirect {
    form: FormInfo;
  }
}

declare module "node:http" {
  interface IncomingMessage {
    session: Session & Partial<SessionData> & Partial<FormRedirect>;
  }
}
