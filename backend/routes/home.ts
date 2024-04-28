import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (req, res) => {
  if (req.session.form) {
    const { message, name, stake } = req.session.form;
    req.session.form = undefined;

    res.render(Views.Home, { message, name, stake });
  } else {
    res.render(Views.Home);
  }
});
