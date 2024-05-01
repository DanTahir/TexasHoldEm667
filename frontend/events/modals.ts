const modalForm = document.getElementById("modal-form") as HTMLFormElement;
const modalDialog = document.getElementById(
  "create-game-modal",
) as HTMLDialogElement | null;
const createGameButton = document.getElementById("create-game");

export function handle() {
  createGameButton?.addEventListener("click", () => {
    modalDialog?.showModal();
  });

  modalDialog?.addEventListener("click", (event: Event) => {
    if (!modalForm.contains(event.target as HTMLElement)) {
      modalDialog.close();
    }
  });
}
