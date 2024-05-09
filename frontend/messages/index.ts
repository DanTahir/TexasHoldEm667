import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handleGameStart } from "./gameStart";

export const messageHandlers = [
  handleChatMessages,
  handlePlayerJoins,
  handleGameStart,
];
