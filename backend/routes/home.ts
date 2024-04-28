import { getGames } from "@backend/middleware/get-games";
import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", getGames, (req, res) => {
  if (req.session.form) {
    const { message, name, stake } = req.session.form;
    req.session.form = undefined;

    res.render(Views.Home, { message, name, stake });
  } else {
    res.render(Views.Home);
  }
});
