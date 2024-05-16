import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handleGameStart } from "./gameStart";
import { handle as handlePlayerFoldRaiseCall } from "./playerFoldRaiseCall";
import { handle as handleNextPlayerActive } from "./nextPlayerActive";
import { handle as handleNextPlayerAnnounce } from "./nextPlayerAnnounce";
import { handle as handlePlayerQuits } from "./playerQuit";
import { handle as handleDealCards } from "./dealCards";
import { handle as handleShowStageCards } from "./showStageCards";
import { handle as handleGameCreation } from "./gameCreate";

export const messageHandlers = [
  handleChatMessages,
  handlePlayerJoins,
  handleGameStart,
  handlePlayerJoins,
  handlePlayerFoldRaiseCall,
  handleNextPlayerActive,
  handleNextPlayerAnnounce,
  handlePlayerQuits,
  handleDealCards,
  handleShowStageCards,
  handleGameCreation,
];
