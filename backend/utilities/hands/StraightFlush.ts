import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, Hand, ICard } from "./BaseCards";

export class StraightFlush extends BaseCards implements Hand {
  readonly rank = 2;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    const flushArray: Array<ICard> | null = this.getFlushArray(cards);
    const straightArray: Array<ICard> | null = this.getStraightArray(cards);

    if (flushArray && straightArray) {
      return flushArray;
    }

    return null;
  }
}
