import { SecretGuest } from "./guests";
import { getBlacklist, getWhitelist, getGuestNames } from "./guestLists";
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
} from "./storage";
import { getCurrentSecretCount, forceSpawnGuest } from "./spawning";
import { openCustomGuestsWindow } from "./customGuestsWindow";
import { getMainWindow, updateWidgetText } from "./windowUtilities";
import {
  WINDOW_CLASSIFICATIONS,
  WIDGET_NAMES,
  DEFAULT_VALUES,
} from "./constants";

const BACKGROUND_UI_REFRESH_TICKS = 40;

let displayedGuestName: string | null = null;

function nextSelectIndex(index: number, listLength: number): number {
  if (listLength === 0) {
    return -1;
  }

  if (index >= listLength) {
    return listLength - 1;
  }

  return index;
}

function formatChanceNumber(n: number): number {
  return Number(n.toFixed(1));
}

function getSelectedDescription(guest: SecretGuest | null): string {
  if (guest === null) {
    // do I need displayedGuestName?---------------------------------------------------------------------------------------------------------------------------
    displayedGuestName = null;
    return "";
  }

  displayedGuestName = guest.name;
  const curGuestCount = getCurrentSecretCount(guest.name);
  return `${guest.name}: ${guest.description} (Current: ${curGuestCount})`;
}

function resetSettings(): void {
  saveBlacklistNames();
  saveSpawnChance();
  saveSpawnCountPerName();
  saveSpawnCountTotal();
  saveNotifyOnSpawn();
}

export function updateOpenWindowDescription(guest: SecretGuest): void {
  if (displayedGuestName !== guest.name || typeof ui === "undefined") {
    return;
  }

  const openWindow = getMainWindow();

  if (openWindow === null || openWindow === undefined) {
    return;
  }

  updateWidgetText(
    openWindow,
    WIDGET_NAMES.label.guestDescription,
    getSelectedDescription(guest),
  );
}

export function openSecretGuestsWindow(): void {
  let spawnChance = getSpawnChance();
  let spawnCountPerName = getSpawnCountPerName();
  let spawnCountTotal = getSpawnCountTotal();
  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  let blacklist = getBlacklist();
  let whitelist = getWhitelist();

  const windowOpen = ui.getWindow(WINDOW_CLASSIFICATIONS.mainMenuWindow);
  if (windowOpen !== null && windowOpen !== undefined) {
    windowOpen.bringToFront();
    return;
  }

  let guestGenerationSubscription: IDisposable | null = null;
  let backgroundRefreshSubscription: IDisposable | null = null;
  let backgroundRefreshTicks = 0;

  const window = ui.openWindow({
    classification: WINDOW_CLASSIFICATIONS.mainMenuWindow,
    title: "Secret Guests",
    width: 420,
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

  guestGenerationSubscription = context.subscribe("guest.generation", () => {
    refreshUiFromGameState();
  });

  backgroundRefreshSubscription = context.subscribe("interval.tick", () => {
    backgroundRefreshTicks++;

    if (backgroundRefreshTicks < BACKGROUND_UI_REFRESH_TICKS) {
      return;
    }

    backgroundRefreshTicks = 0;
    refreshUiFromGameState();
  });

  function updateNotifyOnSpawnCheckbox(): void {
    const checkbox = window.findWidget<CheckboxWidget>(
      WIDGET_NAMES.checkbox.notifyOnSpawn,
    );

    checkbox.isChecked = getNotifyOnSpawn();
  }

  // possibly do something with windowUtilities here?
  // change to be a refresh button kind of thing like refreshuifromgamestate?
  // put button refreshes in refreshuifromgamestate?
  function toggleForceSpawnButtonEnabled(): void {
    const button = window.findWidget<ButtonWidget>(
      WIDGET_NAMES.button.forceSpawn,
    );

    const selected = getSelectedGuest();

    if (selected === null) {
      button.isDisabled = true;
      return;
    }

    const hasFreeGuest = !map
      .getAllEntities("guest")
      .every((guest) => guest.name === selected.name);

    button.isDisabled = !hasFreeGuest;
  }

  function refreshUiFromGameState(): void {
    updateWidgetText(
      window,
      WIDGET_NAMES.label.guestDescription,
      getSelectedDescription(getSelectedGuest()),
    );

    toggleForceSpawnButtonEnabled();
  }

  function getSelectedGuest(): SecretGuest | null {
    if (selectedWhitelistIndex >= 0) {
      return whitelist[selectedWhitelistIndex] ?? null;
    }

    if (selectedBlacklistIndex >= 0) {
      return blacklist[selectedBlacklistIndex] ?? null;
    }

    return null;
  }

  function refreshListWidgets(): void {
    blacklist = getBlacklist();
    whitelist = getWhitelist();

    getListWidget(WIDGET_NAMES.listview.whitelist).items =
      getGuestNames(whitelist);
    getListWidget(WIDGET_NAMES.listview.blacklist).items =
      getGuestNames(blacklist);
  }

  function refreshLists(
    listToReselect: "whitelist" | "blacklist",
    previousIndex: number,
  ): void {
    refreshListWidgets();

    const whitelistWidget = getListWidget(WIDGET_NAMES.listview.whitelist);
    const blacklistWidget = getListWidget(WIDGET_NAMES.listview.blacklist);
    whitelistWidget.selectedCell = null;
    blacklistWidget.selectedCell = null;

    selectedWhitelistIndex = -1;
    selectedBlacklistIndex = -1;

    if (listToReselect === "whitelist") {
      selectedWhitelistIndex = nextSelectIndex(previousIndex, whitelist.length);

      if (selectedWhitelistIndex !== -1) {
        whitelistWidget.selectedCell = {
          row: selectedWhitelistIndex,
          column: 0,
        };
      }
    } else {
      selectedBlacklistIndex = nextSelectIndex(previousIndex, blacklist.length);

      if (selectedBlacklistIndex !== -1) {
        blacklistWidget.selectedCell = {
          row: selectedBlacklistIndex,
          column: 0,
        };
      }
    }

    refreshUiFromGameState();
  }

  // move to windowUtilities
  function getListWidget(widgetName: string): ListViewWidget {
    return window.findWidget<ListViewWidget>(widgetName);
  }

  function showResetConfirmation(onConfirm: () => void): void {
    // move to windowUtilities
    const resetConfirmationWindowOpen = ui.getWindow(
      WINDOW_CLASSIFICATIONS.confirmResetSettingsWindow,
    );
    if (
      resetConfirmationWindowOpen !== null &&
      resetConfirmationWindowOpen !== undefined
    ) {
      resetConfirmationWindowOpen.bringToFront();
      return;
    }

    const parentWindow = getMainWindow();

    const confirmWidth = 220;
    const confirmHeight = 90;
    const x =
      parentWindow !== null && parentWindow !== undefined
        ? parentWindow.x + Math.floor((parentWindow.width - confirmWidth) / 2)
        : 200;

    const y =
      parentWindow !== null && parentWindow !== undefined
        ? parentWindow.y + Math.floor((parentWindow.height - confirmHeight) / 2)
        : 150;

    const confirmWindow = ui.openWindow({
      classification: WINDOW_CLASSIFICATIONS.confirmResetSettingsWindow,
      title: "Reset Settings",
      x: x,
      y: y,
      width: 220,
      height: 90,
      widgets: [
        // reset box label
        {
          type: "label",
          x: 10,
          y: 20,
          width: 200,
          height: 12,
          text: "Reset all settings to default?",
        },
        // reset confirm
        {
          type: "button",
          x: 35,
          y: 55,
          width: 65,
          height: 20,
          text: "Reset",
          onClick: () => {
            confirmWindow.close();
            onConfirm();
          },
        },
        // cancel confirm
        {
          type: "button",
          x: 120,
          y: 55,
          width: 65,
          height: 20,
          text: "Cancel",
          onClick: () => {
            confirmWindow.close();
          },
        },
      ],
    });
  }

  function getWidgets(): WidgetDesc[] {
    return [
      // whitelist
      {
        type: "listview",
        name: WIDGET_NAMES.listview.whitelist,
        x: 10,
        y: 35,
        width: 190,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 180 }],
        items: getGuestNames(whitelist),
        onClick: (index) => {
          selectedWhitelistIndex = index;
          selectedBlacklistIndex = -1;

          const blacklistWidget = getListWidget(
            WIDGET_NAMES.listview.blacklist,
          );
          blacklistWidget.selectedCell = null;
          refreshUiFromGameState();
        },
      },
      // blacklist label
      {
        type: "label",
        x: 220,
        y: 18,
        width: 190,
        height: 12,
        text: "Blacklisted",
        tooltip: "Guests that will not spawn naturally",
      },
      // blacklist
      {
        type: "listview",
        name: WIDGET_NAMES.listview.blacklist,
        x: 220,
        y: 35,
        width: 190,
        height: 175,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 180 }],
        items: getGuestNames(blacklist),
        onClick: (index) => {
          selectedBlacklistIndex = index;
          selectedWhitelistIndex = -1;

          const whitelistWidget = getListWidget(
            WIDGET_NAMES.listview.whitelist,
          );
          whitelistWidget.selectedCell = null;
          refreshUiFromGameState();
        },
      },
      // guest description label
      {
        type: "label",
        name: WIDGET_NAMES.label.guestDescription,
        x: 10,
        y: 215,
        width: 400,
        height: 12,
        text: "",
      },
      // move to blacklist button
      {
        type: "button",
        name: "blacklist-button",
        x: 50,
        y: 232,
        width: 110,
        height: 20,
        text: "Blacklist >",
        tooltip: "Move selected whitelist guest to the blacklist",
        onClick: () => {
          if (
            selectedWhitelistIndex < 0 ||
            selectedWhitelistIndex >= whitelist.length
          ) {
            return;
          }

          const guest = whitelist[selectedWhitelistIndex];
          const nextWhitelistIndex = selectedWhitelistIndex;

          saveBlacklistNames(blacklist.concat([guest]));
          refreshLists("whitelist", nextWhitelistIndex);
          refreshUiFromGameState();
        },
      },
      // move to whitelist button
      {
        type: "button",
        name: "whitelist-button",
        x: 260,
        y: 232,
        width: 110,
        height: 20,
        text: "< Allow",
        tooltip: "Move selected blacklist guest to the whitelist",
        onClick: () => {
          if (
            selectedBlacklistIndex < 0 ||
            selectedBlacklistIndex >= blacklist.length
          ) {
            return;
          }

          const guest = blacklist[selectedBlacklistIndex];
          const nextBlacklistIndex = selectedBlacklistIndex;
          const newBlacklist = blacklist.filter(
            (blacklistedGuest) => blacklistedGuest.name !== guest.name,
          );

          saveBlacklistNames(newBlacklist);
          refreshLists("blacklist", nextBlacklistIndex);
          refreshUiFromGameState();
        },
      },
      // spawn chance label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnChance,
        x: 10,
        y: 260,
        width: 100,
        height: 12,
        text: "Chance:",
        tooltip: "Chance to spawn a whitelisted guest",
      },
      // spawn chance box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnChance,
        x: 110,
        y: 260,
        width: 68,
        height: 12,
        text: `${spawnChance}%`,
        tooltip: "[min 0 -- max 100]",
        onDecrement: () => {
          spawnChance = Math.max(0, formatChanceNumber(spawnChance - 0.1));
          saveSpawnChance(spawnChance);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnChance,
            `${spawnChance}%`,
          );
        },
        onIncrement: () => {
          spawnChance = Math.min(100, formatChanceNumber(spawnChance + 0.1));
          saveSpawnChance(spawnChance);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnChance,
            `${spawnChance}%`,
          );
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

              spawnChance = Math.max(
                0,
                Math.min(100, formatChanceNumber(newSpawnChance)),
              );
              saveSpawnChance(spawnChance);
              updateWidgetText(
                window,
                WIDGET_NAMES.spinner.spawnChance,
                `${spawnChance}%`,
              );
            },
          });
        },
      },
      // spawn count per name label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnCountPerName,
        x: 10,
        y: 275,
        width: 100,
        height: 12,
        text: "Max spawn/name:",
        tooltip: "How many guests can have the same secret name",
      },
      // spawn count per name box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnCountPerName,
        x: 110,
        y: 275,
        width: 68,
        height: 12,
        text: spawnCountPerName.toString(),
        tooltip: "[min 0 -- max 999]",
        onDecrement: () => {
          spawnCountPerName = Math.max(0, spawnCountPerName - 1);
          saveSpawnCountPerName(spawnCountPerName);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnCountPerName,
            spawnCountPerName.toString(),
          );
        },
        onIncrement: () => {
          spawnCountPerName = Math.min(
            DEFAULT_VALUES.spawnCountPerNameMax,
            spawnCountPerName + 1,
          );
          saveSpawnCountPerName(spawnCountPerName);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnCountPerName,
            spawnCountPerName.toString(),
          );
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

              spawnCountPerName = Math.max(
                0,
                Math.min(
                  DEFAULT_VALUES.spawnCountPerNameMax,
                  Math.floor(newSpawnCount),
                ),
              );
              saveSpawnCountPerName(spawnCountPerName);
              updateWidgetText(
                window,
                WIDGET_NAMES.spinner.spawnCountPerName,
                spawnCountPerName.toString(),
              );
            },
          });
        },
      },
      // spawn count total label
      {
        type: "label",
        name: WIDGET_NAMES.label.spawnCountTotal,
        x: 10,
        y: 290,
        width: 100,
        height: 12,
        text: "Max total spawn:",
        tooltip: "How many guests can have a secret name",
      },
      // spawn count total box
      {
        type: "spinner",
        name: WIDGET_NAMES.spinner.spawnCountTotal,
        x: 110,
        y: 290,
        width: 68,
        height: 12,
        text: spawnCountTotal.toString(),
        tooltip: "[min 0 -- max 999]",
        onDecrement: () => {
          spawnCountTotal = Math.max(0, spawnCountTotal - 1);
          saveSpawnCountTotal(spawnCountTotal);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnCountTotal,
            spawnCountTotal.toString(),
          );
        },
        onIncrement: () => {
          spawnCountTotal = Math.min(
            DEFAULT_VALUES.spawnCountTotalMax,
            spawnCountTotal + 1,
          );
          saveSpawnCountTotal(spawnCountTotal);
          updateWidgetText(
            window,
            WIDGET_NAMES.spinner.spawnCountTotal,
            spawnCountTotal.toString(),
          );
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

              spawnCountTotal = Math.max(
                0,
                Math.min(
                  DEFAULT_VALUES.spawnCountTotalMax,
                  Math.floor(newSpawnCount),
                ),
              );
              saveSpawnCountTotal(spawnCountTotal);
              updateWidgetText(
                window,
                WIDGET_NAMES.spinner.spawnCountTotal,
                spawnCountTotal.toString(),
              );
            },
          });
        },
      },
      // force spawn selected button
      {
        type: "button",
        name: WIDGET_NAMES.button.forceSpawn,
        x: 260,
        y: 271,
        width: 110,
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
        x: 260,
        y: 295,
        width: 110,
        height: 20,
        text: "Reset Settings",
        tooltip: "Resets settings to default (will not erase custom guests)",
        onClick: () => {
          showResetConfirmation(() => {
            resetSettings();

            spawnChance = getSpawnChance();
            spawnCountPerName = getSpawnCountPerName();
            spawnCountTotal = getSpawnCountTotal();

            refreshListWidgets();

            updateWidgetText(
              window,
              WIDGET_NAMES.spinner.spawnChance,
              `${spawnChance}%`,
            );
            updateWidgetText(
              window,
              WIDGET_NAMES.spinner.spawnCountPerName,
              spawnCountPerName.toString(),
            );
            updateWidgetText(
              window,
              WIDGET_NAMES.spinner.spawnCountTotal,
              spawnCountTotal.toString(),
            );

            getListWidget(WIDGET_NAMES.listview.whitelist).selectedCell = null;
            getListWidget(WIDGET_NAMES.listview.blacklist).selectedCell = null;

            selectedWhitelistIndex = -1;
            selectedBlacklistIndex = -1;

            updateWidgetText(
              window,
              WIDGET_NAMES.label.guestDescription,
              getSelectedDescription(null),
            );

            // change notifyOnSpawn to be similar to spawnCountPerName, spawnChance, etc
            // so like a plugin level data layer?
            updateNotifyOnSpawnCheckbox();
            toggleForceSpawnButtonEnabled();
          });
        },
      },
      // notify of spawn checkbox
      {
        type: "checkbox",
        name: WIDGET_NAMES.checkbox.notifyOnSpawn,
        x: 260,
        y: 257,
        width: 130,
        height: 12,
        text: "Notify on spawn",
        tooltip:
          "Whether to receive a notification on secret guest spawn or not",
        isChecked: getNotifyOnSpawn(),
        onChange: (isChecked) => {
          saveNotifyOnSpawn(isChecked);
        },
      },
      // add custom guests button
      {
        type: "button",
        name: "custom-guests-button",
        x: 10,
        y: 16,
        width: 110,
        height: 15,
        text: "Custom Guests",
        tooltip: "Open the Custom Guests Manager",
        onClick: () => {
          openCustomGuestsWindow(() => {
            refreshListWidgets();
            refreshUiFromGameState();
          });
        },
      },
    ];
  }
}
