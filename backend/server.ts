import express from 'express';
import rootRoutes from './routes/root';
import createError from "http-errors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", rootRoutes);

app.use((_request, _response, next) => {
    next(createError(404));
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});