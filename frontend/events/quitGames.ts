const quitButtonNull = document.querySelector(".quit-button");
const quitButton = quitButtonNull ? quitButtonNull : new HTMLButtonElement();

export function handle() {
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
    });
  };

  quitButton.addEventListener("click", handler);
}
