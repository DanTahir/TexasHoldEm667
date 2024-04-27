import { io } from "socket.io-client";

const chatSocket = io();

const chatWindow = document.querySelector("#chatbox") ?? new HTMLDivElement();

chatSocket.on("chat:message:0", ({ from, message }) => {
  const msgDiv = document.querySelector("#chatMessage") as HTMLTemplateElement;
  const msgDivCloneNode = msgDiv.content.cloneNode(true);
  const msgDivCloneDiv = msgDivCloneNode as HTMLDivElement;
  const messageUser =
    (msgDivCloneDiv.querySelector(
      "#chatMessageUser",
    ) as HTMLParagraphElement) ?? new HTMLParagraphElement();
  const messageText =
    (msgDivCloneDiv.querySelector(
      "#chatMessageText",
    ) as HTMLParagraphElement) ?? new HTMLParagraphElement();
  messageUser.innerText = from;
  messageText.innerText = message;

  chatWindow.appendChild(msgDivCloneNode);
});

document
  .querySelector("#messageInput")
  ?.addEventListener("keydown", (event: Event) => {
    if ((event as KeyboardEvent).key === "Enter") {
      const message = (event.target as HTMLInputElement).value;

      console.log(message);

      fetch("/chat/0", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      (event.target as HTMLInputElement).value = "";
    }
  });
