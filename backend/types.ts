import { Request } from "express";

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface FormInfo {
  message: string;
  [key: string]: number | string;
}
