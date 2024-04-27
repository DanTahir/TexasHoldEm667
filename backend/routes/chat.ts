import express, { Request, Router, Response } from "express";
export const router: Router = express.Router();

const handler = (request: Request, response: Response) => {
  const { id } = request.params;
  const { message } = request.body;

  const io = request.app.get("io");

  io.emit(`chat:message:${id === undefined ? 0 : id}`, {
    from: request.session.user?.username || "",
    message,
  });

  response.status(200);
};

router.post("/chat", handler);

router.post("/:id/chat", handler);
