import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { Hand, ICard } from "./BaseCards";
import { Flush } from "./Flush";
import { FourOfAKind } from "./FourOfAKind";
import { FullHouse } from "./FullHouse";
import { HighCard } from "./HighCard";
import { OnePair } from "./OnePair";
import { RoyalFlush } from "./RoyalFlush";
import { Straight } from "./Straight";
import { StraightFlush } from "./StraightFlush";
import { ThreeOfAKind } from "./ThreeOfAKind";
import { TwoPair } from "./TwoPair";

export class HandFactory {
  static createHand(cards: Array<ICard>, player: PlayerWithUserInfo): Hand {
    if (RoyalFlush.getHand(cards)) {
      return new RoyalFlush(cards, player);
    } else if (StraightFlush.getHand(cards)) {
      return new StraightFlush(cards, player);
    } else if (FourOfAKind.getHand(cards)) {
      return new FourOfAKind(cards, player);
    } else if (FullHouse.getHand(cards)) {
      return new FullHouse(cards, player);
    } else if (Flush.getHand(cards)) {
      return new Flush(cards, player);
    } else if (Straight.getHand(cards)) {
      return new Straight(cards, player);
    } else if (ThreeOfAKind.getHand(cards)) {
      return new ThreeOfAKind(cards, player);
    } else if (TwoPair.getHand(cards)) {
      return new TwoPair(cards, player);
    } else if (OnePair.getHand(cards)) {
      return new OnePair(cards, player);
    } else {
      return new HighCard(cards, player);
    }
  }
}
