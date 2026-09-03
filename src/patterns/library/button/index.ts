import { definePattern } from "../../definition.ts";
import { getComponentDefinition } from "../../../framework/component-catalog/index.ts";

const buttonComponent = getComponentDefinition("button");
if (!buttonComponent) throw new Error("Active Button Component Guidance is required by the Button Pattern.");

export default definePattern({
  id: "button",
  title: "Button",
  category: "Actions",
  description: "Primary, secondary, and ghost actions with shared focus and sizing rules.",
  selector: ".btn",
  storageVersion: 5,
  previewScale: 0.88,
  html: `<button class="btn" type="button">Create pattern</button>`,
  authoringSurfaceFor: "button",
  defaultCss: `--btn-background: var(--semantic-action);
--btn-border-color: var(--btn-background);
--btn-text-color: var(--semantic-surface);
--btn-min-block-size: 2.75rem;
--btn-padding-block: var(--space-3xs);
--btn-padding-inline: var(--space-s);
--btn-font-size: var(--text-m);
--btn-radius: var(--radius-m);
${buttonComponent.declarations}`,
  nestedCss: buttonComponent.nestedCss,
  controls: [
    { id: "treatment", label: "Treatment", options: [
      { id: "primary", label: "Primary", declarations: [{ property: "--btn-background", value: "var(--semantic-action)" }, { property: "--btn-border-color", value: "var(--btn-background)" }, { property: "--btn-text-color", value: "var(--semantic-surface)" }] },
      { id: "secondary", label: "Secondary", declarations: [{ property: "--btn-background", value: "var(--semantic-surface)" }, { property: "--btn-border-color", value: "var(--semantic-border)" }, { property: "--btn-text-color", value: "var(--semantic-text)" }] },
      { id: "ghost", label: "Ghost", declarations: [{ property: "--btn-background", value: "transparent" }, { property: "--btn-border-color", value: "transparent" }, { property: "--btn-text-color", value: "var(--semantic-action)" }] },
    ] },
    { id: "size", label: "Size", options: [
      { id: "small", label: "Small", declarations: [{ property: "--btn-min-block-size", value: "2.25rem" }, { property: "--btn-padding-block", value: "var(--space-4xs)" }, { property: "--btn-padding-inline", value: "var(--space-xs)" }, { property: "--btn-font-size", value: "var(--text-s)" }] },
      { id: "default", label: "Default", declarations: [{ property: "--btn-min-block-size", value: "2.75rem" }, { property: "--btn-padding-block", value: "var(--space-3xs)" }, { property: "--btn-padding-inline", value: "var(--space-s)" }, { property: "--btn-font-size", value: "var(--text-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "--btn-min-block-size", value: "3.25rem" }, { property: "--btn-padding-block", value: "var(--space-xs)" }, { property: "--btn-padding-inline", value: "var(--space-m)" }, { property: "--btn-font-size", value: "var(--text-l)" }] },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "--btn-radius", value: "var(--radius-s)" }] },
      { id: "medium", label: "Medium", declarations: [{ property: "--btn-radius", value: "var(--radius-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "--btn-radius", value: "var(--radius-l)" }] },
    ] },
  ],
});
