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

export async function checkRoyalFlush(
  winners: Array<Array<PlayerWithUserInfo>>,
  players: Array<PlayerWithUserInfo>,
) {
  const royalFlushCards = [14, 13, 12, 11, 10];
  const royalWinners: Array<PlayerWithUserInfo> = [];

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

    const sortedCards = await sortCards(cards);

    // check for flush
    if (await checkSameSuit(sortedCards)) {
      let isRoyalFlush = true;
      for (let i = 0; i < 5; i++) {
        if (sortedCards[i].value !== royalFlushCards[i]) {
          isRoyalFlush = false;
          break;
        }
      }

      if (isRoyalFlush) {
        royalWinners.push(player);
      }
    }
  }

  // This is the highest ranking hand, so no need to sort the royalWinners array to check
  // who has the higher hand, like you would, in say a straight
  if (royalWinners) {
    winners.push(royalWinners);
  }
}
async function checkSameSuit(cards: Array<Card>): Promise<boolean> {
  const suitSet = new Set();

  cards.forEach((card) => {
    suitSet.add(card.suit);
  });

  return suitSet.size === 1;
}

async function sortCards(cards: Array<Card>): Promise<Array<Card>> {
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
