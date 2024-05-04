const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

import { Socket } from "socket.io-client";

export function handle(socket: Socket) {
  socket.on(`game:quit:${roomID}`, ({ playOrder }) => {
    console.log("Hello from the socket, playorder = " + playOrder);
    const seats = document.querySelectorAll(".seat");

    const seat = seats.item(playOrder - 1);

    const new_seat = seat.cloneNode(true) as HTMLDivElement;
    const button = new_seat.querySelector("button")!;
    new_seat.classList.add("empty-seat");
    button.textContent = `Join`;
    seat.parentNode?.replaceChild(new_seat, seat);
    //joinHandle();
  });
}
