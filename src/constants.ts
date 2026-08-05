export const WINDOW_CLASSIFICATIONS = {
  mainMenuWindow: "secret-guests",
  confirmResetSettingsWindow: "secret-guests-reset-settings-confirm",
  customGuestsWindow: "secret-guests-custom-guests-manager",
} as const;

export const WIDGET_NAMES = {
  label: {
    spawnChance: "spawn-chance-label",
    customSpawnWeight: "custom-spawn-weight-label",
    spawnCountPerName: "spawn-count-per-name-label",
    customSpawnCountForName: "custom-spawn-count-for-name-label",
    spawnCountTotal: "spawn-count-total-label",
    selectedGuestDescription: "selected-guest-description-label",
    selectedCustomGuestDescription: "selected-custom-guest-description-label",
    customGuestName: "custom-guest-name-label",
    customGuestDescription: "custom-guest-description-label",
  },
  spinner: {
    spawnChance: "spawn-chance-spinner",
    customSpawnWeight: "custom-spawn-weight-spinner",
    spawnCountPerName: "spawn-count-per-name-spinner",
    customSpawnCountForName: "custom-spawn-count-for-name-spinner",
    spawnCountTotal: "spawn-count-total-spinner",
  },
  button: {
    forceSpawn: "force-spawn-button",
    resetSettings: "reset-settings-button",
    moveToBlacklist: "move-guest-to-blacklist-button",
    moveToWhitelist: "move-guest-to-whitelist-button",
    clearSelectedGuest: "clear-selected-guest-button",
    openCustomGuestsManager: "open-custom-guests-manager-button",
    addCustomGuest: "add-custom-guest-button",
    deleteCustomGuest: "delete-custom-guest-button",
    newCustomGuest: "new-custom-guest-button",
  },
  checkbox: {
    notifyOnSpawn: "notify-on-spawn-checkbox",
    useCustomGuestSpawnSettings: "use-custom-guest-spawn-settings-checkbox",
  },
  listview: {
    whitelist: "whitelist-listview",
    blacklist: "blacklist-listview",
    customGuests: "custom-guests-listview",
  },
  textbox: {
    customGuestName: "custom-guest-name-textbox",
    customGuestDescription: "custom-guest-description-textbox",
  }
} as const;

export const STORAGE_KEYS = {
  blacklist: "SecretGuests.blacklist",
  spawnChance: "SecretGuests.spawnChance",
  spawnCountPerName: "SecretGuests.spawnCountPerName",
  spawnCountTotal: "SecretGuests.spawnCountTotal",
  notifyOnSpawn: "SecretGuests.notifyOnSpawn",
  customGuests: "SecretGuests.customGuests",
  guestsCustomSpawnSettings: "SecretGuests.guestsCustomSpawnSettings",
} as const;

export const DEFAULT_VALUES = {
  spawnChance: 0.5,
  spawnWeight: 1,
  spawnWeightMax: 999,
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

export const BACKGROUND_UI_REFRESH_TICKS = 40;
