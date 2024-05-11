export function handle() {
  const quitButtonDivNull = document.querySelector(".quit-button");
  const quitButtonDiv =
    quitButtonDivNull ? quitButtonDivNull : new HTMLDivElement();
  const quitButtonNull = quitButtonDiv.querySelector("button");
  const quitButton = quitButtonNull ? quitButtonNull : new HTMLButtonElement();
  const handler = () => {
    quitButton.textContent = "Quitting...";
    const gameID = document.location.pathname.split("/")[2];

    fetch(`/game/${gameID}/quit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playOrder: 1,
      }),
    }).then(async (res) => {
      quitButton.textContent = "Quit Game";
      if (!res.ok) {
        alert(await res.text());
      }

      location.href = "/";
    });
  };

  quitButton.addEventListener("click", handler);
}
