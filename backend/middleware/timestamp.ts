import { RequestHandler } from "express";

export const requestTime: RequestHandler = (req, _res, next) => {
  console.log(`Request received at ${Date.now()}: ${req.method}`);

  next();
};
