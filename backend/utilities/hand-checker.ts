import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { suit } from "@backend/db/dao/CardDao";

export type CardValue = {
  value: number;
  suit: suit;
};

export function checkRoyalFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const royalFlushCards = [14, 13, 12, 11, 10];
    const royalWinners: Array<PlayerWithUserInfo> = [];

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

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
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const straightFlushWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

        const flushCards = getFlushArray(sortedCards);

        if (flushCards) {
          const sequence = getStraightSequence(flushCards);

          if (sequence.length < 5) {
            continue;
          }

          const largestValue = sequence.at(-1)!.value;

          if (!straightFlushWinners[largestValue]) {
            straightFlushWinners[largestValue] = [];
          }

          straightFlushWinners[largestValue].push(player);
          winnerSet.add(player);
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
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const fourOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

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

export function checkFullHouse(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<CardValue>>,
) {
  const fullHouseWinners: Record<string, Array<PlayerWithUserInfo>> = {};

  for (const player of players) {
    if (!winnerSet.has(player)) {
      const playerCards: Array<CardValue> = cards[player.player_id];
      const sortedCards: Array<CardValue> = sortCards(playerCards);

      const cardCounts = getCardValueCounts(sortedCards);

      const threePairValues = Object.keys(cardCounts)
        .map((v) => Number(v))
        .filter((v) => cardCounts[v].length === 3)
        .sort((a, b) => a - b);
      const twoPairValues = Object.keys(cardCounts)
        .map((v) => Number(v))
        .filter((v) => cardCounts[v].length === 2)
        .sort((a, b) => a - b);

      if (threePairValues.length > 0 && twoPairValues.length > 0) {
        const secondValue =
          threePairValues.length > 1 ? threePairValues[1] : twoPairValues[0];

        const winnerKey = `${threePairValues[0]}.${secondValue}`;
        if (!fullHouseWinners[winnerKey]) {
          fullHouseWinners[winnerKey] = [];
        }
        fullHouseWinners[winnerKey].push(player);
        winnerSet.add(player);
      }
    }
  }

  sortWinners(fullHouseWinners, winners);
}

export function checkFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const flushWinners: Record<string, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

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
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const straightWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

        const sequence = getStraightSequence(sortedCards);

        if (sequence.length < 5) {
          continue;
        }

        const largestValue = sequence.at(-1)!.value;

        if (!straightWinners[largestValue]) {
          straightWinners[largestValue] = [];
        }

        straightWinners[largestValue].push(player);
        winnerSet.add(player);
      }
    }

    sortWinners(straightWinners, winners);
  }
}

export function checkThreeOfAKind(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const threeOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

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
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const twoPairWinners: Record<string, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

        const higherPairArray = getNOfKindArray(sortedCards, 2);

        if (higherPairArray) {
          const higherPairValue = higherPairArray[0].value;
          const remainingCards = sortedCards.filter(
            (card) => card.value !== higherPairValue,
          );
          const lowerPairArray = getNOfKindArray(remainingCards, 2);

          if (lowerPairArray) {
            const lowerPairValue = lowerPairArray[0].value;
            const key = `${higherPairValue},${lowerPairValue}`;

            if (!twoPairWinners[key]) {
              twoPairWinners[key] = [];
            }

            twoPairWinners[key].push(player);
            winnerSet.add(player);
          }
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
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const onePairWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

        const onePairArray = getNOfKindArray(sortedCards, 2);

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

export function checkHighCard(
  winners: Array<Array<PlayerWithUserInfo>>,
  winnerSet: Set<PlayerWithUserInfo>,
  players: Array<PlayerWithUserInfo>,
  cards: Record<string, Array<CardValue>>,
) {
  if (players) {
    const highCardWinners: Record<number, Array<PlayerWithUserInfo>> = {};

    for (const player of players) {
      if (!winnerSet.has(player)) {
        const playerCards: Array<CardValue> = cards[player.player_id];
        const sortedCards: Array<CardValue> = sortCards(playerCards);

        const highestCardValue = sortedCards[0].value;

        if (!highCardWinners[highestCardValue]) {
          highCardWinners[highestCardValue] = [];
        }

        highCardWinners[highestCardValue].push(player);
        winnerSet.add(player);
      }
    }

    sortWinners(highCardWinners, winners);
  }
}

function getCardValueCounts(cards: Array<CardValue>) {
  const counts: Record<number, Array<CardValue>> = {};

  cards.forEach((card) => {
    if (counts[card.value]) {
      counts[card.value].push(card);
    } else {
      counts[card.value] = [card];
    }
  });

  return counts;
}

function getFlushArray(cards: Array<CardValue>): Array<CardValue> | null {
  // "suit" : [Card1, ..., Card4]
  const counts: Record<string, Array<CardValue>> = {};

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

function getNOfKindArray(
  cards: Array<CardValue>,
  n: number,
): Array<CardValue> | null {
  const counts: Record<number, Array<CardValue>> = {};

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

function sortCards(cards: Array<CardValue>): Array<CardValue> {
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

function getStraightSequence(cards: Array<CardValue>): Array<CardValue> {
  if (cards.length === 0) {
    return [];
  }

  const uniqueCardsMap = new Map<number, CardValue>();
  cards.forEach((card) => uniqueCardsMap.set(card.value, card));
  const uniqueCards = Array.from(uniqueCardsMap.values()).sort(
    (a, b) => a.value - b.value,
  );

  let longestSequence: CardValue[] = [];
  let currentSequence: CardValue[] = [uniqueCards[0]];

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

  return longestSequence;
}

function sortWinners(
  unsortedWinners: Record<number | string, Array<PlayerWithUserInfo>>,
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
