import { startSecretCharacterInterval } from "./spawning";
import {
  openSecretCharactersWindow,
  updateOpenWindowDescriptionIfDisplayed,
} from "./window";

export function startup(): void {
  startSecretCharacterInterval((character) => {
    updateOpenWindowDescriptionIfDisplayed(character);
  });

  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Secret Character Spawner - Extended", () =>
      openSecretCharactersWindow(),
    );
  }
}
