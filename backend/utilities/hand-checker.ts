import { PlayerHand, PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { getPlayerCards } from "@backend/db/dao/PlayerDao";
import {
  CommunityCards,
  getCommunityCards,
} from "@backend/db/dao/GameLobbyDao";
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
    if (checkFlush(sortedCards)) {
      let isRoyalFlush = true;
      for (let i = 0; i < 5; i++) {
        if (sortedCards[i].value !== royalFlushCards[i]) {
          isRoyalFlush = false;
          break;
        }
      }

      if (isRoyalFlush) {
        royalWinners.push(players[i]);
      }
    }
  });
  // for (const playerHand of playerHands) {
  //   }
  // }

  // This is the highest ranking hand, so no need to sort the royalWinners array to check
  // who has the higher hand, like you would, in say a straight
  if (royalWinners) {
    winners.push(royalWinners);
  }
}

export async function checkStraightFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
) {
  const straightFlushWinners: Record<number, Array<PlayerWithUserInfo>> = {};

  for (const player of players) {
    const playerCards: PlayerHand = await getPlayerCards(
      player.user_id,
      player.game_lobby_id,
    );
    const communityCards: CommunityCards = await getCommunityCards(
      player.game_lobby_id,
    );

    const cards = [
      playerCards.card1,
      playerCards.card2,
      communityCards.flop_1,
      communityCards.flop_2,
      communityCards.flop_3,
      communityCards.turn,
      communityCards.river,
    ];

    const sortedCards = sortCards(cards);

    // Check for flush
    if (checkFlush(sortedCards)) {
      let isStraightFlush = true;
      const sequence: Sequence = findLongestConsecutiveSequence(sortedCards);

      // It's not a straight
      if (sequence.length !== 5) {
        isStraightFlush = false;
      }

      if (isStraightFlush) {
        if (!straightFlushWinners[sequence.startValue]) {
          straightFlushWinners[sequence.startValue] = [];
        }

        straightFlushWinners[sequence.startValue].push(player);
      }
    }
  }

  const sortedWinners = Object.entries(straightFlushWinners).sort(
    ([a], [b]) => Number(b) - Number(a),
  );

  sortedWinners.forEach(([_, players]) => {
    if (players.length > 1) {
      winners.push(players);
    } else {
      winners.push([players[0]]);
    }
  });
}

function checkFlush(cards: Array<Card>): Array<Card> | null {
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
