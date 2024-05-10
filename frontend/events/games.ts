export function handle() {
  const allSeats = document.querySelectorAll(".seat");
  allSeats.forEach((seat, i) => {
    if (!seat.classList.contains("empty-seat")) {
      return;
    }
    console.log(`hi from seat ${i + 1}`);

    const button = seat.querySelector("button");

    if (!button) return;

    const handler = () => {
      button.textContent = "Joining...";
      button.removeEventListener("click", handler);

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
          button.addEventListener("click", handler);
          alert(await res.text());
        }
      });
    };

    button.addEventListener("click", handler);
  });
}
