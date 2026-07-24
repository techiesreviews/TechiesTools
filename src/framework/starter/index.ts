import type { TokenRegistry } from "../model/index.ts";

const colorIds = [
  "semantic.primary",
  "semantic.action",
  "semantic.surface",
  "semantic.text",
  "semantic.border",
  "semantic.focus",
] as const;
const typographyDimensions = ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"].map((name) => `typography.${name}`);
const typographyStrings = ["typography.family-body", "typography.family-heading", "typography.family-code"] as const;
const spacingIds = ["4xs", "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"].map((name) => `spacing.${name}`);
const radiusIds = ["xs", "s", "m", "l", "xl", "full"].map((name) => `radius.${name}`);

export const starterPrimitiveDefaults = Object.freeze({
  "semantic.primary": "#1d4ed8",
  "semantic.action": "#2563eb",
  "semantic.surface": "#ffffff",
  "semantic.text": "#111827",
  "semantic.border": "#c7d2fe",
  "semantic.focus": "#2563eb",
  "typography.family-body": "'Inter', system-ui, sans-serif",
  "typography.family-heading": "'Inter', system-ui, sans-serif",
  "typography.family-code": "'Roboto Mono', ui-monospace, monospace",
  "typography.xs": "0.7901rem",
  "typography.s": "0.8889rem",
  "typography.m": "1rem",
  "typography.l": "1.5rem",
  "typography.xl": "1.999rem",
  "typography.2xl": "2.6647rem",
  "typography.3xl": "3.552rem",
  "typography.4xl": "4.7348rem",
  "spacing.4xs": "0.25rem",
  "spacing.3xs": "0.5rem",
  "spacing.2xs": "0.625rem",
  "spacing.xs": "0.75rem",
  "spacing.s": "0.875rem",
  "spacing.m": "1rem",
  "spacing.l": "1.5rem",
  "spacing.xl": "2rem",
  "spacing.2xl": "3rem",
  "spacing.3xl": "4rem",
  "spacing.4xl": "6rem",
  "radius.xs": "0.125rem",
  "radius.s": "0.25rem",
  "radius.m": "0.5rem",
  "radius.l": "0.75rem",
  "radius.xl": "1rem",
  "radius.full": "999rem",
});

export const starterTokenRegistry: TokenRegistry = new Map([
  ...colorIds.map((id) => [id, "color"] as const),
  ...typographyDimensions.map((id) => [id, "dimension"] as const),
  ...typographyStrings.map((id) => [id, "string"] as const),
  ...spacingIds.map((id) => [id, "dimension"] as const),
  ...radiusIds.map((id) => [id, "dimension"] as const),
]);
