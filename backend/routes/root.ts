import express from 'express'

const router = express.Router();

router.get('/', (_request, response, _next) => {
    const name = "Steve";
    //response.send()
    response.render('root', {name});
});

export default router;