// const cards1: Array<ICard> = [
//   { suit: "spades", value: 9 },
//   { suit: "spades", value: 10 },
//   { suit: "spades", value: 11 },
//   { suit: "spades", value: 12 },
//   { suit: "spades", value: 13 },
//   { suit: "hearts", value: 5 },
//   { suit: "hearts", value: 6 },
// ];
//
// const cards2: Array<ICard> = [
//   { suit: "hearts", value: 5 },
//   { suit: "hearts", value: 6 },
//   { suit: "hearts", value: 7 },
//   { suit: "hearts", value: 8 },
//   { suit: "hearts", value: 9 },
//   { suit: "spades", value: 11 },
//   { suit: "spades", value: 12 },
// ];
//
// const cards3: Array<ICard> = [
//   { suit: "hearts", value: 10 },
//   { suit: "spades", value: 10 },
//   { suit: "diamonds", value: 10 },
//   { suit: "clubs", value: 10 },
//   { suit: "hearts", value: 2 },
//   { suit: "spades", value: 3 },
//   { suit: "diamonds", value: 4 },
// ];
//
// const cards4: Array<ICard> = [
//   { suit: "spades", value: 10 },
//   { suit: "spades", value: 11 },
//   { suit: "spades", value: 12 },
//   { suit: "spades", value: 13 },
//   { suit: "spades", value: 14 },
//   { suit: "hearts", value: 2 },
//   { suit: "hearts", value: 3 },
// ];
//
// const cards5: Array<ICard> = [
//   { suit: "clubs", value: 7 },
//   { suit: "clubs", value: 8 },
//   { suit: "clubs", value: 9 },
//   { suit: "clubs", value: 10 },
//   { suit: "clubs", value: 11 },
//   { suit: "diamonds", value: 3 },
//   { suit: "diamonds", value: 4 },
// ];
// const hand1 = HandFactory.createHand(cards1);
// const hand2 = HandFactory.createHand(cards2);
// const hand3 = HandFactory.createHand(cards3);
// const hand4 = HandFactory.createHand(cards4);
// const hand5 = HandFactory.createHand(cards5);
// winners["1"] = hand1;
// winners["2"] = hand2;
// winners["3"] = hand3;
// winners["4"] = hand4;
// winners["5"] = hand5;
// const hands = [hand1, hand2, hand3, hand4, hand5];
// for (const winner in winners) {
//   console.log(winners[winner]?.rank);
// }
// hands.sort(BaseCards.compareHands);
//
// console.log("\nHands: ", hands);

// BaseCards.compareHands(hand1, hand2);
//
// const winners: Array<PlayerWithUserInfo> = [];
// for (const player of playersWithCards) {
//   const hand = HandFactory.createHand(playersWithCards[player]);
//   console.log("HAND RANK:", hand?.rank);
//   winners.push(player);
// }

//
// import { suit } from "@backend/db/dao/CardDao";
// type Sequence = {
//   length: number;
//   startValue: number;
// };
//
// export function checkRoyalFlush(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const royalFlushCards = [14, 13, 12, 11, 10];
//     const royalWinners: Array<PlayerWithUserInfo> = [];
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         // check for flush
//         const flushCards = getFlushArray(sortedCards);
//         if (flushCards) {
//           let isRoyalFlush = true;
//           for (let i = 0; i < 5; i++) {
//             if (flushCards[i].value !== royalFlushCards[i]) {
//               isRoyalFlush = false;
//               break;
//             }
//           }
//
//           if (isRoyalFlush) {
//             royalWinners.push(player);
//             winnerSet.add(player);
//           }
//         }
//       }
//     }
//
//     if (royalWinners) {
//       winners.push(royalWinners);
//     }
//   }
// }
//
// export function checkStraightFlush(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const straightFlushWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         // check for flush
//         const flushCards = getFlushArray(sortedCards);
//
//         if (flushCards) {
//           let isStraightFlush = true;
//           const sequence: Sequence = findLongestConsecutiveSequence(flushCards);
//
//           if (sequence.length !== 5) {
//             isStraightFlush = false;
//           }
//
//           if (isStraightFlush) {
//             if (!straightFlushWinners[sequence.startValue]) {
//               straightFlushWinners[sequence.startValue] = [];
//             }
//
//             straightFlushWinners[sequence.startValue].push(player);
//             winnerSet.add(player);
//           }
//         }
//       }
//     }
//
//     sortWinners(straightFlushWinners, winners);
//   }
// }
//
// export function checkFourOfAKind(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const fourOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const fourOfAKindArray = getNOfKindArray(sortedCards, 4);
//
//         if (fourOfAKindArray) {
//           const fourOfAKindValue = fourOfAKindArray[0].value;
//           if (!fourOfAKindWinners[fourOfAKindValue]) {
//             fourOfAKindWinners[fourOfAKindValue] = [];
//           }
//
//           fourOfAKindWinners[fourOfAKindValue].push(player);
//           winnerSet.add(player);
//         }
//       }
//     }
//
//     sortWinners(fourOfAKindWinners, winners);
//   }
// }
//
// export function checkFullHouse(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   const fullHouseWinners: Record<string, Array<PlayerWithUserInfo>> = {};
//
//   for (const player of players) {
//     if (!winnerSet.has(player)) {
//       const playerCards: Array<ICard> = cards[player.player_id];
//       const sortedCards: Array<ICard> = sortCards(playerCards);
//
// const cardCounts = getCardValueCounts(sortedCards);
//
//       const threePairValues = Object.keys(cardCounts)
//         .map((v) => Number(v))
//         .filter((v) => cardCounts[v].length === 3)
//         .sort((a, b) => a - b);
//       const twoPairValues = Object.keys(cardCounts)
//         .map((v) => Number(v))
//         .filter((v) => cardCounts[v].length === 2)
//         .sort((a, b) => a - b);
//
//       if (threePairValues.length > 0 && twoPairValues.length > 0) {
//         const secondValue =
//           threePairValues.length > 1 ? threePairValues[1] : twoPairValues[0];
//
//         const winnerKey = `${threePairValues[0]}.${secondValue}`;
//         if (!fullHouseWinners[winnerKey]) {
//           fullHouseWinners[winnerKey] = [];
//         }
//         fullHouseWinners[winnerKey].push(player);
//         winnerSet.add(player);
//       }
//     }
//   }
//
//   sortWinners(fullHouseWinners, winners);
// }
//
// export function checkFlush(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const flushWinners: Record<string, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const flushCards = getFlushArray(sortedCards);
//
//         if (flushCards) {
//           const flushSuit = flushCards[0].suit;
//           if (!flushWinners[flushSuit]) {
//             flushWinners[flushSuit] = [];
//           }
//
//           flushWinners[flushSuit].push(player);
//           winnerSet.add(player);
//         }
//       }
//     }
//     sortWinners(flushWinners, winners);
//   }
// }
//
// export function checkStraight(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const straightWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         // check for straight
//         const sequence: Sequence = findLongestConsecutiveSequence(sortedCards);
//         const sequenceStartValue: number = sequence.startValue;
//
//         if (sequence.length >= 5) {
//           if (!straightWinners[sequenceStartValue]) {
//             straightWinners[sequenceStartValue] = [];
//           }
//
//           straightWinners[sequenceStartValue].push(player);
//           winnerSet.add(player);
//         }
//       }
//     }
//
//     sortWinners(straightWinners, winners);
//   }
// }
//
// export function checkThreeOfAKind(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const threeOfAKindWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const threeOfAKindArray = getNOfKindArray(sortedCards, 3);
//
//         if (threeOfAKindArray) {
//           const threeOfAKindValue = threeOfAKindArray[0].value;
//           if (!threeOfAKindWinners[threeOfAKindValue]) {
//             threeOfAKindWinners[threeOfAKindValue] = [];
//           }
//
//           threeOfAKindWinners[threeOfAKindValue].push(player);
//           winnerSet.add(player);
//         }
//       }
//     }
//
//     sortWinners(threeOfAKindWinners, winners);
//   }
// }
// export function checkTwoPair(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const twoPairWinners: Record<string, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const higherPairArray = getNOfKindArray(sortedCards, 2);
//
//         if (higherPairArray) {
//           const higherPairValue = higherPairArray[0].value;
//           const remainingCards = sortedCards.filter(
//             (card) => card.value !== higherPairValue,
//           );
//           const lowerPairArray = getNOfKindArray(remainingCards, 2);
//
//           if (lowerPairArray) {
//             const lowerPairValue = lowerPairArray[0].value;
//             const key = `${higherPairValue},${lowerPairValue}`;
//
//             if (!twoPairWinners[key]) {
//               twoPairWinners[key] = [];
//             }
//
//             twoPairWinners[key].push(player);
//             winnerSet.add(player);
//           }
//         }
//       }
//     }
//
//     sortWinners(twoPairWinners, winners);
//   }
// }
// export function checkOnePair(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const onePairWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const onePairArray = getNOfKindArray(sortedCards, 2);
//
//         if (onePairArray) {
//           const onePairValue = onePairArray[0].value;
//           if (!onePairWinners[onePairValue]) {
//             onePairWinners[onePairValue] = [];
//           }
//
//           onePairWinners[onePairValue].push(player);
//           winnerSet.add(player);
//         }
//       }
//     }
//
//     sortWinners(onePairWinners, winners);
//   }
// }
//
// export function checkHighCard(
//   winners: Array<Array<PlayerWithUserInfo>>,
//   winnerSet: Set<PlayerWithUserInfo>,
//   players: Array<PlayerWithUserInfo>,
//   cards: Record<string, Array<ICard>>,
// ) {
//   if (players) {
//     const highCardWinners: Record<number, Array<PlayerWithUserInfo>> = {};
//
//     for (const player of players) {
//       if (!winnerSet.has(player)) {
//         const playerCards: Array<ICard> = cards[player.player_id];
//         const sortedCards: Array<ICard> = sortCards(playerCards);
//
//         const highestCardValue = sortedCards[0].value;
//
//         if (!highCardWinners[highestCardValue]) {
//           highCardWinners[highestCardValue] = [];
//         }
//
//         highCardWinners[highestCardValue].push(player);
//         winnerSet.add(player);
//       }
//     }
//
//     sortWinners(highCardWinners, winners);
//   }
// }
//
// function getCardValueCounts(cards: Array<ICard>) {
//   const counts: Record<number, Array<ICard>> = {};
//
//   cards.forEach((card) => {
//     if (counts[card.value]) {
//       counts[card.value].push(card);
//     } else {
//       counts[card.value] = [card];
//     }
//   });
//
//   return counts;
// }
//
// function getFlushArray(cards: Array<ICard>): Array<ICard> | null {
//   // "suit" : [Card1, ..., Card4]
//   const counts: Record<string, Array<ICard>> = {};
//
//   cards.forEach((card) => {
//     if (counts[card.suit]) {
//       counts[card.suit].push(card);
//     } else {
//       counts[card.suit] = [card];
//     }
//   });
//
//   for (const s in counts) {
//     if (counts[s].length >= 5) {
//       return counts[s];
//     }
//   }
//
//   return null;
// }
//
// function getNOfKindArray(cards: Array<ICard>, n: number): Array<ICard> | null {
//   const counts: Record<number, Array<ICard>> = {};
//
//   cards.forEach((card) => {
//     if (counts[card.value]) {
//       counts[card.value].push(card);
//     } else {
//       counts[card.value] = [card];
//     }
//   });
//
//   for (const cardValue in counts) {
//     if (counts[cardValue].length >= n) {
//       return counts[cardValue];
//     }
//   }
//
//   return null;
// }
//
// function sortCards(cards: Array<ICard>): Array<ICard> {
//   const sortedCards = cards.sort((a, b) => {
//     // Negative return value indicates a should come before b
//     if (a.value > b.value) {
//       return -1;
//     }
//
//     if (a.value < b.value) {
//       return 1;
//     }
//
//     return 0;
//   });
//
//   return sortedCards;
// }
//
// function findLongestConsecutiveSequence(cards: Array<ICard>): Sequence {
//   const set = new Set();
//   let longestConsecutiveSequence = 0;
//   let startValue = 0;
//
//   for (const card of cards) {
//     if (!set.has(card.value - 1)) {
//       let currentVal = card.value;
//       let currentSeq = 1;
//       while (set.has(currentVal + 1)) {
//         currentVal += 1;
//         currentSeq += 1;
//       }
//       if (currentSeq > longestConsecutiveSequence) {
//         longestConsecutiveSequence = currentSeq;
//         startValue = card.value;
//       }
//     }
//     set.add(card.value);
//   }
//
//   return { length: longestConsecutiveSequence, startValue };
// }
//
// function sortWinners(
//   unsortedWinners: Record<number | string, Array<PlayerWithUserInfo>>,
//   winners: Array<Array<PlayerWithUserInfo>>,
// ) {
//   const sortedWinners = Object.entries(unsortedWinners).sort(
//     ([a], [b]) => Number(a) - Number(b),
//   );
//   sortedWinners.forEach(([_, players]) => {
//     if (players.length > 1) {
//       winners.push(players);
//     } else {
//       winners.push([players[0]]);
//     }
//   });
// }
