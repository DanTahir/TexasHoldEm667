import { Socket } from "socket.io-client";
import { fillInCardElements } from "../utils";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:deal:${roomID}`, ({ cards, playOrder }) => {
    const { card1, card2 } = cards;

    const seat = document.querySelector(`.action-${playOrder}`);
    if (!seat) {
      return;
    }

    const [card1Container, card2Container] = Array.from(
      seat.querySelectorAll(".card-container .poker-card"),
    ) as Array<HTMLDivElement>;

    fillInCardElements(card1Container, card1);
    fillInCardElements(card2Container, card2);
  });
}
