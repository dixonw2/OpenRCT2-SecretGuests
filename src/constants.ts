export const WINDOW_CLASSIFICATIONS = {
  mainMenuWindow: "secret-guests",
  confirmResetSettingsWindow: "secret-guests-reset-settings-confirm",
} as const;

export const WIDGET_NAMES = {
  label: {
    spawnChance: "spawn-chance-label",
    spawnCountPerName: "spawn-count-per-name-label",
    spawnCountTotal: "spawn-count-total-label",
    guestDescription: "guest-description-label",
  },
  spinner: {
    spawnChance: "spawn-chance-spinner",
    spawnCountPerName: "spawn-count-per-name-spinner",
    spawnCountTotal: "spawn-count-total-spinner",
  },
  button: {
    forceSpawn: "force-spawn-button",
    resetSettings: "reset-settings-button",
  },
  checkbox: {
    notifyOnSpawn: "notify-on-spawn-checkbox",
  },
  listview: {
    whitelist: "whitelist-listview",
    blacklist: "blacklist-listview",
  },
} as const;

export const STORAGE_KEYS = {
  blacklist: "SecretGuests.blacklist",
  spawnChance: "SecretGuests.spawnChance",
  spawnCountPerName: "SecretGuests.spawnCountPerName",
  spawnCountTotal: "SecretGuests.spawnCountTotal",
  notifyOnSpawn: "SecretGuests.notifyOnSpawn",
  customGuests: "SecretGuests.customGuests",
} as const;

export const DEFAULT_VALUES = {
  spawnChance: 0.5,
  spawnCountPerName: 1,
  spawnCountPerNameMax: 999,
  spawnCountTotalMax: 999,
  notifyOnSpawn: false,
  blacklistGuestsNames: [
    "Katie Rodger",
    "Lisa Stirling",
    "Eilidh Bell",
    "Felicity Anderson",
    "Corina Massoura",
    "Donald MacRae",
  ],
  customGuests: [
    {
      name: "FleetingDream",
      description: "His impressive talent astounds all",
      flags: ["photo", "painting", "waving"],
    },
  ],
} as const;
