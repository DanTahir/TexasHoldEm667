import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:announcewinner:${roomID}`, ({ announceWinnerString }) => {
    alert(announceWinnerString);
  });
}
