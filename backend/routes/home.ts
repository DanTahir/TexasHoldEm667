import { getRecentGames } from "@backend/db/dao/GameLobbyDao";
import { updateUserBalance, readUserFromID } from "@backend/db/dao/UserDao";
import { Views } from "@backend/views";
import express, { Router, Request } from "express";

export const router: Router = express.Router();

router.get("/", async (req: Request, res, next) => {
  let games;

  try {
    games = await getRecentGames();
  } catch (error) {
    next(error);
  }

  let userName = "";
  let userID = "";
  let balance = 0;
  if (req.session.user) {
    userName = req.session.user.username;
    userID = req.session.user.id;
    balance = req.session.user.balance;
  }
  let user;
  try {
    user = await readUserFromID(userID);
  } catch (error) {
    next(error);
  }
  if (user) {
    balance = user.balance;
  }

  console.log(`Hello from home - balance: ${balance}`);

  if (req.session.form) {
    const { message, name, stake } = req.session.form;
    req.session.form = undefined;

    res.render(Views.Home, { games, userName, balance, message, name, stake });
  } else {
    res.render(Views.Home, { games, userName, balance });
  }
});

router.post("/resetBalance", async (req: Request, res) => {
  const userName = req.session.user.username;
  await updateUserBalance(userName, 10000);
  console.log(`Hello from resetBalance - userName: ${userName}`);
  res.redirect("/home");
});
