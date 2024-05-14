import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement;

const tableElement = document.querySelector(".card-area") as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(`game:start:${roomID}`, () => {
    console.log("Hello from game:start");
    const seats = document.querySelectorAll(".seat");
    startButtonElement.classList.add("hidden");
    startButtonElement.className = "start-button hidden";
    seats.forEach((seat) => {
      console.log("Hello from for each seat");
      if (!seat.classList.contains("empty-seat")) {
        const cardContainerElem = seat.querySelector(".card-container");
        if (!cardContainerElem) return;
        console.log(cardContainerElem.classList);
        cardContainerElem.classList.remove("hidden");
        cardContainerElem.className = "card-container";
        console.log(cardContainerElem.classList);
      }
    });
    console.log(tableElement.classList);
    tableElement.classList.remove("hidden");
    tableElement.className = "card-area";
    console.log(tableElement.classList);
  });
}
