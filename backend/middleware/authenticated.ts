import { Screens } from "@backend/views";
import { Request, Response, NextFunction } from "express";

export function authenticated(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (request.session.user) {
    response.locals.user = {
      ...request.session.user,
    };

    next();
  } else {
    if (process.env.NODE_ENV == "api_development") {
      return next();
    }

    response.redirect(Screens.Login);
  }
}
