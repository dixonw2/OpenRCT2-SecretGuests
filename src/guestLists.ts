import {
  SecretGuest,
  SECRET_GUESTS,
  SecretGuestCustomSpawnSettings,
} from "./guests";
import {
  getBlacklistNames,
  getCustomGuests,
  getGuestsCustomSpawnSettings,
} from "./storage";

export function getBlacklist(): SecretGuest[] {
  const blacklistNames = getBlacklistNames();
  return getAllGuests().filter(
    (guest) => blacklistNames.indexOf(guest.name) !== -1,
  );
}

export function getWhitelist(): SecretGuest[] {
  const blacklistNames = getBlacklistNames();
  return getAllGuests().filter(
    (guest) => blacklistNames.indexOf(guest.name) === -1,
  );
}

function getCustomSpawnSettingsForGuest(
  guest: SecretGuest,
  settings: SecretGuestCustomSpawnSettings[],
): SecretGuestCustomSpawnSettings | undefined {
  for (const setting of settings) {
    if (setting.name === guest.name) {
      return setting;
    }
  }
  return undefined;
}

function applyCustomSpawnSettings(
  guest: SecretGuest,
  settings: SecretGuestCustomSpawnSettings[],
): SecretGuest {
  const customSettings = getCustomSpawnSettingsForGuest(guest, settings);

  if (customSettings === undefined) {
    return guest;
  }

  return {
    ...guest,
    enableCustomSpawnSettings: customSettings.enableCustomSpawnSettings,
    customSpawnWeight: customSettings.customSpawnWeight,
    customSpawnCount: customSettings.customSpawnCount,
  };
}

export function getAllGuests(): SecretGuest[] {
  const customSpawnSettings = getGuestsCustomSpawnSettings();
  const allGuests = SECRET_GUESTS.concat(getCustomGuests());

  return allGuests.map((guest) =>
    applyCustomSpawnSettings(guest, customSpawnSettings),
  );
}

export function getGuestNames<T extends SecretGuest>(guests: T[]): string[] {
  return guests.map((guest) => guest.name);
}
