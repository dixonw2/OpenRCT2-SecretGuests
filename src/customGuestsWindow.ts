import { SECRET_GUESTS, SecretGuest } from "./guests";
import { getGuestNames } from "./guestLists";
import { getCustomGuests, saveCustomGuests } from "./storage";

const CUSTOM_GUESTS_WINDOW_CLASSIFICATION = "secret-guests-custom-guests";
const CUSTOM_GUESTS_LIST_WIDGET_NAME = "custom-guests-list";
const CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME_PREFIX = "custom-guest-description-";
const CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME = "custom-guest-name";
const CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME =
  "custom-guest-description-input";
const CUSTOM_GUEST_ADD_BUTTON_WIDGET_NAME = "custom-guest-add-button";
const CUSTOM_GUEST_DELETE_BUTTON_WIDGET_NAME = "custom-guest-delete-button";

const DESCRIPTION_LINE_COUNT = 5;
const DESCRIPTION_LINE_LENGTH = 43;

interface GuestFlagOption {
  flag: PeepFlags;
  label: string;
}

const GUEST_FLAG_OPTIONS: GuestFlagOption[] = [
  { flag: "leavingPark", label: "Leaves park" },
  { flag: "slowWalk", label: "Slowly walks" },
  { flag: "tracking", label: "Track guest's actions" },
  { flag: "waving", label: "Waves" },
  //{ flag: "hasPaidForParkEntry", label: "Paid entry" },
  { flag: "photo", label: "Photographs" },
  { flag: "painting", label: "Paints" },
  { flag: "wow", label: "Thinks \u201CWow!\u201D" },
  { flag: "litter", label: "Litters" },
  { flag: "lost", label: "Thinks \u201C I'm lost!\u201D" },
  { flag: "hunger", label: "Hunger increases" },
  { flag: "toilet", label: "Toilet increases" },
  { flag: "crowded", label: "Random thoughts" },
  { flag: "happiness", label: "Happiness decreases" },
  { flag: "nausea", label: "Nausea increases" },
  { flag: "purple", label: "Gifts purple shirts" },
  { flag: "pizza", label: "Gifts pizza" },
  { flag: "explode", label: "Explodes" },
  //{ flag: "rideShouldBeMarkedAsFavourite", label: "Favorite ride" },
  //{ flag: "parkEntranceChosen", label: "Entrance chosen" },
  { flag: "contagious", label: "Makes nearby guests sick" },
  { flag: "joy", label: "Jumps" },
  { flag: "angry", label: "Vandalizes" },
  { flag: "iceCream", label: "Gifts ice cream" },
  { flag: "hereWeAre", label: "Thinks \u201CHere we are...\u201D" },
  //{ flag: "positionFrozen", label: "Position freeze" },
  //{ flag: "animationFrozen", label: "Animation freeze" },
];

function getFlagWidgetName(flag: PeepFlags): string {
  return `custom-guest-flag-${flag}`;
}

function hasFlag(flags: PeepFlags[], flag: PeepFlags): boolean {
  return flags.indexOf(flag) !== -1;
}

function addFlag(flags: PeepFlags[], flag: PeepFlags): PeepFlags[] {
  if (hasFlag(flags, flag)) {
    return flags;
  }

  return flags.concat([flag]);
}

function removeFlag(flags: PeepFlags[], flag: PeepFlags): PeepFlags[] {
  return flags.filter((existingFlag) => existingFlag !== flag);
}

function toggleFlag(flags: PeepFlags[], flag: PeepFlags): PeepFlags[] {
  return hasFlag(flags, flag) ? removeFlag(flags, flag) : addFlag(flags, flag);
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

function wrapText(text: string): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;

    if (nextLine.length <= DESCRIPTION_LINE_LENGTH) {
      currentLine = nextLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }

    if (lines.length === DESCRIPTION_LINE_COUNT) {
      return lines;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  return lines;
}

export function openCustomGuestsWindow(
  onCustomGuestsChanged: () => void,
): void {
  const windowOpen = ui.getWindow(CUSTOM_GUESTS_WINDOW_CLASSIFICATION);
  if (windowOpen !== null) {
    windowOpen.bringToFront();
    return;
  }

  let customGuests = getCustomGuests();
  let selectedCustomGuestIndex = -1;
  let newGuestFlags: PeepFlags[] = [];

  const customGuestsWindow = ui.openWindow({
    classification: CUSTOM_GUESTS_WINDOW_CLASSIFICATION,
    title: "Custom Guests Manager",
    width: 600,
    height: 360,
    widgets: getWidgets(),
  });

  refreshEditorState();

  function getWidgets(): WidgetDesc[] {
    const widgets: WidgetDesc[] = [
      {
        type: "listview",
        name: CUSTOM_GUESTS_LIST_WIDGET_NAME,
        x: 10,
        y: 18,
        width: 230,
        height: 165,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 220 }],
        items: getGuestNames(customGuests),
        onClick: (index) => {
          selectedCustomGuestIndex = index;
          refreshEditorState();
        },
      },
      {
        type: "button",
        x: 305,
        y: 235,
        width: 90,
        height: 20,
        text: "New",
        onClick: () => {
          selectedCustomGuestIndex = -1;
          newGuestFlags = [];
          clearTextboxes();
          clearListSelection();
          refreshEditorState();
          customGuestsWindow
            .findWidget<TextBoxWidget>(CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME)
            .focus();
        },
      },
      {
        type: "button",
        name: CUSTOM_GUEST_DELETE_BUTTON_WIDGET_NAME,
        x: 405,
        y: 235,
        width: 90,
        height: 20,
        text: "Delete",
        isDisabled: true,
        onClick: () => {
          if (
            selectedCustomGuestIndex < 0 ||
            selectedCustomGuestIndex >= customGuests.length
          ) {
            return;
          }

          customGuests = customGuests.filter(
            (_guest, index) => index !== selectedCustomGuestIndex,
          );
          selectedCustomGuestIndex = -1;
          saveAndRefresh();
        },
      },
      {
        type: "label",
        x: 305,
        y: 265,
        width: 60,
        height: 12,
        text: "Name",
      },
      {
        type: "textbox",
        name: CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME,
        x: 305,
        y: 278,
        width: 300,
        height: 14,
        maxLength: 32,
        onChange: () => {
          updateAddButtonEnabled();
        },
      },
      {
        type: "label",
        x: 305,
        y: 298,
        width: 100,
        height: 12,
        text: "Description",
      },
      {
        type: "textbox",
        name: CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME,
        x: 305,
        y: 311,
        width: 300,
        height: 14,
        maxLength: 80,
        onChange: () => {
          updateAddButtonEnabled();
        },
      },
      {
        type: "button",
        name: CUSTOM_GUEST_ADD_BUTTON_WIDGET_NAME,
        x: 410,
        y: 333,
        width: 90,
        height: 20,
        text: "Add",
        isDisabled: true,
        onClick: () => {
          const name = getTrimmedTextboxText(
            customGuestsWindow,
            CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME,
          );
          const description = getTrimmedTextboxText(
            customGuestsWindow,
            CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME,
          );

          if (
            name.length === 0 ||
            description.length === 0 ||
            isDuplicateGuestName(name, customGuests)
          ) {
            updateAddButtonEnabled();
            return;
          }

          customGuests = customGuests.concat([
            {
              name,
              description,
              flags: newGuestFlags.slice(0),
            },
          ]);
          selectedCustomGuestIndex = customGuests.length - 1;
          newGuestFlags = [];
          saveAndRefresh();
        },
      },
    ];

    for (let i = 0; i < DESCRIPTION_LINE_COUNT; i++) {
      widgets.push({
        type: "label",
        name: `${CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME_PREFIX}${i}`,
        x: 10,
        y: 195 + i * 14,
        width: 230,
        height: 12,
        text: "",
      });
    }

    for (let i = 0; i < GUEST_FLAG_OPTIONS.length; i++) {
      const option = GUEST_FLAG_OPTIONS[i];
      const column = Math.floor(i / 11);
      const row = i % 11;

      widgets.push({
        type: "checkbox",
        name: getFlagWidgetName(option.flag),
        x: 260 + column * 145,
        y: 18 + row * 17,
        width: 200,
        //width: 140,
        height: 12,
        text: option.label,
        isChecked: false,
        onChange: () => {
          handleFlagChange(option.flag);
        },
      });
    }

    return widgets;
  }

  function handleFlagChange(flag: PeepFlags): void {
    if (
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < customGuests.length
    ) {
      const selectedGuest = customGuests[selectedCustomGuestIndex];
      const currentFlags = selectedGuest.flags ?? [];
      customGuests[selectedCustomGuestIndex] = {
        name: selectedGuest.name,
        description: selectedGuest.description,
        flags: toggleFlag(currentFlags, flag),
      };
      saveAndRefresh();
      return;
    }

    newGuestFlags = toggleFlag(newGuestFlags, flag);
    refreshFlagCheckboxes();
  }

  function saveAndRefresh(): void {
    saveCustomGuests(customGuests);
    customGuests = getCustomGuests();
    refreshList();
    refreshEditorState();
    onCustomGuestsChanged();
  }

  function refreshEditorState(): void {
    const hasSelection =
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < customGuests.length;

    updateDescription();
    refreshFlagCheckboxes();

    customGuestsWindow.findWidget<ButtonWidget>(
      CUSTOM_GUEST_DELETE_BUTTON_WIDGET_NAME,
    ).isDisabled = !hasSelection;

    customGuestsWindow.findWidget<TextBoxWidget>(
      CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME,
    ).isDisabled = hasSelection;
    customGuestsWindow.findWidget<TextBoxWidget>(
      CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME,
    ).isDisabled = hasSelection;

    updateAddButtonEnabled();
  }

  function updateAddButtonEnabled(): void {
    const hasSelection =
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < customGuests.length;
    const name = getTrimmedTextboxText(
      customGuestsWindow,
      CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME,
    );
    const description = getTrimmedTextboxText(
      customGuestsWindow,
      CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME,
    );

    customGuestsWindow.findWidget<ButtonWidget>(
      CUSTOM_GUEST_ADD_BUTTON_WIDGET_NAME,
    ).isDisabled =
      hasSelection ||
      name.length === 0 ||
      description.length === 0 ||
      isDuplicateGuestName(name, customGuests);
  }

  function refreshList(): void {
    const list = customGuestsWindow.findWidget<ListViewWidget>(
      CUSTOM_GUESTS_LIST_WIDGET_NAME,
    );
    list.items = getGuestNames(customGuests);

    if (
      selectedCustomGuestIndex < 0 ||
      selectedCustomGuestIndex >= customGuests.length
    ) {
      list.selectedCell = null;
      return;
    }

    list.selectedCell = {
      row: selectedCustomGuestIndex,
      column: 0,
    };
  }

  function updateDescription(): void {
    const hasSelection =
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < customGuests.length;
    const lines = hasSelection
      ? wrapText(
          `${customGuests[selectedCustomGuestIndex].name}: ${
            customGuests[selectedCustomGuestIndex].description
          }`,
        )
      : [];

    for (let i = 0; i < DESCRIPTION_LINE_COUNT; i++) {
      const label = customGuestsWindow.findWidget<LabelWidget>(
        `${CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME_PREFIX}${i}`,
      );
      label.text = lines[i] ?? "";
    }
  }

  function refreshFlagCheckboxes(): void {
    const flags =
      selectedCustomGuestIndex >= 0 &&
      selectedCustomGuestIndex < customGuests.length
        ? (customGuests[selectedCustomGuestIndex].flags ?? [])
        : newGuestFlags;

    for (let i = 0; i < GUEST_FLAG_OPTIONS.length; i++) {
      const flag = GUEST_FLAG_OPTIONS[i].flag;
      const checkbox = customGuestsWindow.findWidget<CheckboxWidget>(
        getFlagWidgetName(flag),
      );
      checkbox.isChecked = hasFlag(flags, flag);
    }
  }

  function clearTextboxes(): void {
    customGuestsWindow.findWidget<TextBoxWidget>(
      CUSTOM_GUEST_NAME_TEXTBOX_WIDGET_NAME,
    ).text = "";
    customGuestsWindow.findWidget<TextBoxWidget>(
      CUSTOM_GUEST_DESCRIPTION_TEXTBOX_WIDGET_NAME,
    ).text = "";
  }

  function clearListSelection(): void {
    customGuestsWindow.findWidget<ListViewWidget>(
      CUSTOM_GUESTS_LIST_WIDGET_NAME,
    ).selectedCell = null;
  }
}

// # TODODODODODOODODODODODODO

// Seems like some weird issue between deleting a custom guest and the whitelist/blacklist? Seems like right now the guest is added to whichever list is selected, and maybe there's an issue if there isn't one selected?
// I swear I had two custom guests in the blacklist, I deleted one, and the other one switched to the whitelist. Possibly because one was created without selecting a list?
// There were some issues with selecting a custom guest and getting a different description for some reason, it seemed. Not sure how to replicate