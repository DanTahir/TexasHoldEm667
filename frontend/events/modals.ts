const modalForm = document.getElementById("modal-form") as HTMLFormElement;
const modalDialog = document.getElementById(
  "create-game-modal",
) as HTMLDialogElement | null;
const createGameButton = document.getElementById("create-game");
const settingsModalForm = document.getElementById(
  "settings-modal-form",
) as HTMLFormElement;
const settingsModalDialog = document.getElementById(
  "settings-modal",
) as HTMLDialogElement | null;
const settingsButton = document.getElementById("settings");

export function handle() {
  createGameButton?.addEventListener("click", () => {
    modalDialog?.showModal();
  });

  modalDialog?.addEventListener("click", (event: Event) => {
    if (!modalForm.contains(event.target as HTMLElement)) {
      modalDialog.close();
    }
  });

  settingsButton?.addEventListener("click", () => {
    settingsModalDialog?.showModal();
  });

  settingsModalDialog?.addEventListener("click", (event: Event) => {
    if (!settingsModalForm.contains(event.target as HTMLElement)) {
      settingsModalDialog.close();
    }
  });
}
