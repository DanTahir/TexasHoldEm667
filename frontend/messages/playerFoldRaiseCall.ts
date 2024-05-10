import { Socket } from "socket.io-client";

const seats = document.querySelectorAll(".seat");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(
    `game:foldraisecall:${roomID}`,
    ({ playOrder, playerName, stake, bet, status }) => {
      const seat = seats.item(playOrder - 1);

      const new_seat = seat.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;
      const message = `${playerName}\n$${stake}\nbet: $${bet}\n${status}`;
      button.innerHTML = message.replace(/\n/g, "<br>");
      seat.parentNode?.replaceChild(new_seat, seat);

      const foldDiv = document.getElementById("fold-button") as HTMLDivElement;
      const raiseDiv = document.getElementById(
        "raise-button",
      ) as HTMLDivElement;
      const callCheckDiv = document.getElementById(
        "call-check-button",
      ) as HTMLDivElement;
      if (!foldDiv || !raiseDiv || !callCheckDiv) {
        return;
      }
      const foldButton = foldDiv.querySelector("button");
      const raiseButton = raiseDiv.querySelector("button");
      const callCheckButton = callCheckDiv.querySelector("button");
      if (!foldButton || !raiseButton || !callCheckButton) {
        return;
      }

      foldButton.textContent = "Fold";
      callCheckButton.textContent = "Call/Check";
      raiseButton.textContent = "Raise";
    },
  );
}
