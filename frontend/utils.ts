export type Card = {
  value: number;
  suit: string;
};

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

export function fillInCardElements(cardContainer: HTMLDivElement, card: Card) {
  cardContainer
    .querySelector(".poker-card-container")
    ?.classList.remove("back");
  const cardSuitElem = cardContainer.querySelector(".card-icon");
  if (cardSuitElem) {
    cardSuitElem.textContent = getSuitContent(card.suit);
    if (card.suit === "hearts" || card.suit === "diamonds") {
      cardSuitElem.classList.add("red");
    } else {
      cardSuitElem.classList.add("black");
    }
  }
  const cardNumberElem = cardContainer.querySelector(".card-number");
  if (cardNumberElem) {
    cardNumberElem.textContent = getNumberContent(card.value);
  }
  const cardReversedNumberElem = cardContainer.querySelector(
    ".card-number-reversed",
  );
  if (cardReversedNumberElem) {
    cardReversedNumberElem.textContent = getNumberContent(card.value);
  }
}
