import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (_request, response, _next) => {
  // response.send("hello");
  response.render("game-lobby/game-lobby", {
    buttonText: "test",
  });
});
