import { definePattern } from "../../definition.ts";

export default definePattern({
  id: "card",
  title: "Card",
  category: "Content",
  description: "A bordered surface for content that needs an independent boundary.",
  selector: ".pattern-card",
  previewScale: 0.78,
  html: `<article class="pattern-card">
  <span class="pattern-badge pattern-badge--neutral">Foundation</span>
  <h3>Shared tokens</h3>
  <p>One source for every surface.</p>
</article>`,
  defaultCss: `display: grid;
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
container: pattern-card/inline-size;`,
  supportCss: `.pattern-card h3 { margin: 0; font: 650 var(--text-l)/1.15 var(--font-heading); letter-spacing: -.025em; }
.pattern-card p { max-inline-size: 56ch; margin: 0; color: color-mix(in oklch,var(--semantic-text) 68%,var(--semantic-surface)); font: 400 var(--text-m)/1.65 var(--font-body); }`,
  controls: [
    { id: "surface", label: "Surface", options: [
      { id: "default", label: "Default", declarations: [{ property: "background", value: "var(--semantic-surface)" }] },
      { id: "accent", label: "Accent", declarations: [{ property: "background", value: "color-mix(in oklch,var(--semantic-primary) 6%,var(--semantic-surface))" }] },
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
