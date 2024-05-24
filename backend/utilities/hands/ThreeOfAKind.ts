import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, Hand, ICard } from "./BaseCards";

export class ThreeOfAKind extends BaseCards implements Hand {
  readonly rank = 7;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    return this.getNOfKindArray(cards, 3);
  }
}
