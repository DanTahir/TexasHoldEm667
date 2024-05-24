import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, ICard } from "./BaseCards";

export class Flush extends BaseCards {
  readonly rank = 5;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    return this.getFlushArray(cards);
  }
}
