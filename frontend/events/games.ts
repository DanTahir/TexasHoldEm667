const allSeats = document.querySelectorAll(".seat");
const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement | null;
const startButton = startButtonElement?.querySelector("button");

export function handle() {
  allSeats.forEach((seat, i) => {
    if (!seat.classList.contains("empty-seat")) {
      return;
    }
    const button = seat.querySelector("button");

    if (!button) return;

    const joinButtonHandler = () => {
      button.textContent = "Joining...";
      button.removeEventListener("click", joinButtonHandler);

      const gameID = document.location.pathname.split("/")[2];

      fetch(`/game/${gameID}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playOrder: i + 1,
        }),
      }).then(async (res) => {
        if (!res.ok) {
          button.textContent = "Join";
          button.addEventListener("click", joinButtonHandler);
          alert(await res.text());
        }
      });
    };

    button.addEventListener("click", joinButtonHandler);
  });

  // Start button handling
  const startButtonHandler = () => {
    if (!startButton) return;

    startButton.textContent = "Starting...";
    startButton.removeEventListener("click", startButtonHandler);

    const gameID = document.location.pathname.split("/")[2];

    fetch(`/game/${gameID}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      if (!res.ok) {
        startButton.textContent = "Start";
        startButton.addEventListener("click", startButtonHandler);
        alert(await res.text());
      }
    });
  };

  if (startButton) {
    startButton.addEventListener("click", startButtonHandler);
  }
}
