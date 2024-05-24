import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, Hand, ICard } from "./BaseCards";

export class Straight extends BaseCards implements Hand {
  readonly rank = 6;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    return this.getStraightArray(cards);
  }
}
