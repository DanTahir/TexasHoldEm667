import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;
const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement;

export function handle(socket: Socket) {
  socket.on(
    `game:join:${roomID}`,
    ({ playOrder, numPlayers, player, stake, bet, status }) => {
      const seat = document.querySelector(`.action-${playOrder}`);
      const new_seat = seat?.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;
      new_seat.classList.remove("empty-seat");

      // Generate the button content using the template
      const buttonContent = `
          <div class="flex flex-col flex-nowrap">
            <div class="username">${player}</div>
            <div class="stake">Stake: $${stake}</div>
            <div class="bet">Bet: $${bet}</div>
            <div class="status">${status}</div>
          </div>
      `;

      // Set the button's innerHTML to the generated content
      button.innerHTML = buttonContent;

      seat?.parentNode?.replaceChild(new_seat, seat);

      if (numPlayers >= 4) {
        startButtonElement.classList.remove("hidden");
      }
    },
  );
}
