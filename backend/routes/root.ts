import express from "express";

export const router = express.Router();

router.get("/", (_request, response, _next) => {
  const name = "Steve";
  response.render("root", { name });
});
