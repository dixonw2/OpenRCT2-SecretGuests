import { SecretGuest, SECRET_GUESTS } from "./guests";
import { STORAGE_KEYS, DEFAULT_VALUES } from "./constants";

export function getBlacklistNames(): string[] {
  return context.sharedStorage.get<string[]>(STORAGE_KEYS.blacklist, [
    ...DEFAULT_VALUES.blacklistGuestsNames,
  ]);
}

export function saveBlacklistNames(
  blacklist: SecretGuest[] | string[] = [
    ...DEFAULT_VALUES.blacklistGuestsNames,
  ],
): void {
  const blacklistNames =
    blacklist.length === 0 || typeof blacklist[0] === "string"
      ? (blacklist as string[])
      : (blacklist as SecretGuest[]).map((guest) => guest.name);

  context.sharedStorage.set<string[]>(STORAGE_KEYS.blacklist, blacklistNames);
}

export function getSpawnChance(): number {
  return context.sharedStorage.get<number>(
    STORAGE_KEYS.spawnChance,
    DEFAULT_VALUES.spawnChance,
  );
}

export function saveSpawnChance(
  spawnChance: number = DEFAULT_VALUES.spawnChance,
): void {
  context.sharedStorage.set(STORAGE_KEYS.spawnChance, spawnChance);
}

export function getSpawnCountPerName(): number {
  return context.sharedStorage.get<number>(
    STORAGE_KEYS.spawnCountPerName,
    DEFAULT_VALUES.spawnCountPerName,
  );
}

export function saveSpawnCountPerName(
  spawnCountPerName: number = DEFAULT_VALUES.spawnCountPerName,
): void {
  context.sharedStorage.set(STORAGE_KEYS.spawnCountPerName, spawnCountPerName);
}

function getSpawnCountTotalDefault(): number {
  return SECRET_GUESTS.length + getCustomGuests().length;
}

export function getSpawnCountTotal(): number {
  return context.sharedStorage.get<number>(
    STORAGE_KEYS.spawnCountTotal,
    getSpawnCountTotalDefault(),
  );
}

export function saveSpawnCountTotal(
  spawnCountTotal: number = getSpawnCountTotalDefault(),
): void {
  context.sharedStorage.set(STORAGE_KEYS.spawnCountTotal, spawnCountTotal);
}

export function getNotifyOnSpawn(): boolean {
  return context.sharedStorage.get<boolean>(
    STORAGE_KEYS.notifyOnSpawn,
    DEFAULT_VALUES.notifyOnSpawn,
  );
}

export function saveNotifyOnSpawn(
  notifyOnSpawn: boolean = DEFAULT_VALUES.notifyOnSpawn,
): void {
  context.sharedStorage.set(STORAGE_KEYS.notifyOnSpawn, notifyOnSpawn);
}

// need to make list mutable for sharedStorage
function getDefaultCustomGuests(): SecretGuest[] {
  return DEFAULT_VALUES.customGuests.map((guest) => ({
    name: guest.name,
    description: guest.description,
    flags: [...guest.flags],
  }));
}

export function getCustomGuests(): SecretGuest[] {
  return context.sharedStorage.get<SecretGuest[]>(
    STORAGE_KEYS.customGuests,
    getDefaultCustomGuests(),
  );
}

export function saveCustomGuests(
  customGuests: SecretGuest[] = getDefaultCustomGuests(),
): void {
  // remove any original secret guest names
  customGuests = customGuests.filter((customGuest) =>
    SECRET_GUESTS.every((secretGuest) => secretGuest.name !== customGuest.name),
  );

  context.sharedStorage.set<SecretGuest[]>(
    STORAGE_KEYS.customGuests,
    customGuests,
  );
}
