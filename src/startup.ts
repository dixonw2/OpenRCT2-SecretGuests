import {
  registerSecretGuestActions,
  startSecretGuestInterval,
} from "./spawning";
import { openSecretGuestsWindow, setSelectedGuestDescription } from "./window";

export function startup(): void {
  registerSecretGuestActions();

  startSecretGuestInterval((guest) => {
    setSelectedGuestDescription(guest);
  });

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Guests", () => openSecretGuestsWindow());
  }
}
