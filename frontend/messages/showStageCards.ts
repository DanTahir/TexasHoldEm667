import { Socket } from "socket.io-client";
import { fillInCardElements } from "../utils";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;
const tableElement = document.querySelector(".card-area") as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(`game:showFlop:${roomID}`, ({ card1, card2, card3 }) => {
    const [card1Container, card2Container, card3Container] = Array.from(
      tableElement.querySelectorAll(".poker-card"),
    ) as Array<HTMLDivElement>;

    fillInCardElements(card1Container, card1);
    fillInCardElements(card2Container, card2);
    fillInCardElements(card3Container, card3);
  });

  socket.on(`game:showTurn:${roomID}`, ({ card }) => {
    const cardContainers = Array.from(
      tableElement.querySelectorAll(".poker-card"),
    ) as Array<HTMLDivElement>;
    const card4Container = cardContainers.at(3)!;

    fillInCardElements(card4Container, card);
  });

  socket.on(`game:showRiver:${roomID}`, ({ card }) => {
    const cardContainers = Array.from(
      tableElement.querySelectorAll(".poker-card"),
    ) as Array<HTMLDivElement>;
    const card5Container = cardContainers.at(4)!;

    fillInCardElements(card5Container, card);
  });
}
