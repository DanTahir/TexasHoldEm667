import { Request, Response, NextFunction } from "express";
import { getRecentGames } from "@backend/db/dao/GameLobbyDao";

export async function getGames(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.locals.games = await getRecentGames();
  } catch (error) {
    next(error);
  }
  next();
}
