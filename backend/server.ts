import path from "path";
import "dotenv/config.js";
import { createServer } from "http";
import express from "express";
import * as routes from "@backend/routes/index.js";
import createError from "http-errors";
import { requestTime } from "@backend/middleware/timestamp.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { setUpDevEnv } from "@backend/utilities/set-up-dev-env.js";
import connectLiveReload from "connect-livereload";
import expressSession from "express-session";
import { User } from "@backend/db/dao/UserDao";
import { authenticated } from "@backend/middleware/authenticated";
import connectPgSimple from "connect-pg-simple";
import { sessionLocals } from "@backend/middleware/session-locals";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

if (process.env.NODE_ENV == "development") {
  setUpDevEnv();
  connectLiveReload();
  app.use(morgan("dev"));
}

declare module "express-session" {
  interface SessionData {
    user: User;
  }
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const sessionMiddleware = expressSession({
  store: new (connectPgSimple(expressSession))({
    createTableIfMissing: true,
  }),
  resave: true,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || "SECRET-KEY-PLS-CHANGE",
});

app.use(sessionMiddleware);

app.set("views", path.join("backend", "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join("backend", "static")));

app.use(requestTime);

const io = new Server(httpServer);
io.engine.use(sessionMiddleware);
app.set("io", io);

io.on("connection", (socket: Socket) => {
  // @ts-expect-error can't get rid of session error
  const sessionId = socket.request.session.id;

  console.log("connection: " + sessionId);

  socket.join(sessionId);
});

app.use("/", routes.rootRoutes);
app.use("/auth", routes.authRoutes);

app.use(authenticated);
app.use("/home", routes.homeRoutes);
app.use("/game", routes.gameRoutes);
app.use("/chat", routes.chatRoutes);
app.use(sessionLocals);
app.use((_request, _response, next) => {
  next(createError(404));
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
