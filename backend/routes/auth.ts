import { createUser } from "@backend/db/dao/UserDao.js";
import { User, readUserFromUsername } from "@backend/db/dao/UserDao";
import { TypedRequestBody } from "@backend/types";
import express, { Router } from "express";
import bcrypt from "bcrypt";
import signale from "signale";

export const router: Router = express.Router();

router.get("/register", (_req, res) => {
  res.render("auth/register");
});

type NewUserPayload = {
  email: string;
  password: string;
  username: string;
};

router.post("/register", async (req: TypedRequestBody<NewUserPayload>, res) => {
  const { username, password, email } = req.body;

  const hashed_pw = bcrypt.hashSync(password, 13);

  try {
    await createUser({
      email,
      username,
      password: hashed_pw,
    });

    signale.info(`created user ${username}`);
  } catch (error) {
    signale.error("error creating user:", error);
    res.render("auth/register", {
      errorMessage: "Error creating user. Try again.",
    });
    return;
  }

  res.redirect("/auth/login?registered=true");
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
    return;
  }

  const registered = req.query.registered === "true";

  res.render("auth/login", { registered });
});

type UsernamePasswordPayload = {
  username: string;
  password: string;
};

router.post(
  "/login",
  async (req: TypedRequestBody<UsernamePasswordPayload>, res) => {
    const { username, password } = req.body;

    let user: User | null = null;
    try {
      user = await readUserFromUsername(username);
    } catch (error) {
      res.render("auth/login", { message: "Error logging in. Try again." });
      return;
    }

    if (!user) {
      res.render("auth/login", { message: "Username not found." });
      return;
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.render("auth/login", { message: "Incorrect password." });
      return;
    }

    signale.info(`logged in as user ${username}`);

    req.session.user = user;

    res.redirect("/home");
  },
);

router.get("/logout", (request, response, next) => {
  request.session.user = undefined;
  request.session.save((error) => {
    if (error) {
      next(error);
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
      }

      response.redirect("/auth/login");
    });
  });
});
