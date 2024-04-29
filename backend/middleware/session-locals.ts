import { Request, Response, NextFunction } from "express";

export function sessionLocals(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  response.locals.form = request.session?.form;
  response.locals.user = request.session.user;
  next();
}
