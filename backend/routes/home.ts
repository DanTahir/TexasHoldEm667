import { getRecentGames } from "@backend/db/dao/GameLobbyDao";
import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", async (req, res, next) => {
  let games;

  try {
    games = await getRecentGames();
  } catch (error) {
    next(error);
  }

  if (req.session.form) {
    const { message, name, stake } = req.session.form;
    req.session.form = undefined;

    res.render(Views.Home, { games, message, name, stake });
  } else {
    res.render(Views.Home, { games });
  }
});
