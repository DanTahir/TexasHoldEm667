import { handle as handleModals } from "./modals";
import { handle as handleChatMessages } from "./chatMessages";
import { handle as handleJoinButtons } from "./games";
import { handle as handleCurrentPlayer } from "./loadCurrentPlayer";
import { handle as handleQuitButton } from "./quitGames";

export const eventHandlers = [
  handleModals,
  handleChatMessages,
  handleJoinButtons,
  handleCurrentPlayer,
  handleQuitButton,
];
