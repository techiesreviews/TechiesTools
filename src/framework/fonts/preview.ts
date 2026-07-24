import { isSafeFontFamilyName } from "./family.ts";

export const FONT_PREVIEW_TEXT = "The quick brown fox jumps over the lazy dog.";
export type GoogleFontPreviewRequest = {
  family: string;
  weights: readonly number[];
};

export const googleFontPreviewStylesheetUrl = (requests: readonly GoogleFontPreviewRequest[]): string => {
  const safeRequests = new Map<string, Set<number>>();
  for (const request of requests) {
    if (!isSafeFontFamilyName(request.family)) continue;
    const weights = safeRequests.get(request.family) ?? new Set<number>();
    request.weights
      .filter((weight) => Number.isInteger(weight) && weight >= 1 && weight <= 1000)
      .forEach((weight) => weights.add(weight));
    if (weights.size) safeRequests.set(request.family, weights);
  }
  if (!safeRequests.size) return "";

  const url = new URL("https://fonts.googleapis.com/css2");
  for (const [family, weights] of safeRequests) {
    url.searchParams.append("family", `${family}:wght@${[...weights].sort((left, right) => left - right).join(";")}`);
  }
  url.searchParams.set("text", `${FONT_PREVIEW_TEXT} ${[...safeRequests.keys()].join(" ")}`);
  url.searchParams.set("display", "swap");
  return url.toString();
};
