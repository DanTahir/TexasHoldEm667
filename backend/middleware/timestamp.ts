import { RequestHandler } from "express";
import signale from "signale";

export const requestTime: RequestHandler = (req, _res, next) => {
  signale.info(`Request received at ${Date.now()}: ${req.method}`);

  next();
};
