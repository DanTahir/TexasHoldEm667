import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(
    `game:foldraisecall:${roomID}`,
    ({ playOrder, playerName, stake, bet, status }) => {
      // const seats = document.querySelectorAll(".seat");
      const seat = document.querySelector(`.action-${playOrder}`);

      const new_seat = seat?.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;

      const buttonContent = `
          <div class="flex flex-col flex-nowrap">
            <div class="username">${playerName}</div>
            <div class="stake">Stake: $${stake}</div>
            <div class="bet">Bet: $${bet}</div>
            <div class="status">${status}</div>
          </div>
      `;
      button.innerHTML = buttonContent;
      seat?.parentNode?.replaceChild(new_seat, seat);

      const foldDiv = document.getElementById("fold-button") as HTMLDivElement;
      const raiseDiv = document.getElementById(
        "raise-button",
      ) as HTMLDivElement;
      const callCheckDiv = document.getElementById(
        "call-check-button",
      ) as HTMLDivElement;
      if (!foldDiv || !raiseDiv || !callCheckDiv) {
        return;
      }
      const foldButton = foldDiv.querySelector("button");
      const raiseButton = raiseDiv.querySelector("button");
      const callCheckButton = callCheckDiv.querySelector("button");
      if (!foldButton || !raiseButton || !callCheckButton) {
        return;
      }

      foldButton.textContent = "Fold";
      callCheckButton.textContent = "Call/Check";
      raiseButton.textContent = "Raise";
    },
  );
}
