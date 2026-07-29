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
  }: {
    isDisabled?: boolean;
    isVisible?: boolean;
    isChecked?: boolean;
    items?: ListViewItem[];
    selectedCell?: RowColumn | null;
    text?: string;
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
}

export function getMainWindow(): Window | null {
  return ui.getWindow(WINDOW_CLASSIFICATIONS.mainMenuWindow);
}

export function getResetSettingsConfirmationWindow(): Window | null {
  return ui.getWindow(WINDOW_CLASSIFICATIONS.confirmResetSettingsWindow);
}

export function nextSelectIndexForList(index: number, list: object[]): number {
  if (list.length === 0) {
    return -1;
  }

  if (index >= list.length) {
    return list.length - 1;
  }

  return index;
}
