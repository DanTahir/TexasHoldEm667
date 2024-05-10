import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handlePlayerQuits } from "./playerQuit";

export const messageHandlers = [
  handleChatMessages,
  handlePlayerJoins,
  handlePlayerQuits,
];
