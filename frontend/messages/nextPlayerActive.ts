import { Socket } from "socket.io-client";

const roomID = (document.getElementById("room-id") as HTMLInputElement).value;



export function handle(socket: Socket) {
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
  socket.on(`game:activatenewplayer:${roomID}`, () => {
    console.log("Hello from the frontend socket after playerid=userid");
    const foldDiv = document.getElementById("fold-button") as HTMLDivElement;
    const raiseDiv = document.getElementById("raise-button") as HTMLDivElement;
    const callCheckDiv = document.getElementById("call-check-button") as HTMLDivElement
    if (!foldDiv || !raiseDiv || !callCheckDiv) {
        return;
    }
    const foldButton = foldDiv.querySelector("button");
    const raiseButton = raiseDiv.querySelector("button");
    const callCheckButton = callCheckDiv.querySelector("button");
    if (!foldButton || !raiseButton || !callCheckButton) {
        return;
    }

    const raiseHandler = () => {

    }
    
    const callCheckHandler = () => {

    }
    
    const foldHandler = () => {
        foldButton.textContent = "Folding...";
        foldButton.removeEventListener("click", foldHandler);
        raiseButton.removeEventListener("click", raiseHandler);
        callCheckButton.removeEventListener("click", callCheckHandler);

    
  
        fetch(`/game/${roomID}/fold`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            
          }),
        }).then(async (res) => {
          if (!res.ok) {
            foldButton.textContent = "Fold";
            foldButton.addEventListener("click", foldHandler);
            raiseButton.addEventListener("click", raiseHandler);
            callCheckButton.addEventListener("click", callCheckHandler);
            alert(await res.text());
          }
        });
      };
  
      foldButton.addEventListener("click", foldHandler);
      raiseButton.addEventListener("click", raiseHandler);
      callCheckButton.addEventListener("click", callCheckHandler);
});
}
