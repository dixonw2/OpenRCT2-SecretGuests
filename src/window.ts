import { SecretGuest } from "./guests";
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
  getBlacklistNames,
  saveBlacklistNames,
  saveSpawnChance,
  saveSpawnCountPerName,
  saveSpawnCountTotal,
  saveNotifyOnSpawn,
} from "./storage";
import { getCurrentSecretCount, forceSpawnGuest } from "./spawning";
import { openCustomGuestsWindow } from "./customGuestsWindow";
import {
  getMainWindow,
  getResetSettingsConfirmationWindow,
  updateWidgetProperties,
  nextSelectIndexForList,
} from "./windowUtilities";
import {
  WINDOW_CLASSIFICATIONS,
  WIDGET_NAMES,
  DEFAULT_VALUES,
} from "./constants";

const BACKGROUND_UI_REFRESH_TICKS = 40;

let displayedGuestName: string | null = null;

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

  if (openWindow === null) {
    return;
  }

  updateWidgetProperties(openWindow, WIDGET_NAMES.label.guestDescription, {
    text: getSelectedDescription(guest),
  });
}

export function openSecretGuestsWindow(): void {
  let spawnChance = getSpawnChance();
  let spawnCountPerName = getSpawnCountPerName();
  let spawnCountTotal = getSpawnCountTotal();
  let notifyOnSpawn = getNotifyOnSpawn();
  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  let blacklist = getBlacklist();
  let whitelist = getWhitelist();

  const existingMainWindow = getMainWindow();

  if (existingMainWindow !== null) {
    existingMainWindow.bringToFront();
    return;
  }

  let guestGenerationSubscription: IDisposable | null = null;
  let backgroundRefreshSubscription: IDisposable | null = null;
  let backgroundRefreshTicks = 0;

  const mainWindow = ui.openWindow({
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

  // refresh menu UI on guest spawn
  guestGenerationSubscription = context.subscribe("guest.generation", () => {
    refreshUiFromGameState();
  });

  // refresh menu UI every second
  // will update UI if a guest happens to leave, die, or otherwise be removed from the park
  backgroundRefreshSubscription = context.subscribe("interval.tick", () => {
    backgroundRefreshTicks++;

    if (backgroundRefreshTicks < BACKGROUND_UI_REFRESH_TICKS) {
      return;
    }

    backgroundRefreshTicks = 0;
    refreshUiFromGameState();
  });

  function updateNotifyOnSpawnCheckbox(): void {
    const checkbox = mainWindow.findWidget<CheckboxWidget>(
      WIDGET_NAMES.checkbox.notifyOnSpawn,
    );

    checkbox.isChecked = getNotifyOnSpawn();
  }

  function refreshForceSpawnButtonState(): void {
    let disable = true;
    const selected = getSelectedGuest();

    if (selected !== null) {
      // if every guest on the map has the selected name, cannot force spawn anymore
      disable = map
        .getAllEntities("guest")
        .every((guest) => guest.name === selected.name);
    }

    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.forceSpawn, {
      isDisabled: disable,
    });
  }

  function refreshBlacklistNameButtonState(): void {
    let disable = true;
    const selected = getSelectedGuest();

    if (selected !== null) {
      disable = getWhitelist().length === 0 || selectedWhitelistIndex === -1;
    }

    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.blacklistName, {
      isDisabled: disable,
    });
  }

  function refreshWhitelistNameButtonState(): void {
    let disable = true;
    const selected = getSelectedGuest();

    if (selected !== null) {
      disable = getBlacklist().length === 0 || selectedBlacklistIndex === -1;
    }

    updateWidgetProperties(mainWindow, WIDGET_NAMES.button.whitelistName, {
      isDisabled: disable,
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
    updateWidgetProperties(mainWindow, WIDGET_NAMES.label.guestDescription, {
      text: getSelectedDescription(getSelectedGuest()),
    });

    refreshBlacklistNameButtonState();
    refreshWhitelistNameButtonState();
    refreshForceSpawnButtonState();
    refreshResetSettingsButtonState();
  }

  function refreshListWidgets(): void {
    // maybe see about not causing side effects in a function?
    blacklist = getBlacklist();
    whitelist = getWhitelist();

    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
      items: getGuestNames(whitelist),
    });
    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
      items: getGuestNames(blacklist),
    });
  }

  function refreshListsAfterNameMoved(
    listToReselect: "whitelist" | "blacklist",
    previousIndex: number,
  ): void {
    refreshListWidgets();

    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
      selectedCell: null,
    });

    updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
      selectedCell: null,
    });

    selectedWhitelistIndex = -1;
    selectedBlacklistIndex = -1;

    if (listToReselect === "whitelist") {
      selectedWhitelistIndex = nextSelectIndexForList(previousIndex, whitelist);

      if (selectedWhitelistIndex !== -1) {
        updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
          selectedCell: {
            row: selectedWhitelistIndex,
            column: 0,
          },
        });
      }
    } else {
      selectedBlacklistIndex = nextSelectIndexForList(previousIndex, blacklist);

      if (selectedBlacklistIndex !== -1) {
        updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
          selectedCell: {
            row: selectedBlacklistIndex,
            column: 0,
          },
        });
        // blacklistWidget.selectedCell = {
        //   row: selectedBlacklistIndex,
        //   column: 0,
        // };
      }
    }

    refreshUiFromGameState();
  }

  function showResetConfirmationWindow(onConfirm: () => void): void {
    const resetConfirmationWindow = getResetSettingsConfirmationWindow();
    if (resetConfirmationWindow !== null) {
      resetConfirmationWindow.bringToFront();
      return;
    }

    const parentWindow = getMainWindow();

    const confirmWidth = 220;
    const confirmHeight = 90;
    const x =
      parentWindow !== null
        ? parentWindow.x + Math.floor((parentWindow.width - confirmWidth) / 2)
        : 200;

    const y =
      parentWindow !== null
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

  function getSpawnChanceSpinnerText(chance: number = spawnChance): string {
    return `${chance}%`;
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

  // possibly use in areSettingsDefault? possibly remove?
  // function haveSameItems<T>(a: T[], b: readonly T[]): boolean {
  //   return a.length === b.length && a.every((value) => b.indexOf(value) !== -1);
  // }

  // should I be accessing localStorage here? Or my own variables that represent game state?
  // need to double check all game state changes and whatnot
  function areSettingsDefault(): boolean {
    const curBlacklist = getBlacklistNames();
    // change this to just returning this if expression
    if (
      // only need to check blacklist because whitelist is built from that + custom names
      // maybe could make there be a check for only non-custom secret guests so it keeps them in the blacklist?
      // maybe would need a customGuestsBlacklist?
      // Or just extract the custom guests from the blacklist before resetting and save them into the blacklist?
      curBlacklist.length === DEFAULT_VALUES.blacklistGuestsNames.length &&
      curBlacklist.every((name) =>
        DEFAULT_VALUES.blacklistGuestsNames.some(
          (defaultName) => name === defaultName,
        ),
      ) &&
      getNotifyOnSpawn() === DEFAULT_VALUES.notifyOnSpawn &&
      getSpawnChance() === DEFAULT_VALUES.spawnChance &&
      getSpawnCountPerName() === DEFAULT_VALUES.spawnCountPerName &&
      getSpawnCountTotal() === getAllGuests().length
    ) {
      return true;
    }

    return false;
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
            refreshListWidgets();
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

          updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.blacklist, {
            selectedCell: null,
          });
          // refreshBlacklistNameButtonState();
          // refreshWhitelistNameButtonState();
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

          updateWidgetProperties(mainWindow, WIDGET_NAMES.listview.whitelist, {
            selectedCell: null,
          });
          // refreshBlacklistNameButtonState();
          // refreshWhitelistNameButtonState();
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
        name: WIDGET_NAMES.button.blacklistName,
        x: 50,
        y: 232,
        width: 110,
        height: 20,
        text: "Blacklist >",
        //tooltip: "Move selected whitelist guest to the blacklist",
        isDisabled: true,
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
          refreshListsAfterNameMoved("whitelist", nextWhitelistIndex);
          //refreshBlacklistNameButtonState();
          refreshUiFromGameState();
        },
      },
      // move to whitelist button
      {
        type: "button",
        name: WIDGET_NAMES.button.whitelistName,
        x: 260,
        y: 232,
        width: 110,
        height: 20,
        text: "< Allow",
        //tooltip: "Move selected blacklist guest to the whitelist",
        isDisabled: true,
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
          refreshListsAfterNameMoved("blacklist", nextBlacklistIndex);
          //refreshWhitelistNameButtonState();
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
        text: getSpawnChanceSpinnerText(),
        tooltip: "[min 0 -- max 100]",
        onDecrement: () => {
          spawnChance = Math.max(0, formatChanceNumber(spawnChance - 0.1));
          saveSpawnChance(spawnChance);
          updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.spawnChance, {
            text: getSpawnChanceSpinnerText(),
          });
          refreshResetSettingsButtonState();
        },
        onIncrement: () => {
          spawnChance = Math.min(100, formatChanceNumber(spawnChance + 0.1));
          saveSpawnChance(spawnChance);
          updateWidgetProperties(mainWindow, WIDGET_NAMES.spinner.spawnChance, {
            text: getSpawnChanceSpinnerText(),
          });
          refreshResetSettingsButtonState();
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
              updateWidgetProperties(
                mainWindow,
                WIDGET_NAMES.spinner.spawnChance,
                {
                  text: getSpawnChanceSpinnerText(),
                },
              );
              refreshResetSettingsButtonState();
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
          updateWidgetProperties(
            mainWindow,
            WIDGET_NAMES.spinner.spawnCountPerName,
            {
              text: spawnCountPerName.toString(),
            },
          );
          refreshResetSettingsButtonState();
        },
        onIncrement: () => {
          spawnCountPerName = Math.min(
            DEFAULT_VALUES.spawnCountPerNameMax,
            spawnCountPerName + 1,
          );
          saveSpawnCountPerName(spawnCountPerName);
          updateWidgetProperties(
            mainWindow,
            WIDGET_NAMES.spinner.spawnCountPerName,
            {
              text: spawnCountPerName.toString(),
            },
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

              spawnCountPerName = Math.max(
                0,
                Math.min(
                  DEFAULT_VALUES.spawnCountPerNameMax,
                  Math.floor(newSpawnCount),
                ),
              );
              saveSpawnCountPerName(spawnCountPerName);
              updateWidgetProperties(
                mainWindow,
                WIDGET_NAMES.spinner.spawnCountPerName,
                {
                  text: spawnCountPerName.toString(),
                },
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
          updateWidgetProperties(
            mainWindow,
            WIDGET_NAMES.spinner.spawnCountTotal,
            {
              text: spawnCountTotal.toString(),
            },
          );
          refreshResetSettingsButtonState();
        },
        onIncrement: () => {
          spawnCountTotal = Math.min(
            DEFAULT_VALUES.spawnCountTotalMax,
            spawnCountTotal + 1,
          );
          saveSpawnCountTotal(spawnCountTotal);
          updateWidgetProperties(
            mainWindow,
            WIDGET_NAMES.spinner.spawnCountTotal,
            {
              text: spawnCountTotal.toString(),
            },
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

              spawnCountTotal = Math.max(
                0,
                Math.min(
                  DEFAULT_VALUES.spawnCountTotalMax,
                  Math.floor(newSpawnCount),
                ),
              );
              saveSpawnCountTotal(spawnCountTotal);
              updateWidgetProperties(
                mainWindow,
                WIDGET_NAMES.spinner.spawnCountTotal,
                {
                  text: spawnCountTotal.toString(),
                },
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
        x: 260,
        y: 257,
        width: 130,
        height: 12,
        text: "Notify on spawn",
        tooltip:
          "Whether to receive a notification on secret guest spawn or not",
        isChecked: notifyOnSpawn,
        onChange: (isChecked) => {
          saveNotifyOnSpawn(isChecked);
          refreshResetSettingsButtonState();
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
        isDisabled: areSettingsDefault(),
        text: "Reset Settings",
        tooltip: "Resets settings to default (will not erase custom guests)",
        onClick: () => {
          showResetConfirmationWindow(() => {
            resetSettings();

            spawnChance = getSpawnChance();
            spawnCountPerName = getSpawnCountPerName();
            spawnCountTotal = getSpawnCountTotal();

            refreshListWidgets();

            // make refreshUIFromGameState or whatever do this too?
            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.spinner.spawnChance,
              {
                text: getSpawnChanceSpinnerText(),
              },
            );
            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.spinner.spawnCountPerName,
              {
                text: spawnCountPerName.toString(),
              },
            );
            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.spinner.spawnCountTotal,
              {
                text: spawnCountTotal.toString(),
              },
            );

            // turn setting selectedCell into its own function in windowUtilities
            // or maybe just setting null?
            // or overload them
            // updateSelectedListItem(window, etc)
            // maybe turn several common updates into wrapper functions
            // updateWidgetText(window, WIDGET_NAMES.listview.<something>, text)
            // could possibly do a union hardcode string property like whitelist | blacklist | customGuests for widget name too
            // that corresponds to the constants
            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.listview.whitelist,
              {
                selectedCell: null,
              },
            );
            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.listview.blacklist,
              {
                selectedCell: null,
              },
            );

            selectedWhitelistIndex = -1;
            selectedBlacklistIndex = -1;

            updateWidgetProperties(
              mainWindow,
              WIDGET_NAMES.label.guestDescription,
              {
                text: getSelectedDescription(null),
              },
            );

            // change notifyOnSpawn to be similar to spawnCountPerName, spawnChance, etc
            // so like a plugin level data layer?
            updateNotifyOnSpawnCheckbox();
            // refreshWhitelistNameButtonState();
            // refreshBlacklistNameButtonState();
            refreshUiFromGameState();
            //refreshForceSpawnButtonState();
          });
        },
      },
    ];
  }
}
