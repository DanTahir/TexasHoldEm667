import express from 'express'

const router = express.Router();

router.get('/', (_request, response, _next) => {
    response.send("Hello CSC 667 from inside a route");
});

export default router;