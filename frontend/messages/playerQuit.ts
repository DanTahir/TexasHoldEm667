const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

import { Socket } from "socket.io-client";

export function handle(socket: Socket) {
  socket.on(`game:quit:${roomID}`, ({ playOrder }) => {
    const seats = document.querySelectorAll(".seat");

    const seat = seats.item(playOrder - 1);

    const new_seat = seat.cloneNode(true) as HTMLDivElement;
    const button = new_seat.querySelector("button")!;
    new_seat.classList.add("empty-seat");
    button.textContent = `Join`;

    const handler = () => {
      button.textContent = "Joining...";
      button.removeEventListener("click", handler);

      fetch(`/game/${roomID}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playOrder: playOrder,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          button.textContent = "Join";
          button.addEventListener("click", handler);
          alert(await res.text());
        }
      });
    };

    button.addEventListener("click", handler);

    seat.parentNode?.replaceChild(new_seat, seat);
  });
}
