/** WCAG contrast for the Framework: one parser, one ratio, and one pass mark for the preview and the export check. */
export type LinearRgb = readonly [number, number, number];
export type ContrastKind = "normal-text" | "large-text" | "non-text-ui";
export type ContrastGrade = { passes: boolean; level: "AAA" | "AA" | "Fail" };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const linearChannel = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const parseHex = (value: string): LinearRgb | undefined => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!match) return undefined;
  const hex = match[1].length === 3 ? [...match[1]].map((part) => part + part).join("") : match[1];
  const channel = (offset: number) => linearChannel(Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  return [channel(0), channel(2), channel(4)];
};

const parseRgb = (value: string): LinearRgb | undefined => {
  const match = /^rgba?\(\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)(?:\s*[/,]\s*(?:1(?:\.0+)?|100%))?\s*\)$/i.exec(value);
  if (!match) return undefined;
  const channels = [match[1], match[2], match[3]].map((raw) => Number.parseFloat(raw) / (raw.endsWith("%") ? 100 : 255));
  if (!channels.every(Number.isFinite)) return undefined;
  const [red, green, blue] = channels.map((channel) => linearChannel(clamp(channel)));
  return [red, green, blue];
};

const parseOklch = (value: string): LinearRgb | undefined => {
  const match = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([+-]?[0-9.]+)(?:deg)?(?:\s*\/\s*(?:1(?:\.0+)?|100%))?\s*\)$/i.exec(value);
  if (!match) return undefined;
  const lightness = Number.parseFloat(match[1]) / (match[1].endsWith("%") ? 100 : 1);
  const chroma = Number.parseFloat(match[2]);
  const hue = Number.parseFloat(match[3]) * Math.PI / 180;
  if (![lightness, chroma, hue].every(Number.isFinite)) return undefined;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
};

export const parseColor = (value: string): LinearRgb | undefined => parseHex(value.trim()) ?? parseRgb(value.trim()) ?? parseOklch(value.trim());
export const relativeLuminance = (color: LinearRgb) => 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
export const contrastBetween = (left: LinearRgb, right: LinearRgb) => {
  const [light, dark] = [relativeLuminance(left), relativeLuminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
};

/** Contrast ratio of two CSS colours (hex, rgb, or oklch), or undefined when either cannot be read. */
export const measureContrast = (foreground: string, background: string) => {
  const left = parseColor(foreground);
  const right = parseColor(background);
  return left && right ? contrastBetween(left, right) : undefined;
};

/** WCAG 2.2 AA pass marks: 4.5:1 for normal text, 3:1 for large text and UI parts. */
export const contrastThreshold = (kind: ContrastKind) => kind === "normal-text" ? 4.5 : 3;
const enhancedThreshold = (kind: ContrastKind) => kind === "normal-text" ? 7 : kind === "large-text" ? 4.5 : Number.POSITIVE_INFINITY;

export const gradeContrast = (kind: ContrastKind, ratio: number): ContrastGrade => {
  if (!(ratio >= contrastThreshold(kind))) return { passes: false, level: "Fail" };
  return { passes: true, level: ratio >= enhancedThreshold(kind) ? "AAA" : "AA" };
};
