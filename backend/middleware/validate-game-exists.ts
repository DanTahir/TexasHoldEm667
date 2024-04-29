import { GameLobby, getGameLobbyById } from "@backend/db/dao/GameLobbyDao";
import { Request, Response, NextFunction } from "express";

export async function validateGameExists(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const gameLobby: GameLobby = await getGameLobbyById(request.params.id);

    request.body = {
      name: gameLobby.name,
    };

    next();
  } catch (error) {
    return response.redirect("/home");
  }
}
