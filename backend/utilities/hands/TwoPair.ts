import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, ICard, Hand } from "./BaseCards";

export class TwoPair extends BaseCards implements Hand {
  readonly rank = 8;
  player: PlayerWithUserInfo;

  constructor(cards: Array<ICard>, player: PlayerWithUserInfo) {
    super(cards);
    this.player = player;
  }

  static getHand(cards: Array<ICard>): Array<ICard> | null {
    const higherPairArray = this.getNOfKindArray(cards, 2);

    if (higherPairArray) {
      const higherPairValue = higherPairArray[0].value;
      const remainingCards = cards.filter(
        (card) => card.value !== higherPairValue,
      );

      const lowerPairArray = this.getNOfKindArray(remainingCards, 2);

      if (lowerPairArray) {
        const lowerPairValue = lowerPairArray[0].value;
        const kickers = remainingCards.filter(
          (card) =>
            card.value !== higherPairValue && card.value !== lowerPairValue,
        );

        return [...higherPairArray, ...lowerPairArray, ...kickers];
      }
    }
    return null;
  }
}
