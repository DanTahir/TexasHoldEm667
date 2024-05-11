import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

export function handle(socket: Socket) {
  socket.on(
    `game:join:${roomID}`,
    ({ playOrder, player, stake, bet, status }) => {
      const seats = document.querySelectorAll(".seat");
      const seat = seats.item(playOrder - 1);
      const new_seat = seat.cloneNode(true) as HTMLDivElement;
      const button = new_seat.querySelector("button")!;
      new_seat.classList.remove("empty-seat");

      // Create an object with the player data
      const playerData = {
        username: player,
        stake,
        bet,
        status,
      };

      // Generate the button content using the template
      const buttonContent = `
          <div class="flex flex-col flex-nowrap">
            <div class="username">${playerData.username}</div>
            <div class="stake">Stake: $${playerData.stake}</div>
            <div class="bet">Bet: $${playerData.bet}</div>
            <div class="status">${playerData.status}</div>
          </div>
        </button>
      `;

      // Set the button's innerHTML to the generated content
      button.innerHTML = buttonContent;

      seat.parentNode?.replaceChild(new_seat, seat);
    },
  );
}
