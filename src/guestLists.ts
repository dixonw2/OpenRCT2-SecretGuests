import {
  SecretGuest,
  SECRET_GUESTS,
  SecretGuestCustomSpawnSettings,
  SecretGuestWithCustomSpawnSettings,
} from "./guests";
import {
  getBlacklistNames,
  getCustomGuests,
  getGuestsCustomSpawnSettings,
} from "./storage";

export function getBlacklist(): SecretGuestWithCustomSpawnSettings[] {
  return getAllGuests().filter(
    (guest) => getBlacklistNames().indexOf(guest.name) !== -1,
  );
}

export function getWhitelist(): SecretGuestWithCustomSpawnSettings[] {
  return getAllGuests().filter(
    (guest) => getBlacklistNames().indexOf(guest.name) === -1,
  );
}

export function getAllGuests(): SecretGuestWithCustomSpawnSettings[] {
  function getCustomSpawnSettingsForGuest(
    guest: SecretGuest,
    settings: SecretGuestCustomSpawnSettings[],
  ): SecretGuestCustomSpawnSettings | undefined {
    return settings.filter((setting) => setting.name === guest.name)[0];
  }

  const customSpawnSettings = getGuestsCustomSpawnSettings();

  return SECRET_GUESTS.concat(getCustomGuests()).map((guest) => {
    const settings = getCustomSpawnSettingsForGuest(guest, customSpawnSettings);

    return settings === undefined
      ? guest
      : {
          ...guest,
          enableCustomSpawnSettings: settings.enableCustomSpawnSettings,
          customSpawnWeight: settings.customSpawnWeight,
          customSpawnCount: settings.customSpawnCount,
        };
  });
}

export function getGuestNames<T extends SecretGuest>(guests: T[]): string[] {
  return guests.map((guest) => guest.name);
}
