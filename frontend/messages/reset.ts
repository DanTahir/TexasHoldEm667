import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(`game:start:${roomID}`, () => {
    const seats = document.querySelectorAll(".seat");
    let playerCount = 0;
    seats.forEach((seat) => {
      if (!seat.classList.contains("empty-seat")) {
        playerCount++;
      }
      const cardContainerElem = seat.querySelector(".card-container");
      if (!cardContainerElem) return;
      cardContainerElem.classList.add("hidden");
    });
    const communityCardArea = document.querySelector(
      ".card-area",
    ) as HTMLDivElement;
    communityCardArea.classList.add("hidden");
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
    resetButtonElement.classList.add("hidden");
    resetButton.textContent = "Reset Round";
    if (playerCount >= 4) {
      const startButtonElement = document.querySelector(
        ".start-button",
      ) as HTMLDivElement | null;
      const startButton = startButtonElement?.querySelector("button");
      if (!startButtonElement) {
        return;
      }
      if (!startButton) {
        return;
      }
      startButtonElement.classList.remove("hidden");

      const startButtonHandler = () => {
        if (!startButton) return;

        startButton.textContent = "Starting...";
        startButton.removeEventListener("click", startButtonHandler);

        const gameID = document.location.pathname.split("/")[2];

        fetch(`/game/${gameID}/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).then(async (res) => {
          if (!res.ok) {
            startButton.textContent = "Start";
            startButton.addEventListener("click", startButtonHandler);
            alert(await res.text());
          }
        });
      };

      if (startButton) {
        startButton.addEventListener("click", startButtonHandler);
      }
    }
  });
}
