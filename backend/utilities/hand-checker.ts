import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { suit } from "@backend/db/dao/CardDao";

export type ICard = {
  value: number;
  suit: suit;
};

type Sequence = {
  length: number;
  startValue: number;
};

export function checkRoyalFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const royalFlushCards = [14, 13, 12, 11, 10];
    const royalWinners: Array<PlayerWithUserInfo> = [];

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

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
            royalWinners.push(player);
            winnerSet.add(player);
          }
        }
      }
    }

    if (royalWinners) {
      winners.push(royalWinners);
    }
  }
}

export function checkStraightFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const straightFlushWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        // check for flush
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

            straightFlushWinners[sequence.startValue].push(player);
            winnerSet.add(player);
          }
        }
      }
    }

    sortWinners(straightFlushWinners, winners);
  }
}

export function checkFourOfAKind(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const fourOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        const fourOfAKindArray = getNOfKindArray(sortedCards, 4);

        if (fourOfAKindArray) {
          const fourOfAKindValue = fourOfAKindArray[0].value;
          if (!fourOfAKindWinners[fourOfAKindValue]) {
            fourOfAKindWinners[fourOfAKindValue] = [];
          }

          fourOfAKindWinners[fourOfAKindValue].push(player);
          winnerSet.add(player);
        }
      }
    }

    sortWinners(fourOfAKindWinners, winners);
  }
}

export function checkFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const flushWinners: Record<string, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        const flushCards = getFlushArray(sortedCards);

        if (flushCards) {
          const flushSuit = flushCards[0].suit;
          if (!flushWinners[flushSuit]) {
            flushWinners[flushSuit] = [];
          }

          flushWinners[flushSuit].push(player);
          winnerSet.add(player);
        }
      }
    }
    sortWinners(flushWinners, winners);
  }
}

export function checkStraight(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const straightWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        // check for straight
        const sequence: Sequence = findLongestConsecutiveSequence(sortedCards);
        const sequenceStartValue: number = sequence.startValue;

        if (sequence.length >= 5) {
          if (!straightWinners[sequenceStartValue]) {
            straightWinners[sequenceStartValue] = [];
          }

          straightWinners[sequenceStartValue].push(player);
          winnerSet.add(player);
        }
      }
    }

    sortWinners(straightWinners, winners);
  }
}

export function checkThreeOfAKind(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const threeOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        const threeOfAKindArray = getNOfKindArray(sortedCards, 3);

        if (threeOfAKindArray) {
          const threeOfAKindValue = threeOfAKindArray[0].value;
          if (!threeOfAKindWinners[threeOfAKindValue]) {
            threeOfAKindWinners[threeOfAKindValue] = [];
          }

          threeOfAKindWinners[threeOfAKindValue].push(player);
          winnerSet.add(player);
        }
      }
    }

    sortWinners(threeOfAKindWinners, winners);
  }
}
export function checkTwoPair(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const twoPairWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        const twoPairArray = getNOfKindArray(sortedCards, 2);

        if (twoPairArray) {
          const twoPairValue = twoPairArray[0].value;
          if (!twoPairWinners[twoPairValue]) {
            twoPairWinners[twoPairValue] = [];
          }

          twoPairWinners[twoPairValue].push(player);
          winnerSet.add(player);
        }
      }
    }

    sortWinners(twoPairWinners, winners);
  }
}

export function checkOnePair(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<ICard>>,
) {
  if (players) {
    const onePairWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<ICard> = cards[player.player_id];
        const sortedCards: Array<ICard> = sortCards(playerCards);

        const onePairArray = getNOfKindArray(sortedCards, 3);

        if (onePairArray) {
          const onePairValue = onePairArray[0].value;
          if (!onePairWinners[onePairValue]) {
            onePairWinners[onePairValue] = [];
          }

          onePairWinners[onePairValue].push(player);
          winnerSet.add(player);
        }
      }
    }

    sortWinners(onePairWinners, winners);
  }
}

function getFlushArray(cards: Array<ICard>): Array<ICard> | null {
  // "suit" : [Card1, ..., Card4]
  const counts: Record<string, Array<ICard>> = {};

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

function getNOfKindArray(cards: Array<ICard>, n: number): Array<ICard> | null {
  const counts: Record<number, Array<ICard>> = {};

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

function sortCards(cards: Array<ICard>): Array<ICard> {
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

function findLongestConsecutiveSequence(cards: Array<ICard>): Sequence {
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
