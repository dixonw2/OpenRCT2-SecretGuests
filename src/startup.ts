import {
  registerSecretGuestActions,
  startSecretGuestInterval,
} from "./spawning";
import { openSecretGuestsWindow, updateOpenWindowDescription } from "./window";

export function startup(): void {
  registerSecretGuestActions();

  startSecretGuestInterval((guest) => {
    updateOpenWindowDescription(guest);
  });

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Guests", () => openSecretGuestsWindow());
  }
}
