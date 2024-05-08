import { Socket } from "socket.io-client";

const seats = document.querySelectorAll(".seat");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:fold:${roomID}`, ({     
        playOrder,
        playerName,
        stake,
        bet,
        status 
    }) => {
    const seat = seats.item(playOrder - 1);

    const new_seat = seat.cloneNode(true) as HTMLDivElement;
    const button = new_seat.querySelector("button")!;
    button.textContent = `${playerName}\n$${stake}\nbet: $${bet}\n${status}`;
    seat.parentNode?.replaceChild(new_seat, seat);
  });
}
