import { SecretGuest } from "./guests";
import { getBlacklist, getWhitelist } from "./guestLists";
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
  SPAWN_COUNT_PER_NAME_MAX,
  SPAWN_COUNT_TOTAL_MAX,
} from "./storage";
import { getCurrentSecretCount, spawnGuest } from "./spawning";

export const WINDOW_CLASSIFICATION = "secret-guests";
const CONFIRM_RESET_WINDOW_CLASSIFICATION =
  "secret-guests-reset-settings-confirm";

const WHITELIST_WIDGET_NAME = "whitelist";
const BLACKLIST_WIDGET_NAME = "blacklist";
const GUEST_DESCRIPTION_WIDGET_NAME = "guest-description-label";
const SPAWN_CHANCE_LABEL_WIDGET_NAME = "spawn-chance-label";
const SPAWN_CHANCE_SPINNER_WIDGET_NAME = "spawn-chance-spinner";
const SPAWN_COUNT_PER_NAME_LABEL_WIDGET_NAME = "spawn-count-per-name-label";
const SPAWN_COUNT_PER_NAME_SPINNER_WIDGET_NAME = "spawn-count-per-name-spinner";
const SPAWN_COUNT_TOTAL_LABEL_WIDGET_NAME = "spawn-count-total-label";
const SPAWN_COUNT_TOTAL_SPINNER_WIDGET_NAME = "spawn-count-total-spinner";
const FORCE_SPAWN_BUTTON_WIDGET_NAME = "force-spawn-button";
const RESET_SETTINGS_BUTTON_WIDGET_NAME = "reset-settings-button";
const NOTIFY_ON_SPAWN_CHECKBOX_WIDGET_NAME = "notify-on-spawn-checkbox";
const BACKGROUND_UI_REFRESH_TICKS = 40;

let displayedGuestName: string | null = null;

function getGuestNames(guests: SecretGuest[]): string[] {
  return guests.map((guest) => guest.name);
}

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

function setDescription(
  guest: SecretGuest | null,
  labelWidget: LabelWidget,
): void {
  if (guest === null) {
    displayedGuestName = null;
    labelWidget.text = "";
    return;
  }

  displayedGuestName = guest.name;

  const curCharCount = getCurrentSecretCount(guest.name);

  labelWidget.text = `${guest.name}: ${guest.description} (Current: ${curCharCount})`;
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

  const openWindow = ui.getWindow(WINDOW_CLASSIFICATION);

  if (openWindow === null || openWindow === undefined) {
    return;
  }

  const descriptionLabel = openWindow.findWidget<LabelWidget>(
    GUEST_DESCRIPTION_WIDGET_NAME,
  );

  setDescription(guest, descriptionLabel);
}

export function openSecretGuestsWindow(): void {
  let spawnChance = getSpawnChance();
  let spawnCountPerName = getSpawnCountPerName();
  let spawnCountTotal = getSpawnCountTotal();
  let selectedWhitelistIndex = -1;
  let selectedBlacklistIndex = -1;

  let blacklist = getBlacklist();
  let whitelist = getWhitelist();

  const windowOpen = ui.getWindow(WINDOW_CLASSIFICATION);
  if (windowOpen !== null && windowOpen !== undefined) {
    windowOpen.bringToFront();
    return;
  }

  let guestGenerationSubscription: IDisposable | null = null;
  let backgroundRefreshSubscription: IDisposable | null = null;
  let backgroundRefreshTicks = 0;

  const window = ui.openWindow({
    classification: WINDOW_CLASSIFICATION,
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

  function updateSpawnChanceSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>(
      SPAWN_CHANCE_SPINNER_WIDGET_NAME,
    );
    spinner.text = `${spawnChance}%`;
  }

  function updateSpawnCountPerNameSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>(
      SPAWN_COUNT_PER_NAME_SPINNER_WIDGET_NAME,
    );
    spinner.text = spawnCountPerName.toString();
  }

  function updateSpawnCountTotalSpinner(): void {
    const spinner = window.findWidget<SpinnerWidget>(
      SPAWN_COUNT_TOTAL_SPINNER_WIDGET_NAME,
    );
    spinner.text = spawnCountTotal.toString();
  }

  function updateNotifyOnSpawnCheckbox(): void {
    const checkbox = window.findWidget<CheckboxWidget>(
      NOTIFY_ON_SPAWN_CHECKBOX_WIDGET_NAME,
    );

    checkbox.isChecked = getNotifyOnSpawn();
  }

  function toggleForceSpawnButtonEnabled(): void {
    const button = window.findWidget<ButtonWidget>(
      FORCE_SPAWN_BUTTON_WIDGET_NAME,
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
    const selectedGuest = getSelectedGuest();

    if (selectedGuest !== null) {
      setDescription(
        selectedGuest,
        getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME),
      );
    }

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

  function refreshLists(
    listToReselect: "whitelist" | "blacklist",
    previousIndex: number,
  ): void {
    blacklist = getBlacklist();
    whitelist = getWhitelist();

    const whitelistWidget = getListWidget(WHITELIST_WIDGET_NAME);
    const blacklistWidget = getListWidget(BLACKLIST_WIDGET_NAME);

    whitelistWidget.items = getGuestNames(whitelist);
    blacklistWidget.items = getGuestNames(blacklist);
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
        setDescription(
          whitelist[selectedWhitelistIndex],
          getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME),
        );
      } else {
        setDescription(null, getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME));
      }
    } else {
      selectedBlacklistIndex = nextSelectIndex(previousIndex, blacklist.length);

      if (selectedBlacklistIndex !== -1) {
        blacklistWidget.selectedCell = {
          row: selectedBlacklistIndex,
          column: 0,
        };
        setDescription(
          blacklist[selectedBlacklistIndex],
          getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME),
        );
      } else {
        setDescription(null, getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME));
      }
    }
  }

  function getListWidget(
    widgetName: "whitelist" | "blacklist",
  ): ListViewWidget {
    return window.findWidget<ListViewWidget>(widgetName);
  }

  function getLabelWidget(widgetName: "guest-description-label"): LabelWidget {
    return window.findWidget<LabelWidget>(widgetName);
  }

  function showResetConfirmation(onConfirm: () => void): void {
    const resetConfirmationWindowOpen = ui.getWindow(
      CONFIRM_RESET_WINDOW_CLASSIFICATION,
    );
    if (
      resetConfirmationWindowOpen !== null &&
      resetConfirmationWindowOpen !== undefined
    ) {
      resetConfirmationWindowOpen.bringToFront();
      return;
    }

    const parentWindow = ui.getWindow(WINDOW_CLASSIFICATION);

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
      classification: CONFIRM_RESET_WINDOW_CLASSIFICATION,
      title: "Reset Settings",
      x: x,
      y: y,
      width: 220,
      height: 90,
      widgets: [
        {
          type: "label",
          x: 10,
          y: 20,
          width: 200,
          height: 12,
          text: "Reset all settings to default?",
        },
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
        name: WHITELIST_WIDGET_NAME,
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
          setDescription(
            whitelist[index],
            getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME),
          );

          const blacklistWidget = getListWidget(BLACKLIST_WIDGET_NAME);
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
      },
      // blacklist
      {
        type: "listview",
        name: BLACKLIST_WIDGET_NAME,
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
          setDescription(
            blacklist[index],
            getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME),
          );

          const whitelistWidget = getListWidget(WHITELIST_WIDGET_NAME);
          whitelistWidget.selectedCell = null;
          refreshUiFromGameState();
        },
      },
      // guest description label
      {
        type: "label",
        name: GUEST_DESCRIPTION_WIDGET_NAME,
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
        name: SPAWN_CHANCE_LABEL_WIDGET_NAME,
        x: 10,
        y: 260,
        width: 100,
        height: 12,
        text: "Chance:",
      },
      // spawn chance box
      {
        type: "spinner",
        name: SPAWN_CHANCE_SPINNER_WIDGET_NAME,
        x: 110,
        y: 260,
        width: 68,
        height: 12,
        text: `${spawnChance}%`,
        onDecrement: () => {
          spawnChance = Math.max(0, formatChanceNumber(spawnChance - 0.1));
          saveSpawnChance(spawnChance);
          updateSpawnChanceSpinner();
        },
        onIncrement: () => {
          spawnChance = Math.min(100, formatChanceNumber(spawnChance + 0.1));
          saveSpawnChance(spawnChance);
          updateSpawnChanceSpinner();
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
              updateSpawnChanceSpinner();
            },
          });
        },
      },
      // spawn count per name label
      {
        type: "label",
        name: SPAWN_COUNT_PER_NAME_LABEL_WIDGET_NAME,
        x: 10,
        y: 275,
        width: 100,
        height: 12,
        text: "Max spawn/name:",
      },
      // spawn count per name box
      {
        type: "spinner",
        name: SPAWN_COUNT_PER_NAME_SPINNER_WIDGET_NAME,
        x: 110,
        y: 275,
        width: 68,
        height: 12,
        text: spawnCountPerName.toString(),
        onDecrement: () => {
          spawnCountPerName = Math.max(0, spawnCountPerName - 1);
          saveSpawnCountPerName(spawnCountPerName);
          updateSpawnCountPerNameSpinner();
        },
        onIncrement: () => {
          spawnCountPerName = Math.min(
            SPAWN_COUNT_PER_NAME_MAX,
            spawnCountPerName + 1,
          );
          saveSpawnCountPerName(spawnCountPerName);
          updateSpawnCountPerNameSpinner();
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
                Math.min(SPAWN_COUNT_PER_NAME_MAX, Math.floor(newSpawnCount)),
              );
              saveSpawnCountPerName(spawnCountPerName);
              updateSpawnCountPerNameSpinner();
            },
          });
        },
      },
      // spawn count total label
      {
        type: "label",
        name: SPAWN_COUNT_TOTAL_LABEL_WIDGET_NAME,
        x: 10,
        y: 290,
        width: 100,
        height: 12,
        text: "Max total spawn:",
      },
      // spawn count total box
      {
        type: "spinner",
        name: SPAWN_COUNT_TOTAL_SPINNER_WIDGET_NAME,
        x: 110,
        y: 290,
        width: 68,
        height: 12,
        text: spawnCountTotal.toString(),
        onDecrement: () => {
          spawnCountTotal = Math.max(0, spawnCountTotal - 1);
          saveSpawnCountTotal(spawnCountTotal);
          updateSpawnCountTotalSpinner();
        },
        onIncrement: () => {
          spawnCountTotal = Math.min(
            SPAWN_COUNT_TOTAL_MAX,
            spawnCountTotal + 1,
          );
          saveSpawnCountTotal(spawnCountTotal);
          updateSpawnCountTotalSpinner();
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
                Math.min(SPAWN_COUNT_TOTAL_MAX, Math.floor(newSpawnCount)),
              );
              saveSpawnCountTotal(spawnCountTotal);
              updateSpawnCountTotalSpinner();
            },
          });
        },
      },
      // force spawn selected button
      {
        type: "button",
        name: FORCE_SPAWN_BUTTON_WIDGET_NAME,
        x: 260,
        y: 271,
        width: 110,
        height: 20,
        text: "Force Spawn",
        isDisabled: true,
        onClick: () => {
          const selectedGuest = getSelectedGuest();
          if (selectedGuest !== null) {
            spawnGuest(selectedGuest, () => {
              refreshUiFromGameState();
            });
          }
        },
      },
      // reset to default button
      {
        type: "button",
        name: RESET_SETTINGS_BUTTON_WIDGET_NAME,
        x: 260,
        y: 295,
        width: 110,
        height: 20,
        text: "Reset Settings",
        onClick: () => {
          showResetConfirmation(() => {
            resetSettings();

            spawnChance = getSpawnChance();
            spawnCountPerName = getSpawnCountPerName();
            spawnCountTotal = getSpawnCountTotal();

            blacklist = getBlacklist();
            whitelist = getWhitelist();

            updateNotifyOnSpawnCheckbox();
            updateSpawnChanceSpinner();
            updateSpawnCountPerNameSpinner();
            updateSpawnCountTotalSpinner();

            const whitelistWidget = getListWidget("whitelist");
            const blacklistWidget = getListWidget("blacklist");

            whitelistWidget.items = getGuestNames(whitelist);
            blacklistWidget.items = getGuestNames(blacklist);

            whitelistWidget.selectedCell = null;
            blacklistWidget.selectedCell = null;

            selectedWhitelistIndex = -1;
            selectedBlacklistIndex = -1;

            setDescription(null, getLabelWidget(GUEST_DESCRIPTION_WIDGET_NAME));
            toggleForceSpawnButtonEnabled();
          });
        },
      },
      // notify of spawn checkbox
      {
        type: "checkbox",
        name: NOTIFY_ON_SPAWN_CHECKBOX_WIDGET_NAME,
        x: 260,
        y: 257,
        width: 130,
        height: 12,
        text: "Notify on spawn",
        isChecked: getNotifyOnSpawn(),
        onChange: (isChecked) => {
          saveNotifyOnSpawn(isChecked);
        },
      },
    ];
  }
}
