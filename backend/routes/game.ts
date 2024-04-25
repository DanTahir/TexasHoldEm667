import { Views } from "@backend/views";
import express, { Router, Request, Response, NextFunction } from "express";
import { Player, createPlayer } from "@backend/db/dao/PlayerDao";
import { createLobby } from "@backend/db/dao/GameLobbyDao";
import { CreateRequestBody } from "@backend/types";
import { gameValidation } from "@backend/middleware/game-validation";
export const router: Router = express.Router();

router.get("/", (_request: Request, response: Response, _next) => {
  response.render(Views.GameLobby, {
    buttonText: "test",
    gameName: "Game Name",
  });
});

router.get("/:id", gameValidation);

// Game exists render the page
router.get(
  "/:id",
  async (request: Request, response: Response, _next: NextFunction) => {
    try {
      return response.render(Views.GameLobby, {
        gameName: request.body.name,
      });
    } catch (error) {
      return response.status(500).send("error!");
    }
  },
);

router.post(
  "/create",
  async (request: Request, response: Response, _next: NextFunction) => {
    try {
      const requestBody: CreateRequestBody = request.body;

      const name: string = requestBody.name;
      const stake: number = requestBody.stake;
      const user_id: string = requestBody.user_id;

      const { game_lobby_id } = await createLobby(name);
      console.log("GAME LOBBY ID:", game_lobby_id);

      const playerObject: Player = {
        status: "spectating",
        stake,
        play_order: 1,
        user_id,
        game_lobby_id,
      };
      await createPlayer(playerObject);

      return response.redirect(`/game/${game_lobby_id}`);
    } catch (error) {
      return response.status(500).json({ error });
    }
  },
);
