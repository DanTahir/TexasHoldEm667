import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, ICard, Hand } from "./BaseCards";

export class OnePair extends BaseCards implements Hand {
  readonly rank = 9;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }
  static getHand(cards: Array<ICard>): Array<ICard> | null {
    return this.getNOfKindArray(cards, 2);
  }
}
