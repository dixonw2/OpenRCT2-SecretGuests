import { WIDGET_NAMES, WINDOW_CLASSIFICATIONS } from "./constants";
import { SECRET_GUESTS, SecretGuest } from "./guests";
import { getGuestNames } from "./guestLists";
import { getCustomGuests, saveCustomGuests } from "./storage";
import { applyGuestFlagToExistingGuests } from "./spawning";
import {
  nextSelectIndexForList,
  updateWidgetProperties,
} from "./windowUtilities";

const LEFT_COLUMN_X = 10;
const LEFT_COLUMN_WIDTH = 230;
const LEFT_BUTTON_WIDTH = 70;
const LEFT_BUTTON_GAP = 10;
const LEFT_SECOND_BUTTON_X =
  LEFT_COLUMN_X + LEFT_BUTTON_WIDTH + LEFT_BUTTON_GAP;
const LEFT_THIRD_BUTTON_X =
  LEFT_SECOND_BUTTON_X + LEFT_BUTTON_WIDTH + LEFT_BUTTON_GAP;
const LEFT_TEXTBOX_WIDTH = 270;
const FLAG_COLUMN_X = 255;
const FLAG_COLUMN_GAP = 140;
const FLAG_WIDTH = 190;
("clear-custom-guest-selection-button");

interface GuestFlagOption {
  flag: PeepFlags;
  label: string;
  tooltip: string;
}

const GUEST_FLAG_OPTIONS: GuestFlagOption[] = [
  {
    flag: "leavingPark",
    label: "Leaves park",
    tooltip: "Guest will leave the park immediately on entry",
  },
  {
    flag: "slowWalk",
    label: "Slowly walks",
    tooltip: "Guest will walk slowly",
  },
  {
    flag: "tracking",
    label: "Track guest's actions",
    tooltip: "Will automatically track a guest",
  },
  { flag: "waving", label: "Waves", tooltip: "Guest will frequently wave" },
  {
    flag: "photo",
    label: "Photographs",
    tooltip: "Guest will frequently take photos",
  },
  { flag: "painting", label: "Paints", tooltip: "Guest will frequently paint" },
  {
    flag: "wow",
    label: "Thinks \u201CWow!\u201D",
    tooltip: "Guest will frequently think \u201CWow!\u201D on rides",
  },
  { flag: "litter", label: "Litters", tooltip: "Guest will frequently litter" },
  {
    flag: "lost",
    label: "Thinks \u201CI'm lost!\u201D",
    tooltip: "Guest will frequently think \u201CI'm lost!\u201D",
  },
  {
    flag: "hunger",
    label: "Hunger increases",
    tooltip: "Guest's hunger will frequently increase",
  },
  {
    flag: "toilet",
    label: "Toilet increases",
    tooltip: "Guest will frequently need to use the restroom",
  },
  {
    flag: "crowded",
    label: "Random thoughts",
    tooltip: "Guest will frequently have random thoughts",
  },
  {
    flag: "happiness",
    label: "Happiness decreases",
    tooltip: "Guest's happiness will frequently decrease",
  },
  {
    flag: "nausea",
    label: "Nausea increases",
    tooltip: "Guest's nausea will frequently increase",
  },
  {
    flag: "purple",
    label: "Gifts purple shirts",
    tooltip: "Guest will frequently gift purple shirts",
  },
  {
    flag: "pizza",
    label: "Gifts pizza",
    tooltip: "Guest will frequently gift pizza",
  },
  {
    flag: "explode",
    label: "Explodes",
    tooltip: "Guest will explode",
  },
  {
    flag: "contagious",
    label: "Makes nearby guests sick",
    tooltip: "Guest will make nearby guests sick",
  },
  { flag: "joy", label: "Jumps", tooltip: "Guest will frequently jump" },
  {
    flag: "angry",
    label: "Vandalizes",
    tooltip: "Guest will frequently vandalize",
  },
  {
    flag: "iceCream",
    label: "Gifts ice cream",
    tooltip: "Guest will frequently gift ice cream",
  },
  {
    flag: "hereWeAre",
    label: "Thinks \u201CHere we are...\u201D",
    tooltip: "Guest will frequently think \u201CHere we are...\u201D on rides",
  },
];

function getFlagWidgetName(flag: PeepFlags): string {
  return `custom-guest-flag-${flag}`;
}

function hasFlag(flags: PeepFlags[], flag: PeepFlags): boolean {
  return flags.indexOf(flag) !== -1;
}

function toggleFlag(flags: PeepFlags[], flag: PeepFlags): PeepFlags[] {
  return hasFlag(flags, flag)
    ? flags.filter((existingFlag) => existingFlag !== flag)
    : flags.concat([flag]);
}

function isDuplicateGuestName(
  name: string,
  customGuests: SecretGuest[],
): boolean {
  return (
    SECRET_GUESTS.some((guest) => guest.name === name) ||
    customGuests.some((guest) => guest.name === name)
  );
}

function getTrimmedTextboxText(window: Window, widgetName: string): string {
  return window.findWidget<TextBoxWidget>(widgetName).text.trim();
}

export function openCustomGuestsWindow(
  onCustomGuestsChanged: (deletedGuestName?: string) => void,
): void {
  // #region Properties
  function setCustomGuests(
    value: SecretGuest[],
    deletedGuestName?: string,
  ): void {
    saveCustomGuests(value);
    refreshCustomGuestsList();
    onCustomGuestsChanged(deletedGuestName);
  }

  let selectedCustomGuestIndex = -1;
  function setSelectedCustomGuestIndex(value: number = -1): void {
    selectedCustomGuestIndex = value;
    refreshCustomGuestsListSelection();
    refreshEditorState();
  }

  let newCustomGuestFlags: PeepFlags[] = [];
  function setNewCustomGuestFlags(value: PeepFlags[] = []): void {
    newCustomGuestFlags = value;
    refreshFlagCheckboxes();
  }

  let isCreatingCustomGuest = false;
  function setIsCreatingCustomGuest(value: boolean = false): void {
    isCreatingCustomGuest = value;
    refreshNewCustomGuestButtonState();
    refreshEditorState();
  }
  // #endregion

  // #region Custom Guests Window
  const existingWindow = ui.getWindow(
    WINDOW_CLASSIFICATIONS.customGuestsWindow,
  );
  if (existingWindow !== null) {
    existingWindow.bringToFront();
    return;
  }

  const customGuestsWindow = ui.openWindow({
    classification: WINDOW_CLASSIFICATIONS.customGuestsWindow,
    title: "Custom Guests Manager",
    width: 600,
    height: 360,
    widgets: getWidgets(),
  });
  // #endregion

  // #region UI Updaters
  function refreshEditorState(): void {
    const hasSelection = hasSelectedCustomGuest();
    const canEditNewGuest = isCreatingCustomGuest && !hasSelection;

    refreshSelectedCustomGuestDescription();
    refreshFlagCheckboxes();
    refreshSaveCustomGuestButtonState();
    refreshDeleteCustomGuestButtonState();
    refreshClearCustomGuestSelectionButtonState();

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.label.customGuestName,
      {
        isDisabled: !canEditNewGuest,
      },
    );

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestName,
      {
        isDisabled: !canEditNewGuest,
      },
    );

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.label.customGuestDescription,
      {
        isDisabled: !canEditNewGuest,
      },
    );

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestDescription,
      {
        isDisabled: !canEditNewGuest,
      },
    );
  }

  function refreshNewCustomGuestButtonState(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.newCustomGuest,
      {
        text: isCreatingCustomGuest ? "Cancel" : "New",
      },
    );
  }

  function refreshDeleteCustomGuestButtonState(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.deleteCustomGuest,
      {
        isDisabled: !hasSelectedCustomGuest(),
      },
    );
  }

  function refreshClearCustomGuestSelectionButtonState(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.clearSelectedCustomGuest,
      {
        isDisabled: !hasSelectedCustomGuest(),
      },
    );
  }

  function refreshSaveCustomGuestButtonState(): void {
    const name = getTrimmedTextboxText(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestName,
    );
    const description = getTrimmedTextboxText(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestDescription,
    );

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.saveCustomGuest,
      {
        isDisabled: !canSaveCustomGuest(name, description),
      },
    );
  }

  function refreshCustomGuestsList(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.listview.customGuests,
      {
        items: getGuestNames(getCustomGuests()),
      },
    );
  }

  function refreshCustomGuestsListSelection(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.listview.customGuests,
      {
        selectedCell: hasSelectedCustomGuest()
          ? {
              row: selectedCustomGuestIndex,
              column: 0,
            }
          : null,
      },
    );
  }

  function refreshSelectedCustomGuestDescription(): void {
    const selectedGuest = getSelectedCustomGuest();
    const description =
      selectedGuest !== null
        ? `${selectedGuest.name}: ${selectedGuest.description}`
        : "";

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.label.selectedCustomGuestDescription,
      {
        text: description,
      },
    );
  }

  function refreshFlagCheckboxes(): void {
    const flags = getCurrentFlagSelection();

    for (const option of GUEST_FLAG_OPTIONS) {
      updateWidgetProperties(
        customGuestsWindow,
        getFlagWidgetName(option.flag),
        {
          isChecked: hasFlag(flags, option.flag),
          isDisabled: !hasSelectedCustomGuest() && !isCreatingCustomGuest,
        },
      );
    }
  }
  // #endregion

  // #region Helpers
  function toggleSelectedCustomGuestFlag(flag: PeepFlags): void {
    const selectedGuest = getSelectedCustomGuest();
    if (selectedGuest !== null) {
      const currentFlags = selectedGuest.flags ?? [];
      const enabled = !hasFlag(currentFlags, flag);

      setCustomGuests(
        getCustomGuests().map((guest, index) =>
          index === selectedCustomGuestIndex
            ? {
                ...selectedGuest,
                flags: toggleFlag(currentFlags, flag),
              }
            : guest,
        ),
      );
      applyGuestFlagToExistingGuests(selectedGuest.name, flag, enabled);
      return;
    }

    setNewCustomGuestFlags(toggleFlag(newCustomGuestFlags, flag));
  }

  function clearCustomGuestTextboxes(): void {
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestName,
      {
        text: "",
      },
    );
    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.textbox.customGuestDescription,
      {
        text: "",
      },
    );
  }

  function focusCustomGuestNameTextbox(): void {
    customGuestsWindow
      .findWidget<TextBoxWidget>(WIDGET_NAMES.textbox.customGuestName)
      .focus();
  }

  function getSelectedCustomGuest(): SecretGuest | null {
    if (!hasSelectedCustomGuest()) {
      return null;
    }

    return getCustomGuests()[selectedCustomGuestIndex];
  }

  function getCurrentFlagSelection(): PeepFlags[] {
    const selectedGuest = getSelectedCustomGuest();

    return selectedGuest !== null
      ? (selectedGuest.flags ?? [])
      : newCustomGuestFlags;
  }

  function hasSelectedCustomGuest(): boolean {
    return (
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < getCustomGuests().length
    );
  }

  function canSaveCustomGuest(name: string, description: string): boolean {
    return (
      !hasSelectedCustomGuest() &&
      isCreatingCustomGuest &&
      name.length > 0 &&
      description.length > 0 &&
      !isDuplicateGuestName(name, getCustomGuests())
    );
  }
  // #endregion

  function getWidgets(): WidgetDesc[] {
    const widgets: WidgetDesc[] = [
      // custom guests list
      {
        type: "listview",
        name: WIDGET_NAMES.listview.customGuests,
        x: LEFT_COLUMN_X,
        y: 18,
        width: LEFT_COLUMN_WIDTH,
        height: 170,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 220 }],
        items: getGuestNames(getCustomGuests()),
        onClick: (index) => {
          setSelectedCustomGuestIndex(index);
          setIsCreatingCustomGuest();
        },
      },
      // new custom guest button
      {
        type: "button",
        name: WIDGET_NAMES.button.newCustomGuest,
        x: LEFT_COLUMN_X,
        y: 195,
        width: LEFT_BUTTON_WIDTH,
        height: 20,
        text: "New",
        tooltip: "Create a new custom guest",
        onClick: () => {
          const shouldCreateNewGuest = !isCreatingCustomGuest;

          setSelectedCustomGuestIndex();
          setNewCustomGuestFlags();
          clearCustomGuestTextboxes();
          setIsCreatingCustomGuest(shouldCreateNewGuest);

          if (shouldCreateNewGuest) {
            focusCustomGuestNameTextbox();
          }
        },
      },
      // delete selected custom guest button
      {
        type: "button",
        name: WIDGET_NAMES.button.deleteCustomGuest,
        x: LEFT_SECOND_BUTTON_X,
        y: 195,
        width: LEFT_BUTTON_WIDTH,
        height: 20,
        text: "Delete",
        tooltip: "Delete selected custom guest",
        isDisabled: true,
        onClick: () => {
          if (!hasSelectedCustomGuest()) {
            return;
          }

          const deletedGuestName =
            getCustomGuests()[selectedCustomGuestIndex].name;
          const nextCustomGuests = getCustomGuests().filter(
            (_guest, index) => index !== selectedCustomGuestIndex,
          );

          selectedCustomGuestIndex = nextSelectIndexForList(
            selectedCustomGuestIndex,
            nextCustomGuests,
          );

          setCustomGuests(nextCustomGuests, deletedGuestName);
          setSelectedCustomGuestIndex(selectedCustomGuestIndex);
        },
      },
      // clear selected custom guest button
      {
        type: "button",
        name: WIDGET_NAMES.button.clearSelectedCustomGuest,
        x: LEFT_THIRD_BUTTON_X,
        y: 195,
        width: LEFT_BUTTON_WIDTH,
        height: 20,
        text: "Clear",
        tooltip: "Clear selection",
        isDisabled: true,
        onClick: () => {
          setSelectedCustomGuestIndex();
          setIsCreatingCustomGuest();
        },
      },
      // selected custom guest description
      {
        type: "label",
        name: WIDGET_NAMES.label.selectedCustomGuestDescription,
        x: LEFT_COLUMN_X,
        y: 225,
        width: 580,
        height: 12,
        text: "",
      },
      // new custom guest name label
      {
        type: "label",
        name: WIDGET_NAMES.label.customGuestName,
        x: LEFT_COLUMN_X,
        y: 242,
        width: 60,
        height: 12,
        text: "Name",
        tooltip: "Name of the new custom guest",
        isDisabled: true,
      },
      // new custom guest name textbox
      {
        type: "textbox",
        name: WIDGET_NAMES.textbox.customGuestName,
        x: LEFT_COLUMN_X,
        y: 255,
        width: LEFT_TEXTBOX_WIDTH,
        height: 14,
        maxLength: 24,
        tooltip: "Name of the new custom guest",
        isDisabled: true,
        onChange: () => {
          refreshSaveCustomGuestButtonState();
        },
      },
      // new custom guest description label
      {
        type: "label",
        name: WIDGET_NAMES.label.customGuestDescription,
        x: LEFT_COLUMN_X,
        y: 275,
        width: 100,
        height: 12,
        text: "Description",
        tooltip: "Description of the new custom guest",
        isDisabled: true,
      },
      // new custom guest description textbox
      {
        type: "textbox",
        name: WIDGET_NAMES.textbox.customGuestDescription,
        x: LEFT_COLUMN_X,
        y: 288,
        width: LEFT_TEXTBOX_WIDTH,
        height: 14,
        maxLength: 42,
        tooltip: "Description of the new custom guest",
        isDisabled: true,
        onChange: () => {
          refreshSaveCustomGuestButtonState();
        },
      },
      // save new custom guest button
      {
        type: "button",
        name: WIDGET_NAMES.button.saveCustomGuest,
        x: LEFT_COLUMN_X + Math.floor((LEFT_COLUMN_WIDTH - 90) / 2),
        y: 315,
        width: 90,
        height: 20,
        text: "Save",
        tooltip: "Save custom guest",
        isDisabled: true,
        onClick: () => {
          const name = getTrimmedTextboxText(
            customGuestsWindow,
            WIDGET_NAMES.textbox.customGuestName,
          );
          const description = getTrimmedTextboxText(
            customGuestsWindow,
            WIDGET_NAMES.textbox.customGuestDescription,
          );

          if (!canSaveCustomGuest(name, description)) {
            refreshSaveCustomGuestButtonState();
            return;
          }

          setCustomGuests(
            getCustomGuests().concat([
              {
                name,
                description,
                flags: newCustomGuestFlags.slice(0),
              },
            ]),
          );
          clearCustomGuestTextboxes();
          refreshSaveCustomGuestButtonState();
          setNewCustomGuestFlags();
        },
      },
    ];

    addFlagWidgets(widgets);
    return widgets;
  }

  function addFlagWidgets(widgets: WidgetDesc[]): void {
    for (let i = 0; i < GUEST_FLAG_OPTIONS.length; i++) {
      const option = GUEST_FLAG_OPTIONS[i];
      const column = Math.floor(i / 11);
      const row = i % 11;

      widgets.push({
        type: "checkbox",
        name: getFlagWidgetName(option.flag),
        x: FLAG_COLUMN_X + column * FLAG_COLUMN_GAP,
        y: 18 + row * 17,
        width: FLAG_WIDTH,
        height: 12,
        text: option.label,
        tooltip: option.tooltip,
        isChecked: false,
        isDisabled: true,
        onChange: () => {
          toggleSelectedCustomGuestFlag(option.flag);
        },
      });
    }
  }
}
