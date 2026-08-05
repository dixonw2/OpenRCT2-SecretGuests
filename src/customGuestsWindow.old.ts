import { SECRET_GUESTS, SecretGuest } from "./guests";
import { getGuestNames } from "./guestLists";
import { getCustomGuests, saveCustomGuests } from "./storage";
import {
  nextSelectIndexForList,
  updateWidgetProperties,
} from "./windowUtilities";

const WINDOW_CLASSIFICATION = "secret-guests-custom-guests";

const WIDGET_NAMES = {
  listview: {
    customGuests: "custom-guests-list",
  },
  label: {
    selectedCustomGuestDescription: "selected-custom-guest-description",
    customGuestName: "custom-guest-name-label",
    customGuestDescription: "custom-guest-description",
  },
  textbox: {
    customGuestName: "custom-guest-name",
    customGuestDescription: "custom-guest-description-input",
  },
  button: {
    addCustomGuest: "custom-guest-add-button",
    deleteCustomGuest: "custom-guest-delete-button",
    newCustomGuest: "custom-guest-new-button",
  },
} as const;

const LEFT_COLUMN_X = 10;
const LEFT_COLUMN_WIDTH = 230;
const LEFT_BUTTON_WIDTH = 110;
const LEFT_BUTTON_GAP = 10;
const LEFT_SECOND_BUTTON_X =
  LEFT_COLUMN_X + LEFT_BUTTON_WIDTH + LEFT_BUTTON_GAP;
const LEFT_TEXTBOX_WIDTH = 270;
const FLAG_COLUMN_X = 255;
const FLAG_COLUMN_GAP = 140;
const FLAG_WIDTH = 190;

interface GuestFlagOption {
  flag: PeepFlags;
  label: string;
}

const GUEST_FLAG_OPTIONS: GuestFlagOption[] = [
  { flag: "leavingPark", label: "Leaves park" },
  { flag: "slowWalk", label: "Slowly walks" },
  { flag: "tracking", label: "Track guest's actions" },
  { flag: "waving", label: "Waves" },
  { flag: "photo", label: "Photographs" },
  { flag: "painting", label: "Paints" },
  { flag: "wow", label: 'Thinks "Wow!"' },
  { flag: "litter", label: "Litters" },
  { flag: "lost", label: 'Thinks "I\'m lost!"' },
  { flag: "hunger", label: "Hunger increases" },
  { flag: "toilet", label: "Toilet increases" },
  { flag: "crowded", label: "Random thoughts" },
  { flag: "happiness", label: "Happiness decreases" },
  { flag: "nausea", label: "Nausea increases" },
  { flag: "purple", label: "Gifts purple shirts" },
  { flag: "pizza", label: "Gifts pizza" },
  { flag: "explode", label: "Explodes" },
  { flag: "contagious", label: "Makes nearby guests sick" },
  { flag: "joy", label: "Jumps" },
  { flag: "angry", label: "Vandalizes" },
  { flag: "iceCream", label: "Gifts ice cream" },
  { flag: "hereWeAre", label: 'Thinks "Here we are..."' },
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
  onCustomGuestsChanged: () => void,
): void {
  const existingWindow = ui.getWindow(WINDOW_CLASSIFICATION);
  if (existingWindow !== null) {
    existingWindow.bringToFront();
    return;
  }

  function setCustomGuests(value: SecretGuest[]): void {
    saveCustomGuests(value);
    refreshCustomGuestsList();
    //refreshEditorState();
    onCustomGuestsChanged();
  }

  let selectedCustomGuestIndex = -1;
  function setSelectedCustomGuestIndex(value: number = -1): void {
    selectedCustomGuestIndex = value;
    refreshCustomGuestsListSelection();
    refreshEditorState();
  }

  let newGuestFlags: PeepFlags[] = [];
  function setNewGuestFlags(value: PeepFlags[] = []): void {
    newGuestFlags = value;
    refreshFlagCheckboxes();
  }

  const customGuestsWindow = ui.openWindow({
    classification: WINDOW_CLASSIFICATION,
    title: "Custom Guests Manager",
    width: 600,
    height: 360,
    widgets: getWidgets(),
  });

  let createNewGuestStarted = false;
  function setCreateNewGuestStarted(value: boolean = false): void {
    createNewGuestStarted = value;
    const canEditNewGuest = createNewGuestStarted && !hasSelectedCustomGuest();

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.newCustomGuest,
      {
        text: createNewGuestStarted ? "Cancel" : "New",
      },
    );
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
        text: "",
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
        text: "",
      },
    );

    refreshAddButtonState();
    refreshFlagCheckboxes();
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
        isChecked: false,
        isDisabled: true,
        onChange: () => {
          toggleSelectedFlag(option.flag);
        },
      });
    }
  }

  function toggleSelectedFlag(flag: PeepFlags): void {
    if (hasSelectedCustomGuest()) {
      const selectedGuest = getCustomGuests()[selectedCustomGuestIndex];
      const currentFlags = selectedGuest.flags ?? [];

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
      return;
    }

    setNewGuestFlags(toggleFlag(newGuestFlags, flag));
  }

  function refreshEditorState(): void {
    const hasSelection = hasSelectedCustomGuest();
    const canEditNewGuest = createNewGuestStarted && !hasSelection;

    refreshDescription();
    refreshFlagCheckboxes();
    refreshAddButtonState();

    updateWidgetProperties(
      customGuestsWindow,
      WIDGET_NAMES.button.deleteCustomGuest,
      {
        isDisabled: !hasSelection,
      },
    );

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

  function refreshAddButtonState(): void {
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
      WIDGET_NAMES.button.addCustomGuest,
      {
        isDisabled: !canAddCustomGuest(name, description),
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

  function refreshDescription(): void {
    const customGuests = getCustomGuests();
    const description = hasSelectedCustomGuest()
      ? `${customGuests[selectedCustomGuestIndex].name}: ${
          customGuests[selectedCustomGuestIndex].description
        }`
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
    const flags = hasSelectedCustomGuest()
      ? (getCustomGuests()[selectedCustomGuestIndex].flags ?? [])
      : newGuestFlags;

    for (const option of GUEST_FLAG_OPTIONS) {
      updateWidgetProperties(
        customGuestsWindow,
        getFlagWidgetName(option.flag),
        {
          isChecked: hasFlag(flags, option.flag),
          isDisabled: !hasSelectedCustomGuest() && !createNewGuestStarted,
        },
      );
    }
  }

  function clearTextboxes(): void {
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

  function focusNameTextbox(): void {
    customGuestsWindow
      .findWidget<TextBoxWidget>(WIDGET_NAMES.textbox.customGuestName)
      .focus();
  }

  function hasSelectedCustomGuest(): boolean {
    return (
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < getCustomGuests().length
    );
  }

  function canAddCustomGuest(name: string, description: string): boolean {
    return (
      !hasSelectedCustomGuest() &&
      createNewGuestStarted &&
      name.length > 0 &&
      description.length > 0 &&
      !isDuplicateGuestName(name, getCustomGuests())
    );
  }

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
          setCreateNewGuestStarted();
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
        onClick: () => {
          const shouldCreateNewGuest = !createNewGuestStarted;

          setSelectedCustomGuestIndex();
          setNewGuestFlags();
          clearTextboxes();
          setCreateNewGuestStarted(shouldCreateNewGuest);

          if (shouldCreateNewGuest) {
            focusNameTextbox();
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
        isDisabled: true,
        onClick: () => {
          if (!hasSelectedCustomGuest()) {
            return;
          }

          const nextCustomGuests = getCustomGuests().filter(
            (_guest, index) => index !== selectedCustomGuestIndex,
          );

          selectedCustomGuestIndex = nextSelectIndexForList(
            selectedCustomGuestIndex,
            nextCustomGuests,
          );

          setCustomGuests(nextCustomGuests);
          setSelectedCustomGuestIndex(selectedCustomGuestIndex);
          refreshCustomGuestsListSelection();
          refreshDescription();
        },
      },
      // selected custom guest description
      {
        type: "label",
        name: WIDGET_NAMES.label.selectedCustomGuestDescription,
        x: LEFT_COLUMN_X,
        y: 220,
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
        isDisabled: true,
        onChange: () => {
          refreshAddButtonState();
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
        isDisabled: true,
        onChange: () => {
          refreshAddButtonState();
        },
      },
      // add new custom guest button
      {
        type: "button",
        name: WIDGET_NAMES.button.addCustomGuest,
        x: LEFT_COLUMN_X + Math.floor((LEFT_COLUMN_WIDTH - 90) / 2),
        y: 315,
        width: 90,
        height: 20,
        text: "Add",
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

          if (!canAddCustomGuest(name, description)) {
            refreshAddButtonState();
            return;
          }

          setCustomGuests(
            getCustomGuests().concat([
              {
                name,
                description,
                flags: newGuestFlags.slice(0),
              },
            ]),
          );
          //setSelectedCustomGuestIndex(getCustomGuests().length - 1);
          setCreateNewGuestStarted();
          setNewGuestFlags();
        },
      },
    ];

    addFlagWidgets(widgets);

    return widgets;
  }
}
