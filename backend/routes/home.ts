import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (req, res) => {
  const message = req.query?.message;
  const name = req.query?.name;
  const stake = req.query?.stake;

  res.render(Views.Home, { message, name, stake });
});
