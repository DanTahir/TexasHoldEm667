import { Socket } from "socket.io-client";

const seats = document.querySelectorAll(".seat");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(
    `game:join:${roomID}`,
    ({ playOrder, player, stake, numPlayers }) => {
      const seat = seats.item(playOrder - 1);

      const new_seat = seat.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;
      new_seat.classList.remove("empty-seat");
      button.textContent = `${player}\nStake: $${stake}`;
      seat.parentNode?.replaceChild(new_seat, seat);

      if (numPlayers >= 4) {
        startButtonElement.classList.remove("hidden");
      }
    },
  );
}
