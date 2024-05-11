import { Response, NextFunction } from "express";
import { TypedRequestBody } from "../types";
import { sessionLocals } from "./session-locals";

export function sessionLocalsTyped<T>(
  request: TypedRequestBody<T>,
  response: Response,
  next: NextFunction,
) {
  sessionLocals(request, response, next);
}
