const seats = document.querySelectorAll(".seat");

export function handle() {
  seats.forEach(function (seat) {
    const button = seat.querySelector("button");

    if (!button) return;

    button.addEventListener("click", function () {
      const currentTextContent = this.textContent;

      if (currentTextContent === "Join") {
        this.textContent = "Waiting";
        return;
      }

      this.textContent = "Join";
    });
  });
}
