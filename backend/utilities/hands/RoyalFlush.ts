import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, Hand, ICard } from "./BaseCards";

export class RoyalFlush extends BaseCards implements Hand {
  readonly rank = 1;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    const royalFlushCards: Set<number> = new Set([14, 13, 12, 11, 10]);
    const royalFlushHand: Array<ICard> = [];
    const flushArray = this.getFlushArray(cards);
    if (flushArray) {
      // Flush exists, now check if all the set values exists in the array
      for (const card of flushArray) {
        if (royalFlushCards.has(card.value)) {
          royalFlushHand.push(card);
        }
      }

      if (royalFlushHand.length === 5) {
        return royalFlushHand;
      }
    }

    return null;
  }
}
