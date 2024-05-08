import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handlePlayerFoldRaiseCall } from "./playerFoldRaiseCall";
import { handle as handleNextPlayerActive } from "./nextPlayerActive";
import { handle as handleNextPlayerAnnounce } from "./nextPlayerAnnounce"

export const messageHandlers = [
    handleChatMessages, 
    handlePlayerJoins, 
    handlePlayerFoldRaiseCall, 
    handleNextPlayerActive,
    handleNextPlayerAnnounce
];
