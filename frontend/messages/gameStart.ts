import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement;

const tableElement = document.querySelector(".card-area") as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(`game:start:${roomID}`, () => {
    const seats = document.querySelectorAll(".seat");
    startButtonElement.classList.add("hidden");
    seats.forEach((seat) => {
      if (!seat.classList.contains("empty-seat")) {
        const cardContainerElem = seat.querySelector(".card-container");
        if (!cardContainerElem) return;
        cardContainerElem.classList.remove("hidden");
      }
    });
    const pot = document.getElementById("pot") as HTMLDivElement;
    if (pot) {
      pot.classList.remove("hidden");
    }
    tableElement.classList.remove("hidden");
  });
}
