import express from 'express'

const router = express.Router();

router.get('/', (_request, response, _next) => {
    const name = "Steve";
    //response.send()
    response.render('root', {name});
});

router.get('/chat', (_request, response, _next) => {
    const name = "Steve";
    //response.send()
    response.render('chatboxtest', {name});
});

export default router;