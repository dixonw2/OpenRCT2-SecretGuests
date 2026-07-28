import {
  SecretGuest,
  BLACKLIST_GUESTS_NAMES_DEFAULT,
  CUSTOM_GUESTS_DEFAULT,
} from "./guests";

import { getAllGuests } from "./guestLists";

export const BLACKLIST_STORAGE_KEY = "SecretGuests.blacklist";
export const SPAWN_CHANCE_STORAGE_KEY = "SecretGuests.spawnChance";
export const SPAWN_COUNT_PER_NAME_STORAGE_KEY =
  "SecretGuests.spawnCountPerName";
export const SPAWN_COUNT_TOTAL_STORAGE_KEY = "SecretGuests.spawnCountTotal";
export const NOTIFY_ON_SPAWN_STORAGE_KEY = "SecretGuests.notifyOnSpawn";
export const CUSTOM_GUESTS_STORAGE_KEY = "SecretGuests.customGuests";

export const SPAWN_CHANCE_DEFAULT = 0.5;
export const SPAWN_COUNT_PER_NAME_DEFAULT = 1;
export const SPAWN_COUNT_TOTAL_DEFAULT = getAllGuests().length;

export const NOTIFY_ON_SPAWN_DEFAULT = false;

export const SPAWN_COUNT_PER_NAME_MAX = 999;
export const SPAWN_COUNT_TOTAL_MAX = 999;

export function getBlacklistNames(): string[] {
  return context.sharedStorage.get<string[]>(
    BLACKLIST_STORAGE_KEY,
    BLACKLIST_GUESTS_NAMES_DEFAULT,
  );
}

export function saveBlacklistNames(
  blacklist: SecretGuest[] | string[] = BLACKLIST_GUESTS_NAMES_DEFAULT,
): void {
  const blacklistNames =
    blacklist.length === 0 || typeof blacklist[0] === "string"
      ? (blacklist as string[])
      : (blacklist as SecretGuest[]).map((guest) => guest.name);

  context.sharedStorage.set<string[]>(BLACKLIST_STORAGE_KEY, blacklistNames);
}

export function getSpawnChance(): number {
  return context.sharedStorage.get<number>(
    SPAWN_CHANCE_STORAGE_KEY,
    SPAWN_CHANCE_DEFAULT,
  );
}

export function saveSpawnChance(
  spawnChance: number = SPAWN_CHANCE_DEFAULT,
): void {
  context.sharedStorage.set(SPAWN_CHANCE_STORAGE_KEY, spawnChance);
}

export function getSpawnCountPerName(): number {
  return context.sharedStorage.get<number>(
    SPAWN_COUNT_PER_NAME_STORAGE_KEY,
    SPAWN_COUNT_PER_NAME_DEFAULT,
  );
}

export function saveSpawnCountPerName(
  spawnCountPerName: number = SPAWN_COUNT_PER_NAME_DEFAULT,
): void {
  context.sharedStorage.set(
    SPAWN_COUNT_PER_NAME_STORAGE_KEY,
    spawnCountPerName,
  );
}

export function getSpawnCountTotal(): number {
  return context.sharedStorage.get<number>(
    SPAWN_COUNT_TOTAL_STORAGE_KEY,
    SPAWN_COUNT_TOTAL_DEFAULT,
  );
}

export function saveSpawnCountTotal(
  spawnCountTotal: number = SPAWN_COUNT_TOTAL_DEFAULT,
): void {
  context.sharedStorage.set(SPAWN_COUNT_TOTAL_STORAGE_KEY, spawnCountTotal);
}

export function getNotifyOnSpawn(): boolean {
  return context.sharedStorage.get<boolean>(
    NOTIFY_ON_SPAWN_STORAGE_KEY,
    NOTIFY_ON_SPAWN_DEFAULT,
  );
}

export function saveNotifyOnSpawn(
  notifyOnSpawn: boolean = NOTIFY_ON_SPAWN_DEFAULT,
): void {
  context.sharedStorage.set(NOTIFY_ON_SPAWN_STORAGE_KEY, notifyOnSpawn);
}

export function getCustomGuests(): SecretGuest[] {
  return context.sharedStorage.get<SecretGuest[]>(
    CUSTOM_GUESTS_STORAGE_KEY,
    CUSTOM_GUESTS_DEFAULT,
  );
}

export function saveCustomGuests(
  customGuests: SecretGuest[] = CUSTOM_GUESTS_DEFAULT,
) {
  context.sharedStorage.set<SecretGuest[]>(
    CUSTOM_GUESTS_STORAGE_KEY,
    customGuests,
  );
}
