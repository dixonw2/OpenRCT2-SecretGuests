import { SecretGuest, SECRET_GUESTS } from "./guests";
import { getBlacklistNames, getCustomGuests } from "./storage";

export function getBlacklist(): SecretGuest[] {
  return getAllGuests().filter(
    (guest) => getBlacklistNames().indexOf(guest.name) !== -1,
  );
}

export function getWhitelist(): SecretGuest[] {
  return getAllGuests().filter(
    (guest) => getBlacklistNames().indexOf(guest.name) === -1,
  );
}

export function getAllGuests(): SecretGuest[] {
  return SECRET_GUESTS.concat(getCustomGuests());
}

export function getGuestNames(guests: SecretGuest[]): string[] {
  return guests.map((guest) => guest.name);
}
