const modalDialog = document.getElementById(
  "create-game-modal",
) as HTMLDialogElement;

const modalForm = document.getElementById("modal-form") as HTMLFormElement;

document.getElementById("create-game")?.addEventListener("click", () => {
  modalDialog.showModal();
});

modalDialog.addEventListener("click", (event: Event) => {
  if (!modalForm.contains(event.target as HTMLElement)) {
    modalDialog.close();
  }
});
