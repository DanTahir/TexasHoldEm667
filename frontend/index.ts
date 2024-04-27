const modalDialog = document.getElementById(
  "create-game-modal",
) as HTMLDialogElement;

document.getElementById("create-game")?.addEventListener("click", () => {
  modalDialog.showModal();
});
