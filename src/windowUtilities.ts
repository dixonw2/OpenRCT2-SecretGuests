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

// update to something like this?
// can then pass any properties I want updated?
export function updateWidgetProperties(
  window: Window,
  widgetName: string,
  text?: string,
  visible?: boolean,
): void {
  const widget = window.findWidget<Widget>(widgetName);

  if (!isTextWidget(widget)) {
    return;
  }

  if (visible !== null && visible !== undefined) {
    widget.isVisible = visible;
  }

  if (text !== null && text !== undefined) {
    widget.text = text;
  }
}

export function updateWidgetText(
  window: Window,
  widgetName: string,
  text: string,
): void {
  const widget = window.findWidget<Widget>(widgetName);

  if (!isTextWidget(widget)) {
    return;
  }

  widget.text = text;
}

export function getMainWindow(): Window | null {
  return ui.getWindow(WINDOW_CLASSIFICATIONS.mainMenuWindow);
}
