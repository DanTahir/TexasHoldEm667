import { Socket } from "socket.io-client";

const seats = document.querySelectorAll(".seat");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(
    `game:join:${roomID}`,
    ({ playOrder, player, stake, bet, status }) => {
      const seat = seats.item(playOrder - 1);

      const new_seat = seat.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;
      new_seat.classList.remove("empty-seat");
      const message = `${player}\n$${stake}\nbet: $${bet}\n${status}`;
      button.innerHTML = message.replace(/\n/g, "<br>");
      seat.parentNode?.replaceChild(new_seat, seat);
    },
  );
}
