import { Socket } from "socket.io-client";

const chatWindow = document.getElementById("chatbox");
const roomID = (document.getElementById("room-id") as HTMLInputElement).value;
const messageTemplate = document.getElementById(
  "chatMessage",
) as HTMLTemplateElement;

export function handle(chatSocket: Socket) {
  chatSocket.on(`chat:message:${roomID}`, ({ from, message }) => {
    const newMessageDiv = messageTemplate.content.cloneNode(
      true,
    ) as HTMLDivElement;

    const messageUser = newMessageDiv.querySelector(
      "#chatMessageUser",
    ) as HTMLParagraphElement;
    const messageText = newMessageDiv.querySelector(
      "#chatMessageText",
    ) as HTMLParagraphElement;
    messageUser.innerText = from;
    messageText.innerText = message;

    chatWindow?.appendChild(newMessageDiv);
  });
}
