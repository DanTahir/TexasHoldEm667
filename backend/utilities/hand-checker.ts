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
  if (players) {
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

        // Add winner to winners array and remove from players array, so we don't check the same player for a worse hand
        if (isRoyalFlush) {
          royalWinners.push(players[i]);
          players.splice(i, 1);
          playerHands.splice(i, 1);
        }
      }
    });

    // This is the highest ranking hand, so no need to sort the royalWinners array to check
    // who has the higher hand, like a straight
    if (royalWinners) {
      winners.push(royalWinners);
    }
  }
}

export async function checkStraightFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
  playerHands: Array<PlayerHand>,
  communityCards: CommunityCards,
) {
  if (players) {
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
          players.splice(i, 1);
          playerHands.splice(i, 1);
        }
      }

      sortWinners(straightFlushWinners, winners);
    });
  }
}

export async function checkFourOfAKind(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
  playerHands: Array<PlayerHand>,
  communityCards: CommunityCards,
) {
  if (players) {
    const fourOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};

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
      //     value: 5,
      //     suit: "diamonds",
      //   },
      //   {
      //     value: 7,
      //     suit: "hearts",
      //   },
      //   {
      //     value: 8,
      //     suit: "hearts",
      //   },
      //   { value: 5, suit: "clubs" },
      //   { value: 2, suit: "spades" },
      //   { value: 5, suit: "spades" },
      // ];
      const sortedCards = sortCards(cards);

      const fourOfAKindArray = getNOfKindArray(sortedCards, 4);

      if (fourOfAKindArray) {
        // Four of a kind winner exists

        // Check if there's a winner already with the same 4 of a kind
        if (!fourOfAKindWinners[fourOfAKindArray[0].value]) {
          fourOfAKindWinners[fourOfAKindArray[0].value] = [];
        }
        fourOfAKindWinners[fourOfAKindArray[0].value].push(players[i]);
        players.splice(i, 1);
        playerHands.splice(i, 1);
      }
    });

    sortWinners(fourOfAKindWinners, winners);
  }
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

function getNOfKindArray(cards: Array<Card>, n: number): Array<Card> | null {
  const counts: Record<number, Array<Card>> = {};

  cards.forEach((card) => {
    if (counts[card.value]) {
      counts[card.value].push(card);
    } else {
      counts[card.value] = [card];
    }
  });

  for (const cardValue in counts) {
    if (counts[cardValue].length == n) {
      return counts[cardValue];
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

function sortWinners(
  unsortedWinners: Record<number, Array<PlayerWithUserInfo>>,
  winners: Array<Array<PlayerWithUserInfo>>,
) {
  const sortedWinners = Object.entries(unsortedWinners).sort(
    ([a], [b]) => Number(a) - Number(b),
  );
  sortedWinners.forEach(([_, players]) => {
    if (players.length > 1) {
      winners.push(players);
    } else {
      winners.push([players[0]]);
    }
  });
}
