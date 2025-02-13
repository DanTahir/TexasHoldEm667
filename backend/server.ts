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
import { authenticated } from "@backend/middleware/authenticated";
import connectPgSimple from "connect-pg-simple";
import { sessionLocals } from "@backend/middleware/session-locals";
import { sessionLocalsTyped } from "@backend/middleware/session-locals-typedBody";
import { Server, Socket } from "socket.io";
import cors from "cors";
import signale from "signale";

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

if (process.env.NODE_ENV == "development" || process.env.SKIP_AUTH) {
  setUpDevEnv();
  connectLiveReload();
  app.use(morgan("dev"));
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

const io = new Server(httpServer, {
  allowEIO3: false,
});
io.engine.use(sessionMiddleware);
app.set("io", io);

io.on("connection", (socket: Socket) => {
  let id;

  if (socket.request.session.user) {
    id = socket.request.session.user.id;
  } else {
    id = socket.request.session.id;
  }

  signale.info("connection: " + id);

  socket.join(id);
});

app.use("/", routes.rootRoutes);
app.use("/auth", routes.authRoutes);

app.use(authenticated);
app.use(sessionLocals);
app.use(sessionLocalsTyped);
app.use("/home", routes.homeRoutes, routes.chatRoutes);
app.use("/game", routes.gameRoutes, routes.chatRoutes);

app.use((_request, _response, next) => {
  next(createError(404));
});

httpServer.listen(PORT, () => {
  signale.info(`Server started on port ${PORT}`);
});
