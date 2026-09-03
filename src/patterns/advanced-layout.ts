const DRAWER_MIN_HEIGHT = 160;
const PREVIEW_MIN_HEIGHT = 160;
const EDITOR_SPLIT_MIN = 20;
const EDITOR_SPLIT_MAX = 80;

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

export const clampDrawerHeight = (height: number, availableHeight: number) =>
  clamp(height, DRAWER_MIN_HEIGHT, availableHeight - PREVIEW_MIN_HEIGHT);

export const nextDrawerHeight = (height: number, key: string, availableHeight: number) => {
  if (key === "ArrowUp") return clampDrawerHeight(height + 24, availableHeight);
  if (key === "ArrowDown") return clampDrawerHeight(height - 24, availableHeight);
  if (key === "Home") return clampDrawerHeight(DRAWER_MIN_HEIGHT, availableHeight);
  if (key === "End") return clampDrawerHeight(availableHeight, availableHeight);
  return undefined;
};

export const editorSplitFromPointer = (pointer: number, start: number, size: number) =>
  Math.round(clamp(((pointer - start) / Math.max(size, 1)) * 100, EDITOR_SPLIT_MIN, EDITOR_SPLIT_MAX) * 100) / 100;

export const nextEditorSplit = (
  current: number,
  key: string,
  orientation: "horizontal" | "vertical",
) => {
  const decrease = orientation === "vertical" ? "ArrowLeft" : "ArrowUp";
  const increase = orientation === "vertical" ? "ArrowRight" : "ArrowDown";
  if (key === decrease) return clamp(current - 5, EDITOR_SPLIT_MIN, EDITOR_SPLIT_MAX);
  if (key === increase) return clamp(current + 5, EDITOR_SPLIT_MIN, EDITOR_SPLIT_MAX);
  if (key === "Home") return EDITOR_SPLIT_MIN;
  if (key === "End") return EDITOR_SPLIT_MAX;
  return undefined;
};
