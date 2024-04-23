import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (_req, res) => {
  res.render(Views.Home);
});
