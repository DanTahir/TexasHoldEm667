import express from "express";

export const router = express.Router();

router.get("/", (_req, res) => {
  // TODO: redirect to home if valid session exists

  res.render("login");
});
