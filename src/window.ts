import { SecretCharacter } from "./characters";
import {
  getWhitelist,
  getBlacklist,
  getSpawnChance,
  getSpawnCountPerName,
  getSpawnCountTotal,
  saveBlacklistNames,
  saveSpawnChance,
  saveSpawnCountPerName,
  saveSpawnCountTotal,
  SPAWN_COUNT_PER_NAME_MAX,
  SPAWN_COUNT_TOTAL_MAX,
} from "./settings";
import { getCurrentSecretCount, spawnCharacter } from "./spawning";

export const WINDOW_CLASSIFICATION = "secret-character-spawner-extended";
const CONFIRM_RESET_WINDOW_CLASSIFICATION =
  "secret-character-spawner-reset-confirm";

const WHITELIST_WIDGET_NAME = "whitelist";
const BLACKLIST_WIDGET_NAME = "blacklist";
const CHARACTER_DESCRIPTION_WIDGET_NAME = "character-description-label";
const SPAWN_CHANCE_LABEL_WIDGET_NAME = "spawn-chance-label";
const SPAWN_CHANCE_SPINNER_WIDGET_NAME = "spawn-chance-spinner";
const SPAWN_COUNT_PER_NAME_LABEL_WIDGET_NAME = "spawn-count-per-name-label";
const SPAWN_COUNT_PER_NAME_SPINNER_WIDGET_NAME = "spawn-count-per-name-spinner";
const SPAWN_COUNT_TOTAL_LABEL_WIDGET_NAME = "spawn-count-total-label";
const SPAWN_COUNT_TOTAL_SPINNER_WIDGET_NAME = "spawn-count-total-spinner";
const FORCE_SPAWN_BUTTON_WIDGET_NAME = "force-spawn-button";
const RESET_SETTINGS_BUTTON_WIDGET_NAME = "reset-settings-button";

let displayedCharacterName: string | null = null;

function getCharacterNames(characters: SecretCharacter[]): string[] {
  return characters.map((character) => character.name);
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
  character: SecretCharacter | null,
  labelWidget: LabelWidget,
): void {
  if (character === null) {
    displayedCharacterName = null;
    labelWidget.text = "";
    return;
  }

  displayedCharacterName = character.name;

  const curCharCount = getCurrentSecretCount(character.name);

  labelWidget.text = `${character.name}: ${character.description} (Current: ${curCharCount})`;
}

function resetSettings(): void {
  saveBlacklistNames();
  saveSpawnChance();
  saveSpawnCountPerName();
  saveSpawnCountTotal();
}

export function updateOpenWindowDescriptionIfDisplayed(
  character: SecretCharacter,
): void {
  if (displayedCharacterName !== character.name) {
    return;
  }

  if (typeof ui === "undefined") {
    return;
  }

  const openWindow = ui.getWindow(WINDOW_CLASSIFICATION);

  if (openWindow === null || openWindow === undefined) {
    return;
  }

  const descriptionLabel = openWindow.findWidget<LabelWidget>(
    CHARACTER_DESCRIPTION_WIDGET_NAME,
  );

  setDescription(character, descriptionLabel);
}

export function openSecretCharactersWindow(): void {
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

  const window = ui.openWindow({
    classification: WINDOW_CLASSIFICATION,
    title: "Secret Character Spawner - Extended",
    width: 420,
    height: 320,
    widgets: getWidgets(),
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

  function toggleForceSpawnButtonEnabled(): void {
    const button = window.findWidget<ButtonWidget>(
      FORCE_SPAWN_BUTTON_WIDGET_NAME,
    );
    button.isDisabled =
      selectedWhitelistIndex === -1 && selectedBlacklistIndex === -1;
  }

  function getSelectedCharacter(): SecretCharacter | null {
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

    whitelistWidget.items = getCharacterNames(whitelist);
    blacklistWidget.items = getCharacterNames(blacklist);
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
          getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
        );
      } else {
        setDescription(null, getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME));
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
          getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
        );
      } else {
        setDescription(null, getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME));
      }
    }
  }

  function getListWidget(
    widgetName: "whitelist" | "blacklist",
  ): ListViewWidget {
    return window.findWidget<ListViewWidget>(widgetName);
  }

  function getLabelWidget(
    widgetName: "character-description-label",
  ): LabelWidget {
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
        items: getCharacterNames(whitelist),
        onClick: (index) => {
          selectedWhitelistIndex = index;
          selectedBlacklistIndex = -1;
          setDescription(
            whitelist[index],
            getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
          );

          const blacklistWidget = getListWidget(BLACKLIST_WIDGET_NAME);
          blacklistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
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
        items: getCharacterNames(blacklist),
        onClick: (index) => {
          selectedBlacklistIndex = index;
          selectedWhitelistIndex = -1;
          setDescription(
            blacklist[index],
            getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
          );

          const whitelistWidget = getListWidget(WHITELIST_WIDGET_NAME);
          whitelistWidget.selectedCell = null;
          toggleForceSpawnButtonEnabled();
        },
      },
      // character description label
      {
        type: "label",
        name: CHARACTER_DESCRIPTION_WIDGET_NAME,
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

          const character = whitelist[selectedWhitelistIndex];
          const nextWhitelistIndex = selectedWhitelistIndex;

          saveBlacklistNames(blacklist.concat([character]));
          refreshLists("whitelist", nextWhitelistIndex);
          toggleForceSpawnButtonEnabled();
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

          const character = blacklist[selectedBlacklistIndex];
          const nextBlacklistIndex = selectedBlacklistIndex;
          const newBlacklist = blacklist.filter(
            (blacklistedCharacter) =>
              blacklistedCharacter.name !== character.name,
          );

          saveBlacklistNames(newBlacklist);
          refreshLists("blacklist", nextBlacklistIndex);
          toggleForceSpawnButtonEnabled();
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
          const selectedCharacter = getSelectedCharacter();
          if (selectedCharacter !== null) {
            spawnCharacter(selectedCharacter, (character) => {
              setDescription(
                character,
                getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
              );
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

            updateSpawnChanceSpinner();
            updateSpawnCountPerNameSpinner();
            updateSpawnCountTotalSpinner();

            const whitelistWidget = getListWidget("whitelist");
            const blacklistWidget = getListWidget("blacklist");

            whitelistWidget.items = getCharacterNames(whitelist);
            blacklistWidget.items = getCharacterNames(blacklist);

            whitelistWidget.selectedCell = null;
            blacklistWidget.selectedCell = null;

            selectedWhitelistIndex = -1;
            selectedBlacklistIndex = -1;

            setDescription(
              null,
              getLabelWidget(CHARACTER_DESCRIPTION_WIDGET_NAME),
            );
            toggleForceSpawnButtonEnabled();
          });
        },
      },
    ];
  }
}
