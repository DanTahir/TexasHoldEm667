export function handle() {
  window.onload = function () {
    const url = document.location.pathname.split("/")[1];

    if (url === "game") {
      const gameID = document.location.pathname.split("/")[2];
      fetch(`/game/${gameID}/checkCurrentPlayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    }
  };
}
