import { PlayerWithUserInfo } from "@backend/db/dao/PlayerDao";
import { BaseCards, Hand } from "./BaseCards";

export function buildWinnerArray(
  playersMap: Record<PlayerWithUserInfo["player_id"], PlayerWithUserInfo>,
  playerHandMap: Record<PlayerWithUserInfo["player_id"], Hand>,
): Array<Array<PlayerWithUserInfo>> {
  const hands = Object.values(playerHandMap).sort(BaseCards.compareHands);
  const winners: Array<Array<PlayerWithUserInfo>> = [];

  let currentRank = hands[0].rank;
  for (const hand of hands) {
    // New rank found
    if (hand.rank !== currentRank) {
      currentRank = hand.rank;
      winners.push([]);
    }
    // const player =
  }
}
