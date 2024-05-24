import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, ICard, Hand } from "./BaseCards";

export class FourOfAKind extends BaseCards implements Hand {
  readonly rank = 3;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    return this.getNOfKindArray(cards, 4);
  }
}
