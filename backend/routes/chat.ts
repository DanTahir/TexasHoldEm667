import express, { Router } from "express";
export const router: Router = express.Router();

router.post("/:id", (request, response) => {
  const { id } = request.params;
  const { message } = request.body;

  console.log(id, message);

  response.status(200);
});
