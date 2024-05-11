import { Socket } from "socket.io-client";

// const seats = document.querySelectorAll(".seat");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;

function getSuitContent(suit: string) {
  switch (suit) {
    case "hearts": {
      return "♥";
    }
    case "diamonds": {
      return "♦";
    }
    case "clubs": {
      return "♣";
    }
    case "spades": {
      return "♠";
    }
    default: {
      return "";
    }
  }
}

function getNumberContent(value: number) {
  if (value === 11) {
    return "J";
  } else if (value === 12) {
    return "Q";
  } else if (value === 13) {
    return "K";
  } else if (value == 14) {
    return "A";
  } else {
    return `${value}`;
  }
}

export function handle(socket: Socket) {
  socket.on(`game:deal:${roomID}`, ({ cards, playOrder }) => {
    const { card1, card2 } = cards;

    const seat = document.querySelector(`.action-${playOrder}`);
    if (!seat) {
      return;
    }

    const [card1Container, card2Container] = Array.from(
      seat.querySelectorAll(".card-container .poker-card"),
    ) as Array<HTMLDivElement>;

    card1Container
      .querySelector(".poker-card-container")
      ?.classList.remove("back");

    const card1SuitElem = card1Container.querySelector(".card-icon");
    if (card1SuitElem) {
      card1SuitElem.textContent = getSuitContent(card1.suit);
    }
    const card1NumberElem = card1Container.querySelector(".card-number");
    if (card1NumberElem) {
      card1NumberElem.textContent = getNumberContent(card1.value);
    }
    const card1ReversedNumberElem = card1Container.querySelector(
      ".card-number-reversed",
    );
    if (card1ReversedNumberElem) {
      card1ReversedNumberElem.textContent = getNumberContent(card1.value);
    }

    card2Container
      .querySelector(".poker-card-container")
      ?.classList.remove("back");

    const card2SuitElem = card2Container.querySelector(".card-icon");
    if (card2SuitElem) {
      card2SuitElem.textContent = getSuitContent(card2.suit);
    }
    const card2NumberElem = card2Container.querySelector(".card-number");
    if (card2NumberElem) {
      card2NumberElem.textContent = getNumberContent(card2.value);
    }
    const card2ReversedNumberElem = card2Container.querySelector(
      ".card-number-reversed",
    );
    if (card2ReversedNumberElem) {
      card2ReversedNumberElem.textContent = getNumberContent(card2.value);
    }
  });
}
