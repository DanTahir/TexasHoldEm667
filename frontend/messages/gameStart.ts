import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement;

const tableElement = document.querySelector(".card-area") as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(`game:start:${roomID}`, () => {
    startButtonElement.classList.add("hidden");

    tableElement.classList.remove("hidden");
  });
}
