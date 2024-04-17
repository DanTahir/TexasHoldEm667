import express from "express";

export const router = express.Router();

router.get("/", (_request, response, _next) => {
  const name: string = "Steve";
  response.render("root", { name });
});

router.get("/chat", (_request, response, _next) => {
  const name: string = "Steve";
  response.render("chatboxtest", { name });
});
