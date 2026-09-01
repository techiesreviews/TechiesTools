export const listingCardDefaultCss = `--listing-card-background: var(--semantic-surface);
--listing-card-color: var(--semantic-text);
--listing-card-muted: color-mix(in oklch,var(--semantic-text) 68%,var(--semantic-surface));
--listing-card-border: color-mix(in oklch,var(--semantic-border) 64%,var(--semantic-surface));
--listing-card-accent: var(--semantic-action);
--listing-card-radius: var(--radius-xl);
--listing-card-padding: var(--space-m);
--listing-card-gap: var(--space-s);
--listing-card-media-ratio: 3 / 2;
position: relative;
display: grid;
gap: var(--listing-card-gap);
inline-size: 32rem;
max-inline-size: 100%;
min-inline-size: 0;
overflow: clip;
border: 1px solid var(--listing-card-border);
border-radius: var(--listing-card-radius);
background: var(--listing-card-background);
color: var(--listing-card-color);
box-shadow: 0 var(--space-s) var(--space-xl) color-mix(in oklch,var(--semantic-text) 14%,transparent);
isolation: isolate;
container: pattern-listing-card / inline-size;`;

export const listingCardSupportCss = `.pattern-listing-card[data-tone="accent"] {
  --listing-card-background: color-mix(in oklch,var(--semantic-primary) 7%,var(--semantic-surface));
  --listing-card-border: color-mix(in oklch,var(--semantic-primary) 36%,var(--semantic-border));
  --listing-card-accent: var(--semantic-primary);
}

.pattern-listing-card__media {
  position: relative;
  min-inline-size: 0;
  overflow: clip;
  aspect-ratio: var(--listing-card-media-ratio);
  background: color-mix(in oklch,var(--semantic-primary) 8%,var(--semantic-surface));
}

.pattern-listing-card:not([data-media]) .pattern-listing-card__media,
.pattern-listing-card[data-media="inset"] .pattern-listing-card__media {
  margin: var(--listing-card-padding) var(--listing-card-padding) 0;
  border-radius: calc(var(--listing-card-radius) * .72);
}

.pattern-listing-card__image {
  display: block;
  inline-size: 100%;
  block-size: 100%;
  object-fit: cover;
  transition: scale 400ms ease;
}

.pattern-listing-card:hover .pattern-listing-card__image:not(.pattern-listing-card__image--blur) { scale: 1.025; }
.pattern-listing-card__image--blur { display: none; }

.pattern-listing-card__badge,
.pattern-listing-card__favorite {
  position: absolute;
  z-index: 3;
  inset-block-start: var(--space-s);
  border: 1px solid color-mix(in oklch,var(--semantic-surface) 35%,transparent);
  color: var(--semantic-surface);
  background: color-mix(in oklch,var(--semantic-text) 64%,transparent);
  backdrop-filter: blur(.55rem);
}

.pattern-listing-card__badge {
  inset-inline-start: var(--space-s);
  padding: var(--space-3xs) var(--space-xs);
  border-radius: var(--radius-full);
  font: 700 var(--text-xs)/1 var(--font-body);
}

.pattern-listing-card__favorite {
  display: grid;
  inline-size: 2.75rem;
  aspect-ratio: 1;
  inset-inline-end: var(--space-s);
  border-radius: var(--radius-full);
  cursor: pointer;
  place-items: center;
}

.pattern-listing-card__favorite input {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.pattern-listing-card__favorite svg {
  inline-size: 1.25rem;
  fill: transparent;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.pattern-listing-card__favorite:has(input:checked) { background: var(--listing-card-accent); }
.pattern-listing-card__favorite:has(input:checked) svg { fill: currentColor; }
.pattern-listing-card__favorite:has(input:focus-visible) { outline: 3px solid var(--semantic-focus); outline-offset: 3px; }

.pattern-listing-card__body {
  position: relative;
  z-index: 2;
  display: grid;
  gap: var(--space-s);
  min-inline-size: 0;
  padding: 0 var(--listing-card-padding) var(--listing-card-padding);
}

.pattern-listing-card[data-media="bleed"] { gap: 0; }
.pattern-listing-card[data-media="bleed"] .pattern-listing-card__body { padding-block-start: var(--listing-card-padding); }

.pattern-listing-card__header,
.pattern-listing-card__footer {
  display: flex;
  gap: var(--space-s);
  align-items: center;
  justify-content: space-between;
}

.pattern-listing-card h3,
.pattern-listing-card__meta,
.pattern-listing-card__price { margin: 0; }

.pattern-listing-card h3 {
  min-inline-size: 0;
  font: 650 var(--text-l)/1.15 var(--font-heading);
  letter-spacing: -.025em;
}

.pattern-listing-card__rating {
  flex: none;
  font: 700 var(--text-s)/1.2 var(--font-body);
}

.pattern-listing-card__rating span { color: oklch(72% .17 75); }
.pattern-listing-card__meta { color: var(--listing-card-muted); font: 400 var(--text-s)/1.5 var(--font-body); }
.pattern-listing-card__footer { margin-block-start: var(--space-3xs); }
.pattern-listing-card__price { font: 400 var(--text-s)/1.2 var(--font-body); }
.pattern-listing-card__price strong { font-size: var(--text-m); }

.pattern-listing-card__action {
  display: inline-flex;
  min-block-size: 2.75rem;
  padding-inline: var(--space-l);
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  color: var(--semantic-surface);
  background: var(--listing-card-accent);
  font: 700 var(--text-s)/1 var(--font-body);
  text-decoration: none;
}

.pattern-listing-card__action:focus-visible { outline: 3px solid var(--semantic-focus); outline-offset: 3px; }

.pattern-listing-card[data-density="compact"] {
  --listing-card-padding: var(--space-s);
  --listing-card-gap: var(--space-xs);
  --listing-card-media-ratio: 16 / 10;
}

.pattern-listing-card[data-density="compact"] .pattern-listing-card__meta { display: none; }

.pattern-listing-card[data-media="cover"] {
  --listing-card-color: var(--semantic-surface);
  --listing-card-muted: color-mix(in oklch,var(--semantic-surface) 88%,transparent);
  --listing-card-border: color-mix(in oklch,var(--semantic-surface) 38%,transparent);
  min-block-size: 25rem;
  max-block-size: 31rem;
  aspect-ratio: 1;
  align-content: end;
  border-color: var(--listing-card-border);
  background: var(--semantic-text);
}

.pattern-listing-card[data-media="cover"] .pattern-listing-card__media {
  position: absolute;
  z-index: 0;
  inset: 0;
  aspect-ratio: auto;
}

.pattern-listing-card[data-media="cover"] .pattern-listing-card__media::before {
  position: absolute;
  z-index: 2;
  inset: 38% 0 0;
  background: linear-gradient(to bottom,transparent,color-mix(in oklch,var(--semantic-text) 94%,transparent));
  content: "";
  pointer-events: none;
}

.pattern-listing-card[data-media="cover"] .pattern-listing-card__image--blur {
  position: absolute;
  z-index: 1;
  inset: 0;
  display: block;
  filter: blur(.85rem);
  scale: 1.045;
  clip-path: inset(42% 0 0);
  pointer-events: none;
}

.pattern-listing-card[data-media="cover"] .pattern-listing-card__body {
  align-self: end;
  padding-block-start: var(--space-4xl);
  text-shadow: 0 .08rem .3rem color-mix(in oklch,var(--semantic-text) 50%,transparent);
}

.pattern-listing-card[data-media="cover"] .pattern-listing-card__action {
  color: var(--semantic-text);
  background: var(--semantic-surface);
  text-shadow: none;
}

.pattern-listing-card[data-media="cover"][data-tone="accent"] .pattern-listing-card__action {
  color: var(--semantic-surface);
  background: var(--semantic-action);
}

@container pattern-listing-card (width < 23rem) {
  .pattern-listing-card__body { gap: var(--space-xs); padding-inline: var(--space-s); padding-block-end: var(--space-s); }
  .pattern-listing-card__header,
  .pattern-listing-card__footer { align-items: flex-start; }
  .pattern-listing-card__footer { display: grid; justify-content: stretch; }
  .pattern-listing-card__action { inline-size: 100%; }
  .pattern-listing-card__meta { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .pattern-listing-card__image { transition: none; }
}`;
