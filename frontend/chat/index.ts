import { io } from "socket.io-client";

console.log("Hello from the chat script.");

const chatSocket = io();

const chatWindow = document.querySelector("#chatbox");

chatSocket.on("chat:message:0", ({from, timestamp, message}) => {
  console.log("greetings from chatsocket");
  const msgDiv = document.querySelector("#chatMessage")?.content.cloneNode(true);
  const messageUser = msgDiv.querySelector("#chatMessageUser");
  const messageText = msgDiv.querySelector("#chatMessageText");
  messageUser.innerText = from;
  messageText.innerText = message;


  chatWindow.appendChild(msgDiv);

});

document.querySelector("#messageInput")?.addEventListener("keydown", (event) => {
    if (event.key === 'Enter') {
      const message = event.target.value;
      
      console.log(message);
      
        fetch("/chat/0", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          });
    
      

      event.target.value = "";
    }
});
