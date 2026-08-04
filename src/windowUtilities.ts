import { WINDOW_CLASSIFICATIONS } from "./constants";

type TextWidget =
  | ButtonWidget
  | CheckboxWidget
  | DropdownWidget
  | GroupBoxWidget
  | LabelWidget
  | SpinnerWidget
  | TextBoxWidget;

function isTextWidget(widget: Widget): widget is TextWidget {
  return (
    widget.type === "button" ||
    widget.type === "checkbox" ||
    widget.type === "dropdown" ||
    widget.type === "groupbox" ||
    widget.type === "label" ||
    widget.type === "spinner" ||
    widget.type === "textbox"
  );
}

export function updateWidgetProperties(
  window: Window,
  widgetName: string,
  {
    isDisabled,
    isVisible,
    isChecked,
    items,
    selectedCell,
    text,
    x,
    y,
  }: {
    isDisabled?: boolean;
    isVisible?: boolean;
    isChecked?: boolean;
    items?: ListViewItem[];
    selectedCell?: RowColumn | null;
    text?: string;
    x?: number;
    y?: number;
  },
): void {
  const widget = window.findWidget<Widget>(widgetName);

  if (isDisabled !== undefined) {
    widget.isDisabled = isDisabled;
  }

  if (isVisible !== undefined) {
    widget.isVisible = isVisible;
  }

  if (isChecked !== undefined && widget.type === "checkbox") {
    widget.isChecked = isChecked;
  }

  if (items !== undefined && widget.type === "listview") {
    widget.items = items;
  }

  if (selectedCell !== undefined && widget.type === "listview") {
    widget.selectedCell = selectedCell;
  }

  if (text !== undefined && isTextWidget(widget)) {
    widget.text = text;
  }

  if (x !== undefined) {
    widget.x = x;
  }

  if (y !== undefined) {
    widget.y = y;
  }
}

export function getMainWindow(): Window | null {
  return ui.getWindow(WINDOW_CLASSIFICATIONS.mainMenuWindow);
}

export function showConfirmationWindow(
  parentWindow: Window | null,
  classification: string,
  title: string,
  message: string,
  onConfirm: () => void,
): void {
  const existingWindow = ui.getWindow(classification);
  if (existingWindow !== null) {
    existingWindow.bringToFront();
    return;
  }

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
    classification,
    title,
    x,
    y,
    width: 220,
    height: 90,
    widgets: [
      // label
      {
        type: "label",
        x: 10,
        y: 35,
        width: 200,
        height: 12,
        text: message,
        textAlign: "centred",
      },
      // confirm
      {
        type: "button",
        x: 35,
        y: 55,
        width: 65,
        height: 20,
        text: "Confirm",
        onClick: () => {
          confirmWindow.close();
          onConfirm();
        },
      },
      // cancel
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

export function nextSelectIndexForList<T>(index: number, list: T[]): number {
  if (list.length === 0) {
    return -1;
  }

  if (index >= list.length) {
    return list.length - 1;
  }

  return index;
}

export function formatNumberToDecimal(n: number, decimalCount: number): number {
  return Number(n.toFixed(decimalCount));
}
