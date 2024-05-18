import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:updatepot:${roomID}`, ({ pot }) => {
    const potDiv = document.getElementById("pot");
    if (!potDiv) {
      return;
    }
    potDiv.innerText = `Pot: $${pot}`;
  });
}
