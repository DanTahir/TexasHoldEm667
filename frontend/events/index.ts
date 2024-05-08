import { handle as handleModals } from "./modals";
import { handle as handleChatMessages } from "./chatMessages";
import { handle as handleJoinButtons } from "./games";
import { handle as handleCurrentPlayer } from "./loadCurrentPlayer"

export const eventHandlers = [
  handleModals,
  handleChatMessages,
  handleJoinButtons,
  handleCurrentPlayer,
];
