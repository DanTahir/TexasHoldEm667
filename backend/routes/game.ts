import { Screens, Views } from "@backend/views";
import express, { Router, Request, Response, NextFunction } from "express";
import { Player, createPlayer } from "@backend/db/dao/PlayerDao";
import { createLobby } from "@backend/db/dao/GameLobbyDao";
import { TypedRequestBody } from "@backend/types";
import { validateGameExists } from "@backend/middleware/validate-game-exists";
import { ConstraintError } from "@backend/error/ConstraintError";
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
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      response.render(Views.GameLobby, {
        gameName: request.body.name,
      });
    } catch (error) {
      next(error);
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
    const requestBody: CreateRequestPayload = request.body;

    const name: string = requestBody.name;
    const stake: number = requestBody.stake;
    const user_id: string = request.session.user.id;

    try {
      const game_lobby_id = await createLobby(name, stake);

      const playerObject: Player = {
        status: "spectating",
        stake,
        play_order: 1,
        user_id,
        game_lobby_id,
      };
      await createPlayer(playerObject);

      response.redirect(`/game/${game_lobby_id}`);
    } catch (error) {
      let message;

      if ((error as ConstraintError)?.constraint == "game_lobbies_name_key") {
        message = "Name already in use";
      } else {
        message = "Failed to create game";
      }

      const formData = {
        message,
        name,
        stake,
      };

      request.session.form = formData;

      response.redirect(Screens.Home);
    }
  },
);
