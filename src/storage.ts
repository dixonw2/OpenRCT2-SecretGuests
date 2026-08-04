import {
  SecretGuest,
  SECRET_GUESTS,
  SecretGuestCustomSpawnSettings,
} from "./guests";
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

export function getSpawnCountTotal(): number {
  return context.sharedStorage.get<number>(
    STORAGE_KEYS.spawnCountTotal,
    getSpawnCountTotalDefault(),
  );
}

function getSpawnCountTotalDefault(): number {
  return SECRET_GUESTS.length + getCustomGuests().length;
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

export function saveCustomGuests(customGuests: SecretGuest[]): void {
  // remove any original secret guest names
  customGuests = customGuests.filter((customGuest) =>
    SECRET_GUESTS.every((secretGuest) => secretGuest.name !== customGuest.name),
  );

  const customGuestNames = customGuests.map((customGuest) => customGuest.name);
  saveGuestsCustomSpawnSettings(
    getGuestsCustomSpawnSettings().filter(
      (setting) =>
        SECRET_GUESTS.some(
          (secretGuest) => secretGuest.name === setting.name,
        ) || customGuestNames.indexOf(setting.name) !== -1,
    ),
  );

  context.sharedStorage.set<SecretGuest[]>(
    STORAGE_KEYS.customGuests,
    customGuests,
  );
}

export function getGuestsCustomSpawnSettings(): SecretGuestCustomSpawnSettings[] {
  return context.sharedStorage.get<SecretGuestCustomSpawnSettings[]>(
    STORAGE_KEYS.guestsCustomSpawnSettings,
    [],
  );
}

export function saveGuestsCustomSpawnSettings(
  settings: SecretGuestCustomSpawnSettings[],
): void {
  context.sharedStorage.set<SecretGuestCustomSpawnSettings[]>(
    STORAGE_KEYS.guestsCustomSpawnSettings,
    settings,
  );
}

export function saveCustomSpawnSettingsForGuest(
  name: string,
  {
    enableCustomSpawnSettings,
    customSpawnWeight,
    customSpawnCount,
  }: {
    enableCustomSpawnSettings?: boolean;
    customSpawnWeight?: number;
    customSpawnCount?: number;
  },
): void {
  const settings = getGuestsCustomSpawnSettings().filter(
    (setting) => setting.name !== name,
  );

  saveGuestsCustomSpawnSettings(
    settings.concat([
      {
        name,
        enableCustomSpawnSettings,
        customSpawnWeight,
        customSpawnCount,
      },
    ]),
  );
}

export function deleteGuestsCustomSettings(name: string): void {
  saveGuestsCustomSpawnSettings(
    getGuestsCustomSpawnSettings().filter((setting) => setting.name !== name),
  );
}
