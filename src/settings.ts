import {
  SecretCharacter,
  SECRET_CHARACTERS,
  BLACKLIST_CHARACTERS_NAMES_DEFAULT,
} from "./characters";

export const BLACKLIST_STORAGE_KEY = "SecretCharacterSpawnerExtended.blacklist";
export const SPAWN_CHANCE_STORAGE_KEY =
  "SecretCharacterSpawnerExtended.spawnChance";
export const SPAWN_COUNT_PER_NAME_STORAGE_KEY =
  "SecretCharacterSpawnerExtended.spawnCountPerName";
export const SPAWN_COUNT_TOTAL_STORAGE_KEY =
  "SecretCharacterSpawnerExtended.spawnCountTotal";

export const SPAWN_CHANCE_DEFAULT = 0.5;
export const SPAWN_COUNT_PER_NAME_DEFAULT = 1;
export const SPAWN_COUNT_TOTAL_DEFAULT = SECRET_CHARACTERS.length;

export const SPAWN_COUNT_PER_NAME_MAX = 999;
export const SPAWN_COUNT_TOTAL_MAX = 999;

// change this to default to a default constant? Maybe with blacklist of negative characters?
export function getBlacklistNames(): string[] {
  return context.sharedStorage.get<string[]>(
    BLACKLIST_STORAGE_KEY,
    BLACKLIST_CHARACTERS_NAMES_DEFAULT,
  );
}

export function saveBlacklistNames(
  blacklist?: SecretCharacter[] | string[],
): void {
  if (blacklist === undefined) {
    blacklist = BLACKLIST_CHARACTERS_NAMES_DEFAULT;
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
    (blacklist as SecretCharacter[]).map((character) => character.name),
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

export function getBlacklist(): SecretCharacter[] {
  return SECRET_CHARACTERS.filter(
    (character) => getBlacklistNames().indexOf(character.name) !== -1,
  );
}

export function getWhitelist(): SecretCharacter[] {
  return SECRET_CHARACTERS.filter((character) =>
    getBlacklist().every(
      (blacklistedCharacter) => blacklistedCharacter.name !== character.name,
    ),
  );
}
