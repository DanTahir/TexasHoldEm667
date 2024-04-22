import express, { Router } from "express";
export const router: Router = express.Router();

router.post("/:id", (request, response) => {
  const { id } = request.params;
  const { message } = request.body;

  const io = request.app.get("io");

  console.log({id, message});

  io.emit("chat:message:0", {
    from: "someone",
    timestamp: Date.now(),
    message,
  })

  response.status(200);
});
