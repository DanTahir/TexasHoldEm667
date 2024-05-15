import { PlayerHand, PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { CommunityCards } from "@backend/db/dao/GameLobbyDao";
import { suit } from "@backend/db/dao/CardDao";

type Card = {
  value: number;
  suit: suit;
};

type Sequence = {
  length: number;
  startValue: number;
};

export async function checkRoyalFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
  playerHands: Array<PlayerHand>,
  communityCards: CommunityCards,
) {
  const royalFlushCards = [14, 13, 12, 11, 10];
  const royalWinners: Array<PlayerWithUserInfo> = [];

  playerHands.forEach((playerHand, i) => {
    const cards = [
      playerHand.card1,
      playerHand.card2,
      communityCards.flop_1,
      communityCards.flop_2,
      communityCards.flop_3,
      communityCards.turn,
      communityCards.river,
    ];

    const sortedCards = sortCards(cards);

    // check for flush
    const flushCards = getFlushArray(sortedCards);
    if (flushCards) {
      let isRoyalFlush = true;
      for (let i = 0; i < 5; i++) {
        if (flushCards[i].value !== royalFlushCards[i]) {
          isRoyalFlush = false;
          break;
        }
      }

      if (isRoyalFlush) {
        royalWinners.push(players[i]);
      }
    }
  });

  // This is the highest ranking hand, so no need to sort the royalWinners array to check
  // who has the higher hand, like a straight
  if (royalWinners) {
    winners.push(royalWinners);
  }
}

export async function checkStraightFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
  playerHands: Array<PlayerHand>,
  communityCards: CommunityCards,
) {
  const straightFlushWinners: Record<number, Array<PlayerWithUserInfo>> = {};

  playerHands.forEach((playerHand, i) => {
    const cards: Array<Card> = [
      playerHand.card1,
      playerHand.card2,
      communityCards.flop_1,
      communityCards.flop_2,
      communityCards.flop_3,
      communityCards.turn,
      communityCards.river,
    ];
    //
    // const cards: Array<Card> = [
    //   {
    //     value: 5,
    //     suit: "hearts",
    //   },
    //   {
    //     value: 6,
    //     suit: "hearts",
    //   },
    //   {
    //     value: 7,
    //     suit: "hearts",
    //   },
    //   {
    //     value: 8,
    //     suit: "hearts",
    //   },
    //   { value: 9, suit: "hearts" },
    //   { value: 2, suit: "spades" },
    //   { value: 5, suit: "spades" },
    // ];

    const sortedCards = sortCards(cards);

    const flushCards = getFlushArray(sortedCards);
    if (flushCards) {
      let isStraightFlush = true;
      const sequence: Sequence = findLongestConsecutiveSequence(flushCards);

      if (sequence.length !== 5) {
        isStraightFlush = false;
      }

      if (isStraightFlush) {
        if (!straightFlushWinners[sequence.startValue]) {
          straightFlushWinners[sequence.startValue] = [];
        }

        straightFlushWinners[sequence.startValue].push(players[i]);
      }
    }

    const sortedWinners = sortWinners(straightFlushWinners);

    sortedWinners.forEach(([_, players]) => {
      if (players.length > 1) {
        winners.push(players);
      } else {
        winners.push([players[0]]);
      }
    });
  });
}

function getFlushArray(cards: Array<Card>): Array<Card> | null {
  // "suit" : [Card1, ..., Card4]
  const counts: Record<string, Array<Card>> = {};

  cards.forEach((card) => {
    if (counts[card.suit]) {
      counts[card.suit].push(card);
    } else {
      counts[card.suit] = [card];
    }
  });

  for (const s in counts) {
    if (counts[s].length >= 5) {
      return counts[s];
    }
  }

  return null;
}

function sortCards(cards: Array<Card>): Array<Card> {
  const sortedCards = cards.sort((a, b) => {
    // Negative return value indicates a should come before b
    if (a.value > b.value) {
      return -1;
    }

    if (a.value < b.value) {
      return 1;
    }

    return 0;
  });

  return sortedCards;
}

function findLongestConsecutiveSequence(cards: Array<Card>): Sequence {
  const set = new Set();
  let longestConsecutiveSequence = 0;
  let startValue = 0;

  for (const card of cards) {
    if (!set.has(card.value - 1)) {
      let currentVal = card.value;
      let currentSeq = 1;
      while (set.has(currentVal + 1)) {
        currentVal += 1;
        currentSeq += 1;
      }
      if (currentSeq > longestConsecutiveSequence) {
        longestConsecutiveSequence = currentSeq;
        startValue = card.value;
      }
    }
    set.add(card.value);
  }

  return { length: longestConsecutiveSequence, startValue };
}

function sortWinners(winners: Record<number, Array<PlayerWithUserInfo>>) {
  return Object.entries(winners).sort(([a], [b]) => Number(a) - Number(b));
}
