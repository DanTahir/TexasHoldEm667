import express from 'express'

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_request, response, _next) => {
    response.send("Hello CSC 667");
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
});
