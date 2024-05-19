import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:showresetbutton:${roomID}`, () => {
    const resetButtonElement = document.querySelector(
      ".reset-button",
    ) as HTMLDivElement | null;
    const resetButton = resetButtonElement?.querySelector("button");
    if (!resetButtonElement) {
      return;
    }
    if (!resetButton) {
      return;
    }
    resetButtonElement.classList.remove("hidden");
  });
}
