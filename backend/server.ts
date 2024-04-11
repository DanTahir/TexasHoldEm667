import path from "path";
import express from 'express';
import rootRoutes from './routes/root';
import createError from "http-errors";
import {requestTime} from "./middleware/timestamp"

const app = express();
const PORT = process.env.PORT || 3000;

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