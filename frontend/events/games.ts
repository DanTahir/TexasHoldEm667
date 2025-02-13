const allSeats = document.querySelectorAll(".seat");
const startButtonElement = document.querySelector(
  ".start-button",
) as HTMLDivElement | null;
const startButton = startButtonElement?.querySelector("button");
const resetButtonElement = document.querySelector(
  ".reset-button",
) as HTMLDivElement | null;
const resetButton = resetButtonElement?.querySelector("button");

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
        } else {
          seat.setAttribute("data-this-player", "true");
        }
      });
    };

    button.addEventListener("click", joinButtonHandler);
  });

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

  const resetButtonHandler = () => {
    if (!resetButton) return;

    resetButton.textContent = "Resetting...";
    //resetButton.removeEventListener("click", resetButtonHandler);

    const gameID = document.location.pathname.split("/")[2];

    fetch(`/game/${gameID}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      if (!res.ok) {
        resetButton.textContent = "Reset Round";
        //resetButton.addEventListener("click", resetButtonHandler);
        alert(await res.text());
      }
    });
  };

  if (resetButton) {
    resetButton.addEventListener("click", resetButtonHandler);
  }
}
