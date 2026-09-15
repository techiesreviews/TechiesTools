export const stackedScrollPanelDefaultCss = `--stacked-scroll-panel-background: var(--semantic-surface);
--stacked-scroll-panel-card-background: color-mix(in oklch,var(--semantic-text) 4%,var(--semantic-surface));
--stacked-scroll-panel-color: var(--semantic-text);
--stacked-scroll-panel-border: color-mix(in oklch,var(--semantic-border) 68%,var(--semantic-surface));
--stacked-scroll-panel-radius: var(--radius-xl);
--stacked-scroll-panel-reveal: var(--space-m);
--stacked-scroll-panel-canvas-padding: clamp(var(--space-l),6vw,var(--space-4xl));
--stacked-scroll-panel-card-size: clamp(20rem,60svh,36rem);
position: relative;
display: grid;
gap: var(--space-xl);
inline-size: 100%;
box-sizing: border-box;
padding: var(--stacked-scroll-panel-canvas-padding);
background: var(--stacked-scroll-panel-background);
color: var(--stacked-scroll-panel-color);
container: pattern-stacked-scroll-panel / inline-size;`;

export const stackedScrollPanelNestedCss = `&:focus-visible {
  outline: 3px solid var(--semantic-focus);
  outline-offset: 3px;
}

&[data-motion="flow"] {
  gap: var(--space-l);
}

&[data-motion="flow"]::after { display: none; }

& .pattern-stacked-scroll-panel__card {
  position: sticky;
  z-index: calc(var(--stacked-scroll-panel-index) + 1);
  inset-block-start: calc(var(--stacked-scroll-panel-canvas-padding) + var(--stacked-scroll-panel-index) * var(--stacked-scroll-panel-reveal));
  display: grid;
  grid-template-columns: minmax(0,1.62fr) minmax(10rem,1fr);
  justify-self: center;
  inline-size: min(100%,60rem);
  min-block-size: var(--stacked-scroll-panel-card-size);
  overflow: clip;
  border: 1px solid var(--stacked-scroll-panel-border);
  border-radius: calc(var(--stacked-scroll-panel-radius) * .88);
  background: var(--stacked-scroll-panel-card-background);
  box-shadow: 0 .2rem 1rem color-mix(in oklch,var(--semantic-text) 6%,transparent);
  transform-origin: center top;
}

&::after {
  min-block-size: calc(var(--stacked-scroll-panel-card-size) + var(--space-l));
  content: "";
}

&[data-motion="flow"] .pattern-stacked-scroll-panel__card {
  position: relative;
  inset-block-start: auto;
}

& .pattern-stacked-scroll-panel__body {
  display: grid;
  align-content: space-between;
  gap: var(--space-l);
  min-inline-size: 0;
  padding: clamp(var(--space-m),4vw,var(--space-xl));
}

& .pattern-stacked-scroll-panel__eyebrow,
& h2,
& .pattern-stacked-scroll-panel__footer p { margin: 0; }

& h2 {
  font: 400 var(--text-xl)/.95 var(--font-heading);
  letter-spacing: -.05em;
}

& .pattern-stacked-scroll-panel__footer {
  display: grid;
  gap: var(--space-s);
  justify-items: start;
}

& .pattern-stacked-scroll-panel__footer p {
  max-inline-size: 28ch;
  color: color-mix(in oklch,var(--semantic-text) 72%,var(--semantic-surface));
  font: 400 var(--text-s)/1.5 var(--font-body);
}

& .pattern-stacked-scroll-panel__action {
  --btn-background: var(--semantic-text);
  --btn-border-color: var(--semantic-text);
  --btn-text-color: var(--semantic-surface);
  --btn-min-block-size: 2.25rem;
  --btn-padding-block: var(--space-4xs);
  --btn-padding-inline: var(--space-xs);
  --btn-font-size: var(--text-s);
  --btn-radius: var(--radius-full);
  white-space: nowrap;
}

& .pattern-stacked-scroll-panel__image {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  min-block-size: 0;
  object-fit: cover;
}

& .pattern-stacked-scroll-panel__card:focus-within {
  z-index: 10;
  animation: none;
  filter: none;
  scale: 1;
}`;

export const stackedScrollPanelSupportCss = `@supports (animation-timeline: scroll(nearest block)) {
  .pattern-stacked-scroll-panel[data-motion="stacked"] .pattern-stacked-scroll-panel__card:not(:focus-within) {
    animation: pattern-stacked-scroll-panel--recede linear both;
    animation-timeline: scroll(nearest block);
  }

  .pattern-stacked-scroll-panel[data-motion="stacked"] .pattern-stacked-scroll-panel__card:nth-of-type(1) { animation-range: 0% 29%; }
  .pattern-stacked-scroll-panel[data-motion="stacked"] .pattern-stacked-scroll-panel__card:nth-of-type(2) { animation-range: 30% 63%; }
  .pattern-stacked-scroll-panel[data-motion="stacked"] .pattern-stacked-scroll-panel__card:nth-of-type(3) { animation: none; }
}

@keyframes pattern-stacked-scroll-panel--recede {
  to { scale: var(--stacked-scroll-panel-recede-scale, .92); filter: saturate(.78); }
}

@container pattern-stacked-scroll-panel (max-width:30rem) {
  .pattern-stacked-scroll-panel .pattern-stacked-scroll-panel__card,
  .pattern-stacked-scroll-panel[data-motion] .pattern-stacked-scroll-panel__card:not(:focus-within) {
    position: relative;
    inset-block-start: auto;
    grid-template-columns: 1fr;
    animation: none;
  }

  .pattern-stacked-scroll-panel::after { display: none; }
  .pattern-stacked-scroll-panel .pattern-stacked-scroll-panel__image { aspect-ratio: 16 / 9; }
}

@media (max-width:40rem), (max-height:38rem), (prefers-reduced-motion:reduce) {
  .pattern-stacked-scroll-panel .pattern-stacked-scroll-panel__card,
  .pattern-stacked-scroll-panel[data-motion] .pattern-stacked-scroll-panel__card:not(:focus-within) {
    position: relative;
    inset-block-start: auto;
    grid-template-columns: 1fr;
    animation: none;
  }

  .pattern-stacked-scroll-panel::after { display: none; }
  .pattern-stacked-scroll-panel .pattern-stacked-scroll-panel__image { aspect-ratio: 16 / 9; }
}`;
