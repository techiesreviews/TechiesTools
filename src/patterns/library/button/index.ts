import { definePattern } from "../../definition.ts";

export default definePattern({
  id: "button",
  title: "Button",
  category: "Actions",
  description: "Primary, secondary, and ghost actions with shared focus and sizing rules.",
  selector: ".pattern-button",
  previewScale: 0.88,
  html: `<button class="pattern-button" type="button">Create pattern</button>`,
  defaultCss: `display: inline-flex;
align-items: center;
justify-content: center;
gap: var(--space-3xs);
min-block-size: 2.75rem;
border-width: 1px;
border-style: solid;
border-color: var(--semantic-action);
border-radius: var(--radius-m);
padding: var(--space-3xs) var(--space-s);
background: var(--semantic-action);
color: var(--semantic-surface);
font-weight: 650;
font-size: var(--text-m);
line-height: 1.2;
font-family: var(--font-body);
cursor: pointer;`,
  supportCss: `.pattern-button:hover { filter: brightness(.96); }
.pattern-button:focus-visible { outline: 3px solid var(--semantic-focus); outline-offset: 2px; }`,
  controls: [
    { id: "treatment", label: "Treatment", options: [
      { id: "primary", label: "Primary", declarations: [{ property: "border-color", value: "var(--semantic-action)" }, { property: "background", value: "var(--semantic-action)" }, { property: "color", value: "var(--semantic-surface)" }] },
      { id: "secondary", label: "Secondary", declarations: [{ property: "border-color", value: "var(--semantic-border)" }, { property: "background", value: "var(--semantic-surface)" }, { property: "color", value: "var(--semantic-text)" }] },
      { id: "ghost", label: "Ghost", declarations: [{ property: "border-color", value: "transparent" }, { property: "background", value: "transparent" }, { property: "color", value: "var(--semantic-action)" }] },
    ] },
    { id: "size", label: "Size", options: [
      { id: "small", label: "Small", declarations: [{ property: "min-block-size", value: "2.25rem" }, { property: "padding", value: "var(--space-4xs) var(--space-xs)" }, { property: "font-size", value: "var(--text-s)" }] },
      { id: "default", label: "Default", declarations: [{ property: "min-block-size", value: "2.75rem" }, { property: "padding", value: "var(--space-3xs) var(--space-s)" }, { property: "font-size", value: "var(--text-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "min-block-size", value: "3.25rem" }, { property: "padding", value: "var(--space-xs) var(--space-m)" }, { property: "font-size", value: "var(--text-l)" }] },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "border-radius", value: "var(--radius-s)" }] },
      { id: "medium", label: "Medium", declarations: [{ property: "border-radius", value: "var(--radius-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "border-radius", value: "var(--radius-l)" }] },
    ] },
  ],
});
