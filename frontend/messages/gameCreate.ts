import { Socket } from "socket.io-client";

const gameContainer = document?.getElementById(
  "games-container",
) as HTMLDivElement | null;
const gameRowTemplate = document?.getElementById(
  "game-row-template",
) as HTMLTemplateElement | null;

export function handle(socket: Socket) {
  socket.on(`game:create`, ({ gameLobbyID, name }) => {
    const newGameRow = gameRowTemplate?.content.cloneNode(
      true,
    ) as HTMLDivElement;
    const gameNameDiv = newGameRow.querySelector(
      "#game_name",
    ) as HTMLParagraphElement;
    gameNameDiv.innerText = name;

    const newGameLink = newGameRow.querySelector("a") as HTMLAnchorElement;
    newGameLink.href = `/game/${gameLobbyID}`;

    gameContainer?.prepend(newGameRow);

    const noGamesHeader = gameContainer?.querySelector(
      "#no-games-header",
    ) as HTMLHeadingElement | null;
    if (noGamesHeader) {
      gameContainer?.removeChild(noGamesHeader);
    }
  });
}
