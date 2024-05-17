import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:announcenewplayer:${roomID}`, ({ playOrder }) => {
    const allSeats = document.querySelectorAll(
      ".seat",
    ) as NodeListOf<HTMLDivElement>;

    allSeats.forEach((element) => {
      const playerButton = element.querySelector("button");
      if (!playerButton) {
        return;
      }

      if (element.classList.contains(`action-${playOrder}`)) {
        playerButton.style.backgroundColor = "green";
      } else {
        playerButton.style.backgroundColor = "";
      }
    });
  });
}
