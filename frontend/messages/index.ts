import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";

export const messageHandlers = [handleChatMessages, handlePlayerJoins];
