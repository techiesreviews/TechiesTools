import { definePattern } from "../../definition.ts";
import { stackedScrollPanelMarkup } from "./markup.ts";
import { stackedScrollPanelDefaultCss, stackedScrollPanelNestedCss, stackedScrollPanelSupportCss } from "./styles.ts";

export default definePattern({
  id: "stacked-scroll-panel",
  title: "Stacked scroll panel",
  category: "Content",
  description: "A full-canvas feature stack whose cards overlap as the reader moves through the surrounding page.",
  selector: ".pattern-stacked-scroll-panel",
  storageVersion: 4,
  previewScale: 0.72,
  previewLayout: "canvas",
  html: stackedScrollPanelMarkup,
  defaultCss: stackedScrollPanelDefaultCss,
  nestedCss: stackedScrollPanelNestedCss,
  supportCss: stackedScrollPanelSupportCss,
  dependencies: ["button"],
  defaultAttributes: { "data-motion": "stacked" },
  controls: [
    { id: "motion", label: "Motion", attribute: "data-motion", options: [
      { id: "stacked", label: "Stacked", attributeValue: "stacked" },
      { id: "flow", label: "Flow", attributeValue: "flow" },
    ] },
    { id: "gap", label: "Stack gap", options: [
      { id: "tight", label: "Tight", declarations: [{ property: "--stacked-scroll-panel-reveal", value: "var(--space-xs)" }] },
      { id: "default", label: "Default", declarations: [{ property: "--stacked-scroll-panel-reveal", value: "var(--space-m)" }] },
      { id: "open", label: "Open", declarations: [{ property: "--stacked-scroll-panel-reveal", value: "var(--space-xl)" }] },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "--stacked-scroll-panel-radius", value: "var(--radius-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "--stacked-scroll-panel-radius", value: "var(--radius-xl)" }] },
    ] },
  ],
});
