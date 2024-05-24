import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, ICard, Hand } from "./BaseCards";

export class FullHouse extends BaseCards implements Hand {
  readonly rank = 4;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    const cardCounts = this.getCardValueCounts(cards);

    const threePairValues = Object.keys(cardCounts)
      .map((v) => Number(v))
      .filter((v) => cardCounts[v].length === 3)
      .sort((a, b) => a - b);
    const twoPairValues = Object.keys(cardCounts)
      .map((v) => Number(v))
      .filter((v) => cardCounts[v].length === 2)
      .sort((a, b) => a - b);

    if (threePairValues.length > 0 && twoPairValues.length > 0) {
      const secondValue =
        threePairValues.length > 1 ? threePairValues[1] : twoPairValues[0];

      const handCards = [
        ...cardCounts[threePairValues[0]],
        ...cardCounts[secondValue].slice(0, 2),
      ];

      return handCards;
    }

    return null;
  }
}
