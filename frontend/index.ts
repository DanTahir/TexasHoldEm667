import { Socket, io } from "socket.io-client";
import { eventHandlers } from "./events";
import { messageHandlers } from "./messages";

declare global {
  interface Window {
    socket: Socket;
  }
}

window.socket = io();

eventHandlers.forEach((handle) => handle());
messageHandlers.forEach((handler) => handler(window.socket));
