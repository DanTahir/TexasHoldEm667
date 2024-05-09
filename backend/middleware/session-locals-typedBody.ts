import { Response, NextFunction } from "express";
import { TypedRequestBody } from "../types";

export function sessionLocalsTyped<T>(
  request: TypedRequestBody<T>,
  response: Response,
  next: NextFunction,
) {
  response.locals.form = request.session?.form;
  response.locals.user = request.session.user;
  next();
}
