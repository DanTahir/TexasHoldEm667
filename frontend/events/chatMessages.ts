const messageInputBox = document.getElementById("messageInput");

export function handle() {
  messageInputBox?.addEventListener("keydown", (event: KeyboardEvent) => {
    const target = event.target as HTMLInputElement;

    if (event.key === "Enter") {
      const message = target.value;
      console.log("you hit enter");
      fetch(`${document.location.pathname}/chat`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      target.value = "";
    }
  });
}
