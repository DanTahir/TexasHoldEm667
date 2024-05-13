import { Player, PlayerHand } from "@backend/db/dao/PlayerDao";
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
  winners: Array<Player>,
  players: Array<Player>,
) {
  const royalFlushCards = new Set([10, 11, 12, 13, 14]);
  const royalWinners: Array<Player> = [];

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

    // Check if same suit
    const areSameSuit = await checkSameSuit(cards);
    if (areSameSuit) {
      // Check if cards are 10, J, Q, K, A
      const cardValues = new Set(cards.map((card) => card.value));
      const hasRoyalFlush = Array.from(royalFlushCards).every((value) =>
        cardValues.has(value),
      );

      if (hasRoyalFlush) {
        royalWinners.push(player);
      }
    }
  }

  winners.push(...royalWinners);
}
async function checkSameSuit(cards: Array<Card>): Promise<boolean> {
  const suitSet = new Set();

  cards.forEach((card) => {
    suitSet.add(card.suit);
  });

  return suitSet.size == 1;
}
