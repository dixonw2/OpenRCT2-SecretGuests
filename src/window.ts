import { SecretGuest, SecretGuestWithCustomSpawnSettings } from "./guests";
import {
  getBlacklist,
  getWhitelist,
  getGuestNames,
  getAllGuests,
} from "./guestLists";
import {
  getSpawnChance,
  getSpawnCountPerName,
  getSpawnCountTotal,
  getNotifyOnSpawn,
  saveBlacklistNames,
  saveSpawnChance,
  saveSpawnCountPerName,
  saveSpawnCountTotal,
  saveNotifyOnSpawn,
  saveCustomSpawnSettingsForGuest,
  saveGuestsCustomSpawnSettings,
  getGuestsCustomSpawnSettings,
} from "./storage";
import { getCurrentSecretCount, forceSpawnGuest } from "./spawning";
import { openCustomGuestsWindow } from "./customGuestsWindow";
import {
  getMainWindow,
  updateWidgetProperties,
  nextSelectIndexForList,
  showConfirmationWindow,
  formatNumberToDecimal,
} from "./windowUtilities";
import {
  WINDOW_CLASSIFICATIONS,
  WIDGET_NAMES,
  DEFAULT_VALUES,
  BACKGROUND_UI_REFRESH_TICKS,
} from "./constants";

export function setSelectedGuestDescription(
  selectedGuest: SecretGuest | null = null,
): void {
  let description = "";
  if (selectedGuest !== null) {
    description = `${selectedGuest.name}: ${selectedGuest.description} (Current: ${getCurrentSecretCount(selectedGuest.name)})`;
  }

  const mw = getMainWindow();

  if (mw !== null) {
    updateWidgetProperties(mw, WIDGET_NAMES.label.guestDescription, {
      text: description,
    });
  }
}

export function openSecretGuestsWindow(): void {
  // #region Properties
  let spawnChance = getSpawnChance();
  function setSpawnChance(value: number = DEFAULT_VALUES.spawnChance): void {
    spawnChance = value;
    saveSpawnChance(spawnChance);
    updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.spawnChance, {
      text: getSpawnChanceSpinnerText(),
    });
  }

  let spawnCountPerName = getSpawnCountPerName();
  function setSpawnCountPerName(
    value: number = DEFAULT_VALUES.spawnCountPerName,
  ): void {
    spawnCountPerName = value;
    saveSpawnCountPerName(spawnCountPerName);
    updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.spawnCountPerName, {
      text: spawnCountPerName.toString(),
    });
  }

  let spawnCountTotal = getSpawnCountTotal();
  function setSpawnCountTotal(value: number = getAllGuests().length): void {
    spawnCountTotal = value;
    saveSpawnCountTotal(spawnCountTotal);
    updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.spawnCountTotal, {
      text: spawnCountTotal.toString(),
    });
  }

  let notifyOnSpawn = getNotifyOnSpawn();
  function setNotifyOnSpawn(
    value: boolean = DEFAULT_VALUES.notifyOnSpawn,
  ): void {
    notifyOnSpawn = value;
    saveNotifyOnSpawn(notifyOnSpawn);
    updateWidgetProperties(mainWindow, WIDGET_NAMES.checkbox.notifyOnSpawn, {
      isChecked: notifyOnSpawn,
    });
  }

  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  function setSelectedGuestIndex(
    list: "whitelist" | "blacklist" | null = null,
    value: number = -1,
  ): void {
    if (list === "whitelist") {
      selectedWhitelistIndex = value;
      selectedBlacklistIndex = -1;

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
        selectedCell:
          selectedWhitelistIndex !== -1
            ? {
                row: selectedWhitelistIndex,
                column: 0,
              }
            : null,
      });

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
        selectedCell: null,
      });
    } else if (list === "blacklist") {
      selectedBlacklistIndex = value;
      selectedWhitelistIndex = -1;

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
        selectedCell:
          selectedBlacklistIndex !== -1
            ? {
                row: selectedBlacklistIndex,
                column: 0,
              }
            : null,
      });

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
        selectedCell: null,
      });
    } else {
      selectedWhitelistIndex = -1;
      selectedBlacklistIndex = -1;

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
        selectedCell: null,
      });

      updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
        selectedCell: null,
      });
    }

    refreshWhitelistNameButtonState();
    refreshBlacklistNameButtonState();
    refreshClearSelectedGuestButtonState();
    refreshGuestCustomSettingsWidgets();
    refreshForceSpawnButtonState();
  }

  let blacklist = getBlacklist();
  function setBlacklist(value?: SecretGuest[]) {
    saveBlacklistNames(value);
    blacklist = getBlacklist();
    whitelist = getWhitelist();
  }

  let whitelist = getWhitelist();
  // #endregion

  const existingMainWindow = getMainWindow();

  if (existingMainWindow !== null) {
    existingMainWindow.bringToFront();
    return;
  }

  let guestGenerationSubscription: IDisposable | null = null;
  let backgroundRefreshSubscription: IDisposable | null = null;

  const mainWindow = ui.openWindow({
    classification: WINDOW_CLASSIFICATIONS.mainMenuWindow,
    title: "Secret Guests",
    width: 500,
    height: 320,
    widgets: getWidgets(),
    onClose: () => {
      if (guestGenerationSubscription !== null) {
        guestGenerationSubscription.dispose();
        guestGenerationSubscription = null;
      }

      if (backgroundRefreshSubscription !== null) {
        backgroundRefreshSubscription.dispose();
        backgroundRefreshSubscription = null;
      }
    },
  });

  // refresh menu UI on guest spawn
  guestGenerationSubscription = context.subscribe("guest.generation", () => {
    refreshUiFromGameState();
  });

  // refresh menu UI every second
  // will update UI if a guest happens to leave, die, or otherwise be removed from the park
  let backgroundRefreshTicks = 0;
  backgroundRefreshSubscription = context.subscribe("interval.tick", () => {
    backgroundRefreshTicks++;

    if (backgroundRefreshTicks < BACKGROUND_UI_REFRESH_TICKS) {
      return;
    }

    backgroundRefreshTicks = 0;
    refreshUiFromGameState();
  });

  /**
   * "Force Spawn" should be disabled when:
   * 1. No guest name is selected
   * 2. All guests on the map are named that already
   *
   * Should be refreshed any time a guest is renamed and on an interval to detect if a guest has left the park, died, or otherwise been removed from the park.
   */
  function refreshForceSpawnButtonState(): void {
    const selectedGuest = getSelectedGuest();

    const canForceSpawn =
      selectedGuest !== null &&
      map
        .getAllEntities("guest")
        .some((guest) => guest.name !== selectedGuest.name);

    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.forceSpawn, {
      isDisabled: !canForceSpawn,
    });
  }

  // currently on delete of custom guest and adjusting the settings, the reset button doesn't get disabled
  // to replicate:
  // currently, as of July 29 4:33pm, add custom guest, resetSettings gets updated because spawnCountTotal is 25 by default now and spawnCountTotal is still 24 from default settings
  // scrolling up 1 to 25 causes it to become disabled automatically
  // when deleting while custom guest is in whitelist, spawnCountTotal set to 24 (with reset settings button active before deleting, as it should be)
  // then delete, totalGuests is 24 now, have to scroll up to 25 then 24 to disable
  // when deleting while custom guest is in blacklist, can't update the button at all for some reason. Have to close and reopen
  function refreshResetSettingsButtonState(): void {
    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.resetSettings, {
      isDisabled: areSettingsDefault(),
    });
  }

  // refresh force spawn button/guest description count text
  // can be called independent from user actions, like on interval
  function refreshUiFromGameState(): void {
    setSelectedGuestDescription(getSelectedGuest());
    //refreshGuestCustomSettingsWidgets();
    refreshForceSpawnButtonState();
  }

  function updateListWidgets(): void {
    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
      items: getGuestNames(whitelist),
    });
    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
      items: getGuestNames(blacklist),
    });
  }

  function reloadListsFromStorage(): void {
    blacklist = getBlacklist();
    whitelist = getWhitelist();
    updateListWidgets();
  }

  /**
   * ">" button should be disabled when:
   * 1. No whitelisted guest name is selected
   *
   * Should be refreshed any time the whitelist is updated.
   */
  function refreshBlacklistNameButtonState(): void {
    const disable =
      selectedWhitelistIndex === -1 || getSelectedGuest() === null;
    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.moveToBlacklist, {
      isDisabled: disable,
    });
  }

  /**
   * "<" button should be disabled when:
   * 1. No blacklisted guest name is selected
   *
   * Should be refreshed any time the blacklist is updated
   */
  function refreshWhitelistNameButtonState(): void {
    const disable =
      selectedBlacklistIndex === -1 || getSelectedGuest() === null;
    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.moveToWhitelist, {
      isDisabled: disable,
    });
  }

  function refreshClearSelectedGuestButtonState(): void {
    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.clearSelectedGuest, {
      isDisabled: getSelectedGuest() === null,
    });
  }

  function refreshListsAfterNameMoved(
    listToReselect: "whitelist" | "blacklist",
  ): void {
    updateListWidgets();
    if (listToReselect === "whitelist") {
      setSelectedGuestIndex(
        "whitelist",
        nextSelectIndexForList<SecretGuest>(selectedWhitelistIndex, whitelist),
      );
    } else {
      setSelectedGuestIndex(
        "blacklist",
        nextSelectIndexForList<SecretGuest>(selectedBlacklistIndex, blacklist),
      );
    }

    refreshUiFromGameState();
  }

  function getSpawnChanceIncrementStep(chance: number = spawnChance): number {
    return chance < 0.1 ? 0.01 : 0.1;
  }

  function getSpawnChanceDecrementStep(chance: number = spawnChance): number {
    return chance <= 0.1 ? 0.01 : 0.1;
  }

  function normalizeSpawnChance(chance: number): number {
    const normalized = Math.max(0, Math.min(100, chance));
    const decimals = normalized < 0.1 ? 2 : 1;

    return formatNumberToDecimal(normalized, decimals);
  }

  function normalizeSpawnWeight(weight: number): number {
    return Math.max(
      0,
      Math.min(DEFAULT_VALUES.spawnWeightMax, Math.floor(weight)),
    );
  }

  function updateSpawnChance(chance: number): void {
    setSpawnChance(normalizeSpawnChance(chance));
    refreshResetSettingsButtonState();
  }

  function getSpawnChanceSpinnerText(chance: number = spawnChance): string {
    return `${chance}%`;
  }

  function getSelectedGuest(): SecretGuestWithCustomSpawnSettings | null {
    if (selectedWhitelistIndex >= 0) {
      return whitelist[selectedWhitelistIndex] ?? null;
    }

    if (selectedBlacklistIndex >= 0) {
      return blacklist[selectedBlacklistIndex] ?? null;
    }

    return null;
  }

  function getGuestCustomSettingsEnabled(
    guest: SecretGuestWithCustomSpawnSettings,
  ): boolean {
    return guest.enableCustomSpawnSettings ?? false;
  }

  function getGuestCustomSpawnWeight(
    guest: SecretGuestWithCustomSpawnSettings,
  ): number {
    return guest.customSpawnWeight ?? DEFAULT_VALUES.spawnWeight;
  }

  function getGuestCustomSpawnCount(
    guest: SecretGuestWithCustomSpawnSettings,
  ): number {
    return guest.customSpawnCount ?? spawnCountPerName;
  }

  function saveSelectedGuestCustomSettings({
    enableCustomSettings,
    customSpawnWeight,
    customSpawnCount,
  }: {
    enableCustomSettings?: boolean;
    customSpawnWeight?: number;
    customSpawnCount?: number;
  }): void {
    const selectedGuest = getSelectedGuest();

    if (selectedGuest === null) {
      return;
    }

    const enabled =
      enableCustomSettings ?? getGuestCustomSettingsEnabled(selectedGuest);

    saveCustomSpawnSettingsForGuest(selectedGuest.name, {
      enableCustomSettings: enabled,
      customSpawnWeight:
        customSpawnWeight ?? getGuestCustomSpawnWeight(selectedGuest),
      customSpawnCount:
        customSpawnCount ?? getGuestCustomSpawnCount(selectedGuest),
    });

    reloadListsFromStorage();
    refreshUiFromGameState();
    refreshResetSettingsButtonState();
  }

  function refreshGuestCustomSettingsWidgets(): void {
    const selectedGuest = getSelectedGuest();
    const hasSelectedGuest = selectedGuest !== null;
    const enabled =
      selectedGuest !== null && getGuestCustomSettingsEnabled(selectedGuest);
    const visibleSpinnerX = {
      customSpawnWeight: 210,
      customSpawnCountForName: 400,
    };
    const hiddenSpinnerX = -1000;

    updateWidgetProperties(
      mainWindow,
      WIDGET_NAMES.checkbox.useCustomGuestSpawnSettings,
      {
        isVisible: hasSelectedGuest,
        isChecked: enabled,
      },
    );

    updateWidgetProperties(mainWindow, WIDGET_NAMES.label.customSpawnChance, {
      isVisible: hasSelectedGuest,
      isDisabled: !enabled,
    });

    updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.customSpawnChance, {
      isVisible: hasSelectedGuest,
      isDisabled: !enabled,
      x: hasSelectedGuest ? visibleSpinnerX.customSpawnWeight : hiddenSpinnerX,
      text:
        selectedGuest !== null
          ? getGuestCustomSpawnWeight(selectedGuest).toString()
          : "",
    });

    updateWidgetProperties(
      mainWindow,
      WIDGET_NAMES.label.customSpawnCountForName,
      {
        isVisible: hasSelectedGuest,
        isDisabled: !enabled,
      },
    );

    updateWidgetProperties(
      mainWindow,
      WIDGET_NAMES.spinner.customSpawnCountForName,
      {
        isVisible: hasSelectedGuest,
        isDisabled: !enabled,
        x: hasSelectedGuest
          ? visibleSpinnerX.customSpawnCountForName
          : hiddenSpinnerX,
        text:
          selectedGuest !== null
            ? getGuestCustomSpawnCount(selectedGuest).toString()
            : "",
      },
    );
  }

  function areSettingsDefault(): boolean {
    // only need to check blacklist because whitelist is built from that + custom names
    return (
      blacklist.length === DEFAULT_VALUES.blacklistGuestsNames.length &&
      blacklist.every((guest) =>
        DEFAULT_VALUES.blacklistGuestsNames.some(
          (defaultName) => guest.name === defaultName,
        ),
      ) &&
      notifyOnSpawn === DEFAULT_VALUES.notifyOnSpawn &&
      spawnChance === DEFAULT_VALUES.spawnChance &&
      spawnCountPerName === DEFAULT_VALUES.spawnCountPerName &&
      spawnCountTotal === getAllGuests().length &&
      getGuestsCustomSpawnSettings().length === 0
    );
  }

  function resetSettings(): void {
    setSpawnChance();
    setSpawnCountPerName();
    setSpawnCountTotal();
    setNotifyOnSpawn();
    saveGuestsCustomSpawnSettings([]);
    setBlacklist();
  }

  function getWidgets(): WidgetDesc[] {
    return [
      // add custom guests button
      {
        type: "button",
        name: WIDGET_NAMES.button.openCustomGuestsManager,
        x: 10,
        y: 16,
        width: 110,
        height: 15,
        text: "Custom Guests",
        tooltip: "Open the Custom Guests Manager",
        onClick: () => {
          openCustomGuestsWindow(() => {
            updateListWidgets();
            refreshUiFromGameState();
          });
        },
      },
      // whitelist
      {
        type: "listview",
        name: WIDGET_NAMES.listview.whitelist,
        x: 10,
        y: 35,
        width: 205,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 195 }],
        items: getGuestNames(whitelist),
        onClick: (index) => {
          setSelectedGuestIndex("whitelist", index);
          refreshUiFromGameState();
        },
      },
      // blacklist label
      {
        type: "label",
        x: 285,
        y: 18,
        width: 90,
        height: 12,
        text: "Blacklisted",
        tooltip: "Guests that will not spawn naturally",
      },
      // blacklist
      {
        type: "listview",
        name: WIDGET_NAMES.listview.blacklist,
        x: 285,
        y: 35,
        width: 205,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 195 }],
        items: getGuestNames(blacklist),
        onClick: (index) => {
          setSelectedGuestIndex("blacklist", index);
          refreshUiFromGameState();
        },
      },
      // move to blacklist button
      {
        type: "button",
        name: WIDGET_NAMES.button.moveToBlacklist,
        x: 225,
        y: 95,
        width: 50,
        height: 20,
        text: ">",
        isDisabled: true,
        onClick: () => {
          const selectedGuest = getSelectedGuest();
          if (selectedGuest === null) {
            return;
          }

          setBlacklist(blacklist.concat([selectedGuest]));
          refreshListsAfterNameMoved("whitelist");
          refreshResetSettingsButtonState();
        },
      },
      // move to whitelist button
      {
        type: "button",
        name: WIDGET_NAMES.button.moveToWhitelist,
        x: 225,
        y: 120,
        width: 50,
        height: 20,
        text: "<",
        isDisabled: true,
        onClick: () => {
          const selectedGuest = getSelectedGuest();
          if (selectedGuest === null) {
            return;
          }

          setBlacklist(
            blacklist.filter((guest) => guest.name !== selectedGuest.name),
          );

          refreshListsAfterNameMoved("blacklist");
          refreshResetSettingsButtonState();
        },
      },
      // clear selection button
      {
        type: "button",
        name: WIDGET_NAMES.button.clearSelectedGuest,
        x: 225,
        y: 145,
        width: 50,
        height: 20,
        text: "Clear",
        tooltip: "Clear selection",
        isDisabled: true,
        onClick: () => {
          setSelectedGuestIndex();
          refreshUiFromGameState();
        },
      },
      // guest description label
      {
        type: "label",
        name: WIDGET_NAMES.label.guestDescription,
        x: 10,
        y: 215,
        width: 480,
        height: 12,
        text: "",
      },
      // use custom spawn weight/spawn count
      // checked means use it and allows it to be altered, otherwise uses overall settings
      {
        type: "checkbox",
        name: WIDGET_NAMES.checkbox.useCustomGuestSpawnSettings,
        x: 10,
        y: 235,
        width: 135,
        height: 12,
        text: "Custom settings",
        tooltip:
          "Whether the guest uses an independent spawn weight/spawn count",
        isChecked: false,
        isVisible: false,
        onChange: (isChecked) => {
          saveSelectedGuestCustomSettings({
            enableCustomSettings: isChecked,
          });
        },
      },
      // custom spawn weight label
      {
        type: "label",
        name: WIDGET_NAMES.label.customSpawnChance,
        x: 155,
        y: 235,
        width: 55,
        height: 12,
        text: "Weight:",
        tooltip:
          "Relative chance this guest is chosen after a secret guest spawn rolls",
        isDisabled: true,
        isVisible: false,
      },
      // custom spawn weight box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.customSpawnChance,
        x: -1000,
        y: 235,
        width: 65,
        height: 12,
        text: "",
        tooltip:
          "Relative chance this guest is chosen after a secret guest spawn rolls",
        isDisabled: true,
        isVisible: false,
        onDecrement: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          saveSelectedGuestCustomSettings({
            //enableCustomSettings: true,
            customSpawnWeight: normalizeSpawnWeight(
              getGuestCustomSpawnWeight(selectedGuest) - 1,
            ),
          });
        },
        onIncrement: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          saveSelectedGuestCustomSettings({
            //enableCustomSettings: true,
            customSpawnWeight: normalizeSpawnWeight(
              getGuestCustomSpawnWeight(selectedGuest) + 1,
            ),
          });
        },
        onClick: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          ui.showTextInput({
            title: "Set Spawn Weight",
            description: `New spawn weight for ${selectedGuest.name}:`,
            initialValue: getGuestCustomSpawnWeight(selectedGuest).toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnWeight = Number(input);

              if (isNaN(newSpawnWeight)) {
                return;
              }

              saveSelectedGuestCustomSettings({
                //enableCustomSettings: true,
                customSpawnWeight: normalizeSpawnWeight(newSpawnWeight),
              });
            },
          });
        },
      },
      // custom spawn count for name label
      {
        type: "label",
        name: WIDGET_NAMES.label.customSpawnCountForName,
        x: 315,
        y: 235,
        width: 80,
        height: 12,
        text: "Max to spawn:",
        isDisabled: true,
        isVisible: false,
        tooltip: "How many guests can have this secret name",
      },
      // custom spawn count for name box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.customSpawnCountForName,
        x: -1000,
        y: 235,
        width: 65,
        height: 12,
        text: "",
        isDisabled: true,
        isVisible: false,
        onDecrement: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          saveSelectedGuestCustomSettings({
            //enableCustomSettings: true,
            customSpawnCount: Math.max(
              0,
              getGuestCustomSpawnCount(selectedGuest) - 1,
            ),
          });
        },
        onIncrement: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          saveSelectedGuestCustomSettings({
            //enableCustomSettings: true,
            customSpawnCount: Math.min(
              DEFAULT_VALUES.spawnCountPerNameMax,
              getGuestCustomSpawnCount(selectedGuest) + 1,
            ),
          });
        },
        onClick: () => {
          const selectedGuest = getSelectedGuest();

          if (selectedGuest === null) {
            return;
          }

          ui.showTextInput({
            title: "Set Spawn Count",
            description: `Set max spawn count for ${selectedGuest.name}:`,
            initialValue: getGuestCustomSpawnCount(selectedGuest).toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnCount = Number(input);

              if (isNaN(newSpawnCount)) {
                return;
              }

              saveSelectedGuestCustomSettings({
                //enableCustomSettings: true,
                customSpawnCount: Math.max(
                  0,
                  Math.min(
                    DEFAULT_VALUES.spawnCountPerNameMax,
                    Math.floor(newSpawnCount),
                  ),
                ),
              });
            },
          });
        },
      },
      // spawn chance label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnChance,
        x: 10,
        y: 257,
        width: 105,
        height: 12,
        text: "Chance:",
        tooltip: "Chance to spawn a whitelisted guest",
      },
      // spawn chance box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnChance,
        x: 120,
        y: 257,
        width: 70,
        height: 12,
        text: getSpawnChanceSpinnerText(),
        onDecrement: () => {
          updateSpawnChance(spawnChance - getSpawnChanceDecrementStep());
        },
        onIncrement: () => {
          updateSpawnChance(spawnChance + getSpawnChanceIncrementStep());
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Chance",
            description: "New spawn chance:",
            initialValue: spawnChance.toString(),
            maxLength: 4,
            callback: (input) => {
              const newSpawnChance = Number(input);

              if (isNaN(newSpawnChance)) {
                return;
              }

              updateSpawnChance(newSpawnChance);
            },
          });
        },
      },
      // spawn count per name label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnCountPerName,
        x: 10,
        y: 279,
        width: 105,
        height: 12,
        text: "Max spawn/name:",
        tooltip: "How many guests can have the same secret name",
      },
      // spawn count per name box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnCountPerName,
        x: 120,
        y: 279,
        width: 70,
        height: 12,
        text: spawnCountPerName.toString(),
        onDecrement: () => {
          setSpawnCountPerName(Math.max(0, spawnCountPerName - 1));
          refreshResetSettingsButtonState();
        },
        onIncrement: () => {
          setSpawnCountPerName(
            Math.min(
              DEFAULT_VALUES.spawnCountPerNameMax,
              spawnCountPerName + 1,
            ),
          );
          refreshResetSettingsButtonState();
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Count",
            description: "Set max spawn count per name:",
            initialValue: spawnCountPerName.toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnCount = Number(input);

              if (isNaN(newSpawnCount)) {
                return;
              }

              setSpawnCountPerName(
                Math.max(
                  0,
                  Math.min(
                    DEFAULT_VALUES.spawnCountPerNameMax,
                    Math.floor(newSpawnCount),
                  ),
                ),
              );
              refreshResetSettingsButtonState();
            },
          });
        },
      },
      // spawn count total label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnCountTotal,
        x: 10,
        y: 299,
        width: 105,
        height: 12,
        text: "Max total spawn:",
        tooltip: "How many guests can have a secret name",
      },
      // spawn count total box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnCountTotal,
        x: 120,
        y: 299,
        width: 70,
        height: 12,
        text: spawnCountTotal.toString(),
        onDecrement: () => {
          setSpawnCountTotal(Math.max(0, spawnCountTotal - 1));
          refreshResetSettingsButtonState();
        },
        onIncrement: () => {
          setSpawnCountTotal(
            Math.min(DEFAULT_VALUES.spawnCountTotalMax, spawnCountTotal + 1),
          );
          refreshResetSettingsButtonState();
        },
        onClick: () => {
          ui.showTextInput({
            title: "Set Spawn Count",
            description: "Set total max spawn count:",
            initialValue: spawnCountTotal.toString(),
            maxLength: 3,
            callback: (input) => {
              const newSpawnCount = Number(input);

              if (isNaN(newSpawnCount)) {
                return;
              }

              setSpawnCountTotal(
                Math.max(
                  0,
                  Math.min(
                    DEFAULT_VALUES.spawnCountTotalMax,
                    Math.floor(newSpawnCount),
                  ),
                ),
              );
              refreshResetSettingsButtonState();
            },
          });
        },
      },
      // notify of spawn checkbox
      {
        type: "checkbox",
        name: WIDGET_NAMES.checkbox.notifyOnSpawn,
        x: 327,
        y: 257,
        width: 120,
        height: 12,
        text: "Notify on spawn",
        tooltip:
          "Whether to receive a notification on secret guest spawn or not",
        isChecked: notifyOnSpawn,
        onChange: (isChecked) => {
          setNotifyOnSpawn(isChecked);
          refreshResetSettingsButtonState();
        },
      },
      // force spawn selected button
      {
        type: "button",
        name: WIDGET_NAMES.button.forceSpawn,
        x: 327,
        y: 275,
        width: 120,
        height: 20,
        text: "Force Spawn",
        tooltip: "Force spawns the selected guest",
        isDisabled: true,
        onClick: () => {
          const selectedGuest = getSelectedGuest();
          if (selectedGuest !== null) {
            forceSpawnGuest(selectedGuest, () => {
              refreshUiFromGameState();
            });
          }
        },
      },
      // reset to default button
      {
        type: "button",
        name: WIDGET_NAMES.button.resetSettings,
        x: 327,
        y: 295,
        width: 120,
        height: 20,
        isDisabled: areSettingsDefault(),
        text: "Reset Settings",
        tooltip: "Resets settings to default (will not erase custom guests)",
        onClick: () => {
          showConfirmationWindow(
            mainWindow,
            WINDOW_CLASSIFICATIONS.confirmResetSettingsWindow,
            "Confirm Reset Settings",
            "Reset settings to default?",
            () => {
              resetSettings();
              setSelectedGuestIndex();
              updateListWidgets();
              refreshResetSettingsButtonState();
              refreshUiFromGameState();
            },
          );
        },
      },
    ];
  }
}
