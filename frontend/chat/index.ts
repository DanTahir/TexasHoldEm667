import { io } from "socket.io-client";

console.log("Hello from the chat script.");

const chatSocket = io();

chatSocket.on("chat:message:0", (payload) => {
  console.log({ payload });
});

document
  .querySelector("#messageInput")
  ?.addEventListener("keydown", (event) => {
    if (event.keyCode === 13) {
      const message = event.target.value;

      fetch("/chat/0", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      event.target.value = "";
    }
  });
