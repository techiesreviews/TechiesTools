import type { GoogleFontPreviewRequest } from "../framework/fonts/preview.ts";

export type ComboboxPreview = "color" | "type" | "tag";
export type ComboboxOptionDetail = {
  value: string;
  label: string;
  meta?: string;
  preview?: string;
  previewType?: ComboboxPreview | string;
  previewWeights?: readonly number[];
};
export type PreviewBoundsDetail = { min?: number; max?: number; width?: number; status?: string };

/** Events dispatched on, or bubbling from, one element rather than `window`. */
export interface ElementEventMap {
  /** Bubbles from a combobox root when an option is chosen. */
  "framework-combobox:select": { id?: string; value: string; label?: string; meta?: string };
  /** Bubbles from a combobox root when font options scroll into view. */
  "framework-combobox:preview-options": { id?: string; requests: readonly GoogleFontPreviewRequest[] };
  /** Sent to a combobox root to select an option by value. */
  "framework-combobox:set-value": { value: string };
  /** Sent to a combobox root to replace its options. */
  "framework-combobox:update-options": { group?: string; options: readonly ComboboxOptionDetail[]; value?: string };
  /** Bubbles from a Preview browser when its viewport width changes. */
  "preview-browser:resize": { width: number; min: number; max: number };
  /** Sent to a Preview browser to set its fluid bounds and status. */
  "preview-browser:set-bounds": PreviewBoundsDetail;
}

export type ElementEventName = keyof ElementEventMap;

export const emitElementEvent = <Name extends ElementEventName>(target: EventTarget | null | undefined, name: Name, detail: ElementEventMap[Name], options: { bubbles?: boolean } = {}) => {
  target?.dispatchEvent(new CustomEvent(name, { detail, bubbles: options.bubbles ?? false }));
};

/** Listen on `target` for one element event; returns the unsubscribe function. */
export const onElementEvent = <Name extends ElementEventName>(target: EventTarget | null | undefined, name: Name, listener: (detail: ElementEventMap[Name] | undefined) => void) => {
  const handler = (event: Event) => listener((event as CustomEvent<ElementEventMap[Name]>).detail);
  target?.addEventListener(name, handler);
  return () => target?.removeEventListener(name, handler);
};
