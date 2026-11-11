/**
 * Opens a native modal and returns focus to the control that opened it. Safari does not focus a
 * clicked button, so the dialog's own focus return would land on <body>.
 */
export function showModalFrom(dialog: HTMLDialogElement | null, trigger: HTMLElement | null): void {
  if (!dialog) {
    return;
  }
  dialog.showModal();
  if (trigger) {
    dialog.addEventListener("close", () => trigger.focus({ preventScroll: true }), { once: true });
  }
}
