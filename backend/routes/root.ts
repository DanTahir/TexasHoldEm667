import { Screens } from "@backend/views";
import express from "express";

export const router = express.Router();

router.get("/", (_req, res) => {
  res.redirect(Screens.Home);
});
