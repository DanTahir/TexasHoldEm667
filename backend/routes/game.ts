import { Views } from "@backend/views";
import express, { Router } from "express";
import { createLobby } from "@backend/db/dao/GameLobbyDao";
import { Player, createPlayer } from "@backend/db/dao/PlayerDao";
import { CreateRequestBody } from "@backend/types";
export const router: Router = express.Router();

router.get("/", (_request, response, _next) => {
  response.render(Views.GameLobby, {
    buttonText: "test",
    gameName: "Game Name",
  });
});

router.post("/create", async (request, response, _next) => {
  try {
    const requestBody: CreateRequestBody = request.body;

    const name: string = requestBody.name;
    const stake: number = requestBody.stake;
    const user_id: string = requestBody.user_id;

    const { game_lobby_id } = await createLobby(name);

    const playerObject: Player = {
      status: "spectating",
      stake,
      play_order: 1,
      user_id,
      game_lobby_id,
    };
    const { player_id } = await createPlayer(playerObject);

    return response.status(200).send({ game_lobby_id, player_id });
  } catch (error) {
    return response.status(500).json({ error });
  }
});
