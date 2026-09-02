import { definePattern } from "../../definition.ts";

export default definePattern({
  id: "clickable-card",
  title: "Clickable card",
  category: "Navigation",
  description: "A semantic content card with one accessible whole-surface destination.",
  selector: ".pattern-card--clickable",
  previewScale: 0.72,
  html: `<article class="pattern-card pattern-card--clickable">
  <span class="pattern-badge pattern-badge--neutral">Navigation</span>
  <h3><a class="pattern-card__link" href="/framework/design-system">Open Framework</a></h3>
  <p>Inspect the source tokens and component guidance.</p>
</article>`,
  defaultCss: `position: relative;
display: grid;
align-content: start;
gap: var(--space-s);
inline-size: 100%;
max-inline-size: 24rem;
min-inline-size: 0;
border: 1px solid color-mix(in oklch,var(--semantic-border) 56%,var(--semantic-surface));
border-radius: var(--radius-l);
padding: var(--space-l);
background: var(--semantic-surface);
color: var(--semantic-text);
cursor: pointer;
container: pattern-card / inline-size;`,
  supportCss: `.pattern-card--clickable { transition: transform 160ms ease; }
.pattern-card--clickable:hover { transform: translateY(-.1875rem); }
.pattern-card--clickable:has(.pattern-card__link:focus-visible) { outline: 3px solid var(--semantic-focus); outline-offset: 3px; }
.pattern-card--clickable h3 { margin: 0; font: 650 var(--text-l)/1.15 var(--font-heading); letter-spacing: -.025em; }
.pattern-card--clickable p { margin: 0; color: color-mix(in oklch,var(--semantic-text) 68%,var(--semantic-surface)); font: 400 var(--text-m)/1.65 var(--font-body); }
.pattern-card__link { color: inherit; outline: 0; text-decoration: none; }
.pattern-card__link::after { position: absolute; inset: 0; border-radius: inherit; content: ""; }`,
  controls: [
    { id: "surface", label: "Surface", options: [
      { id: "default", label: "Default", declarations: [{ property: "background", value: "var(--semantic-surface)" }] },
      { id: "accent", label: "Accent", declarations: [{ property: "background", value: "color-mix(in oklch,var(--semantic-action) 7%,var(--semantic-surface))" }] },
    ] },
    { id: "padding", label: "Padding", options: [
      { id: "compact", label: "Compact", declarations: [{ property: "padding", value: "var(--space-m)" }] },
      { id: "default", label: "Default", declarations: [{ property: "padding", value: "var(--space-l)" }] },
      { id: "spacious", label: "Spacious", declarations: [{ property: "padding", value: "var(--space-xl)" }] },
    ] },
    { id: "radius", label: "Radius", options: [
      { id: "small", label: "Small", declarations: [{ property: "border-radius", value: "var(--radius-s)" }] },
      { id: "medium", label: "Medium", declarations: [{ property: "border-radius", value: "var(--radius-m)" }] },
      { id: "large", label: "Large", declarations: [{ property: "border-radius", value: "var(--radius-l)" }] },
    ] },
  ],
});
