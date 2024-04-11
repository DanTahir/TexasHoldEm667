import path from "path";
import express from 'express';
import rootRoutes from './routes/root';
import createError from "http-errors";
import {requestTime} from "./middleware/timestamp";
import {setUpDevEnv} from "./utilities/set-up-dev-env";
import connectLiveReload from "connect-livereload";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 3000;

if(process.env.NODE_ENV == 'development'){
    setUpDevEnv();
    connectLiveReload();
}

app.use(morgan("dev"));

app.set("views", path.join("backend", "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join("backend", "static")));

app.use(requestTime);

app.use("/", rootRoutes);

app.use((_request, _response, next) => {
    next(createError(404));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});