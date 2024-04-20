import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (_req, res) => {
  res.render("home");
});
