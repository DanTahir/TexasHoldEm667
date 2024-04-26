import { Views } from "@backend/views";
import express, { Router, Request, Response, NextFunction } from "express";
import { Player, createPlayer } from "@backend/db/dao/PlayerDao";
import { createLobby } from "@backend/db/dao/GameLobbyDao";
import { TypedRequestBody } from "@backend/types";
import { validateGameExists } from "@backend/middleware/validate-game-exists";
export const router: Router = express.Router();

interface CreateRequestPayload {
  name: string;
  stake: number;
  user_id: string;
}

router.get("/:id", validateGameExists);

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
  async (
    request: TypedRequestBody<CreateRequestPayload>,
    response: Response,
    _next: NextFunction,
  ) => {
    try {
      const requestBody: CreateRequestPayload = request.body;

      const name: string = requestBody.name;
      const stake: number = requestBody.stake;
      const user_id: string = requestBody.user_id;

      const game_lobby_id = await createLobby(name);

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
