import { SECRET_GUESTS, SecretGuest } from "./guests";
import { getCustomGuests, saveCustomGuests } from "./storage";

const CUSTOM_GUESTS_WINDOW_CLASSIFICATION = "secret-guests-custom-guests";
const CUSTOM_GUESTS_LIST_WIDGET_NAME = "custom-guests-list";
const CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME = "custom-guest-description";

function getGuestNames(guests: SecretGuest[]): string[] {
  return guests.map((guest) => guest.name);
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

export function openCustomGuestsWindow(onCustomGuestsChanged: () => void): void {
  const windowOpen = ui.getWindow(CUSTOM_GUESTS_WINDOW_CLASSIFICATION);
  if (windowOpen !== null && windowOpen !== undefined) {
    windowOpen.bringToFront();
    return;
  }

  let customGuests = getCustomGuests();
  let selectedCustomGuestIndex = -1;

  const customGuestsWindow = ui.openWindow({
    classification: CUSTOM_GUESTS_WINDOW_CLASSIFICATION,
    title: "Custom Guests",
    width: 300,
    height: 180,
    widgets: [
      {
        type: "label",
        x: 10,
        y: 18,
        width: 130,
        height: 12,
        text: "Custom guests",
      },
      {
        type: "listview",
        name: CUSTOM_GUESTS_LIST_WIDGET_NAME,
        x: 10,
        y: 35,
        width: 130,
        height: 95,
        scrollbars: "vertical",
        isStriped: true,
        showColumnHeaders: false,
        canSelect: true,
        columns: [{ header: "Name", width: 120 }],
        items: getGuestNames(customGuests),
        onClick: (index) => {
          selectedCustomGuestIndex = index;
          updateDescription();
        },
      },
      {
        type: "label",
        name: CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME,
        x: 150,
        y: 35,
        width: 140,
        height: 60,
        text: "",
      },
      {
        type: "button",
        x: 150,
        y: 110,
        width: 60,
        height: 20,
        text: "Add",
        onClick: () => {
          showAddGuestNameInput();
        },
      },
      {
        type: "button",
        x: 220,
        y: 110,
        width: 60,
        height: 20,
        text: "Delete",
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
        type: "button",
        x: 110,
        y: 145,
        width: 80,
        height: 20,
        text: "Close",
        onClick: () => {
          customGuestsWindow.close();
        },
      },
    ],
  });

  function showAddGuestNameInput(): void {
    ui.showTextInput({
      title: "Add Custom Guest",
      description: "Guest name:",
      initialValue: "",
      maxLength: 32,
      callback: (input) => {
        const name = input.trim();

        if (name.length === 0 || isDuplicateGuestName(name, customGuests)) {
          return;
        }

        showAddGuestDescriptionInput(name);
      },
    });
  }

  function showAddGuestDescriptionInput(name: string): void {
    ui.showTextInput({
      title: "Add Custom Guest",
      description: "Description:",
      initialValue: "",
      maxLength: 80,
      callback: (input) => {
        const description = input.trim();

        if (description.length === 0) {
          return;
        }

        customGuests = customGuests.concat([{ name, description }]);
        selectedCustomGuestIndex = customGuests.length - 1;
        saveAndRefresh();
      },
    });
  }

  function saveAndRefresh(): void {
    saveCustomGuests(customGuests);
    customGuests = getCustomGuests();
    refreshList();
    updateDescription();
    onCustomGuestsChanged();
  }

  function refreshList(): void {
    const list = customGuestsWindow.findWidget<ListViewWidget>(
      CUSTOM_GUESTS_LIST_WIDGET_NAME,
    );
    list.items = getGuestNames(customGuests);

    if (selectedCustomGuestIndex === -1) {
      list.selectedCell = null;
      return;
    }

    list.selectedCell = {
      row: selectedCustomGuestIndex,
      column: 0,
    };
  }

  function updateDescription(): void {
    const label = customGuestsWindow.findWidget<LabelWidget>(
      CUSTOM_GUEST_DESCRIPTION_WIDGET_NAME,
    );

    if (
      selectedCustomGuestIndex < 0 ||
      selectedCustomGuestIndex >= customGuests.length
    ) {
      label.text = "";
      return;
    }

    const selectedGuest = customGuests[selectedCustomGuestIndex];
    label.text = selectedGuest.description;
  }
}
