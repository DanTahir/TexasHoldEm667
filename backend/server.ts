import path from "path";
import "dotenv/config.js";
import express from "express";
import * as routes from "@backend/routes/index.js";
import createError from "http-errors";
import { requestTime } from "@backend/middleware/timestamp.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { setUpDevEnv } from "@backend/utilities/set-up-dev-env.js";
import connectLiveReload from "connect-livereload";
const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV == "development") {
  setUpDevEnv();
  connectLiveReload();
}

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("views", path.join("backend", "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join("backend", "static")));

app.use(requestTime);

app.use("/", routes.rootRoutes);
app.use("/test", routes.testRoutes);

app.use((_request, _response, next) => {
  next(createError(404));
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
