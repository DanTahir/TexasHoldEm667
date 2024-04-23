import { Request } from "express";

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface CreateRequestBody extends TypedRequestBody<Body> {
  name: string;
  stake: number;
  user_id: string;
}
