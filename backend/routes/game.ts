import { Views } from "@backend/views";
import express, { Router } from "express";

export const router: Router = express.Router();

router.get("/", (_request, response, _next) => {
  response.render(Views.GameLobby, {
    buttonText: "test",
    gameName: "Game Name",
  });
});
