import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handlePlayerFolds } from "./playerFold";
import { handle as handleNextPlayerActive } from "./nextPlayerActive";
import { handle as handleNextPlayerAnnounce } from "./nextPlayerAnnounce"

export const messageHandlers = [
    handleChatMessages, 
    handlePlayerJoins, 
    handlePlayerFolds, 
    handleNextPlayerActive,
    handleNextPlayerAnnounce
];
