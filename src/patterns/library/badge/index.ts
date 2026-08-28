import { definePattern } from "../../definition.ts";

export default definePattern({
  id: "badge",
  title: "Badge",
  category: "Metadata",
  description: "Compact labels for status, category, and supporting information.",
  selector: ".pattern-badge",
  previewScale: 0.9,
  html: `<span class="pattern-badge">Active</span>`,
  defaultCss: `display: inline-flex;
align-items: center;
inline-size: fit-content;
min-block-size: 1.5rem;
border-radius: var(--radius-full);
padding: var(--space-4xs) var(--space-3xs);
background: color-mix(in oklch,var(--semantic-action) 13%,var(--semantic-surface));
color: var(--semantic-primary);
font-weight: 700;
font-size: var(--text-xs);
line-height: 1;
font-family: var(--font-body);`,
  controls: [
    { id: "tone", label: "Tone", options: [
      { id: "accent", label: "Accent", declarations: [{ property: "background", value: "color-mix(in oklch,var(--semantic-action) 13%,var(--semantic-surface))" }, { property: "color", value: "var(--semantic-primary)" }] },
      { id: "neutral", label: "Neutral", declarations: [{ property: "background", value: "color-mix(in oklch,var(--semantic-text) 6%,var(--semantic-surface))" }, { property: "color", value: "var(--semantic-text)" }] },
    ] },
    { id: "size", label: "Size", options: [
      { id: "small", label: "Small", declarations: [{ property: "min-block-size", value: "1.25rem" }, { property: "padding", value: "var(--space-4xs) var(--space-3xs)" }, { property: "font-size", value: "var(--text-xs)" }] },
      { id: "default", label: "Default", declarations: [{ property: "min-block-size", value: "1.5rem" }, { property: "padding", value: "var(--space-4xs) var(--space-3xs)" }, { property: "font-size", value: "var(--text-xs)" }] },
      { id: "large", label: "Large", declarations: [{ property: "min-block-size", value: "2rem" }, { property: "padding", value: "var(--space-3xs) var(--space-xs)" }, { property: "font-size", value: "var(--text-s)" }] },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "border-radius", value: "var(--radius-s)" }] },
      { id: "medium", label: "Medium", declarations: [{ property: "border-radius", value: "var(--radius-m)" }] },
      { id: "pill", label: "Pill", declarations: [{ property: "border-radius", value: "var(--radius-full)" }] },
    ] },
  ],
});
