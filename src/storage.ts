import {
  SecretGuest,
  SECRET_GUESTS,
  BLACKLIST_GUESTS_NAMES_DEFAULT,
} from "./guests";

export const BLACKLIST_STORAGE_KEY = "SecretGuests.blacklist";
export const SPAWN_CHANCE_STORAGE_KEY = "SecretGuests.spawnChance";
export const SPAWN_COUNT_PER_NAME_STORAGE_KEY =
  "SecretGuests.spawnCountPerName";
export const SPAWN_COUNT_TOTAL_STORAGE_KEY = "SecretGuests.spawnCountTotal";

export const SPAWN_CHANCE_DEFAULT = 0.5;
export const SPAWN_COUNT_PER_NAME_DEFAULT = 1;
export const SPAWN_COUNT_TOTAL_DEFAULT = SECRET_GUESTS.length;

export const SPAWN_COUNT_PER_NAME_MAX = 999;
export const SPAWN_COUNT_TOTAL_MAX = 999;

export function getBlacklistNames(): string[] {
  return context.sharedStorage.get<string[]>(
    BLACKLIST_STORAGE_KEY,
    BLACKLIST_GUESTS_NAMES_DEFAULT,
  );
}

export function saveBlacklistNames(blacklist?: SecretGuest[] | string[]): void {
  if (blacklist === undefined) {
    blacklist = BLACKLIST_GUESTS_NAMES_DEFAULT;
  }

  if (blacklist.length === 0) {
    context.sharedStorage.set<string[]>(BLACKLIST_STORAGE_KEY, []);
    return;
  }

  if (typeof blacklist[0] === "string") {
    context.sharedStorage.set<string[]>(
      BLACKLIST_STORAGE_KEY,
      blacklist as string[],
    );
    return;
  }

  context.sharedStorage.set(
    BLACKLIST_STORAGE_KEY,
    (blacklist as SecretGuest[]).map((guest) => guest.name),
  );
}

export function getSpawnChance(): number {
  return context.sharedStorage.get<number>(
    SPAWN_CHANCE_STORAGE_KEY,
    SPAWN_CHANCE_DEFAULT,
  );
}

export function saveSpawnChance(spawnChance?: number): void {
  if (spawnChance === undefined) {
    spawnChance = SPAWN_CHANCE_DEFAULT;
  }

  context.sharedStorage.set(SPAWN_CHANCE_STORAGE_KEY, spawnChance);
}

export function getSpawnCountPerName(): number {
  return context.sharedStorage.get<number>(
    SPAWN_COUNT_PER_NAME_STORAGE_KEY,
    SPAWN_COUNT_PER_NAME_DEFAULT,
  );
}

export function saveSpawnCountPerName(spawnCountPerName?: number): void {
  if (spawnCountPerName === undefined) {
    spawnCountPerName = SPAWN_COUNT_PER_NAME_DEFAULT;
  }

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

export function saveSpawnCountTotal(spawnCountTotal?: number): void {
  if (spawnCountTotal === undefined) {
    spawnCountTotal = SPAWN_COUNT_TOTAL_DEFAULT;
  }

  context.sharedStorage.set(SPAWN_COUNT_TOTAL_STORAGE_KEY, spawnCountTotal);
}
