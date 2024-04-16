import express, { Router } from "express";

const router: Router = express.Router();

router.get("/", (_request, response, _next) => {
  const name = "Steve";
  //response.send()
  response.render("root", { name });
});

router.get("/game", (_request, response, _next) => {
  response.send("hello");
  // response.render("game-lobby/game-lobby");
});

export default router;

