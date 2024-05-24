import { Suit } from "@backend/db/dao/CardDao";

export type ICard = {
  value: number;
  suit: Suit;
};

export interface Hand {
  readonly rank: number;
  cards: Array<ICard>;
}

function isSuit(value: string): value is Suit {
  return (
    value === "spades" ||
    value === "clubs" ||
    value === "hearts" ||
    value === "diamonds"
  );
}

export class BaseCards {
  cards: Array<ICard>;

  constructor(cards: Array<ICard>) {
    this.cards = this.sortCardsByValue(cards);
  }

  sortCardsByValue(cards: Array<ICard>): Array<ICard> {
    return cards.sort((a, b) => b.value - a.value);
  }

  private static groupCardsBySuit(
    cards: Array<ICard>,
  ): Record<Suit, Array<ICard>> {
    const suitCards: Record<Suit, Array<ICard>> = {
      spades: [],
      clubs: [],
      hearts: [],
      diamonds: [],
    };

    for (const card of cards) {
      suitCards[card.suit].push(card);
    }

    return suitCards;
  }

  static getFlushArray(cards: Array<ICard>): Array<ICard> | null {
    const cardsGroupedBySuit = this.groupCardsBySuit(cards);
    for (const suit in cardsGroupedBySuit) {
      if (!isSuit(suit)) {
        continue;
      }
      if (cardsGroupedBySuit[suit].length >= 5) {
        return cardsGroupedBySuit[suit];
      }
    }

    return null;
  }

  static getStraightArray(cards: Array<ICard>): Array<ICard> | null {
    const uniqueCardsMap = new Map<number, ICard>();
    cards.forEach((card) => uniqueCardsMap.set(card.value, card));
    const uniqueCards = Array.from(uniqueCardsMap.values()).sort(
      (a, b) => a.value - b.value,
    );

    let longestSequence: ICard[] = [];
    let currentSequence: ICard[] = [uniqueCards[0]];

    for (let i = 1; i < uniqueCards.length; i++) {
      if (uniqueCards[i].value === uniqueCards[i - 1].value + 1) {
        currentSequence.push(uniqueCards[i]);
      } else {
        if (currentSequence.length > longestSequence.length) {
          longestSequence = currentSequence;
        }
        currentSequence = [uniqueCards[i]]; // Start a new sequence
      }
    }

    if (currentSequence.length > longestSequence.length) {
      longestSequence = currentSequence;
    }

    if (longestSequence.length >= 5) {
      return longestSequence;
    }

    return null;
  }

  static getNOfKindArray(cards: Array<ICard>, n: number): Array<ICard> | null {
    const counts: Record<number, Array<ICard>> = {};

    cards.forEach((card) => {
      if (counts[card.value]) {
        counts[card.value].push(card);
      } else {
        counts[card.value] = [card];
      }
    });

    for (const cardValue in counts) {
      if (counts[cardValue].length >= n) {
        return counts[cardValue];
      }
    }

    return null;
  }

  static getCardValueCounts(cards: Array<ICard>) {
    const counts: Record<number, Array<ICard>> = {};

    cards.forEach((card) => {
      if (counts[card.value]) {
        counts[card.value].push(card);
      } else {
        counts[card.value] = [card];
      }
    });

    return counts;
  }

  static compareHands(hand1: Hand, hand2: Hand): number {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank; // Compare by hand ranks
    }

    // Both hands have the same rank, compare highest card values
    for (let i = 0; i < hand1.cards.length; i++) {
      if (hand1.cards[i].value !== hand2.cards[i].value) {
        return hand1.cards[i].value - hand2.cards[i].value;
      }
    }

    return 0; // Both hands are completely identical
  }
}
