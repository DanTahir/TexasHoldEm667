import { handle as handleChatMessages } from "./chatMessage";
import { handle as handlePlayerJoins } from "./playerJoin";
import { handle as handlePlayerFoldRaiseCall } from "./playerFoldRaiseCall";
import { handle as handleNextPlayerActive } from "./nextPlayerActive";
import { handle as handleNextPlayerAnnounce } from "./nextPlayerAnnounce"
import { handle as handlePlayerQuits } from "./playerQuit";
export const messageHandlers = [
    handleChatMessages, 
    handlePlayerJoins, 
    handlePlayerFoldRaiseCall, 
    handleNextPlayerActive,
    handleNextPlayerAnnounce,
    handlePlayerQuits,

];
