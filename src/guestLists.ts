import { SecretGuest, SECRET_GUESTS } from "./guests";
import { getBlacklistNames } from "./storage";

export function getBlacklist(): SecretGuest[] {
  return SECRET_GUESTS.filter(
    (guest) => getBlacklistNames().indexOf(guest.name) !== -1,
  );
}

export function getWhitelist(): SecretGuest[] {
  return SECRET_GUESTS.filter((guest) =>
    getBlacklist().every(
      (blacklistedGuest) => blacklistedGuest.name !== guest.name,
    ),
  );
}
