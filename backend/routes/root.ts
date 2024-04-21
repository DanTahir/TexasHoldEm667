import express from "express";

export const router = express.Router();

router.get("/", (_req, res) => {
  res.redirect("/auth/login");
});

router.get("/chat", (_request, response, _next) => {
  const name: string = "Josh";
  //response.send()
  response.render("chatboxtest", { name });
});

export default router;
