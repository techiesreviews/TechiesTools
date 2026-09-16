/** Shared, opt-in defaults. The same bytes drive utilities.css and Pattern previews. */
export const utilityCss = `:where([class*="_component"], [class*="_component"] *, [class*="_component"] *::before, [class*="_component"] *::after) {
  box-sizing: border-box;
}

.section {
  position: relative;
  inline-size: 100%;
  font-family: var(--font-body);
}

.container {
  inline-size: 100%;
  max-inline-size: 68rem;
  margin-inline: auto;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--space-m);
  inline-size: 100%;
  min-inline-size: 0;
}

.min-inline-zero {
  min-inline-size: 0;
}

.layout-grid {
  --_columns: 1;
  display: grid;
  grid-template-columns: repeat(var(--_columns), minmax(0, 1fr));
  gap: var(--space-xl);
}

.layout-flex {
  display: flex;
  gap: var(--space-s);
}

.image {
  display: block;
  inline-size: 100%;
  block-size: auto;
  object-fit: cover;
}

.heading-style-h2,
.heading-style-h3,
.heading-style-h4 {
  margin: 0;
  font-family: var(--font-heading);
}

.heading-style-h2 {
  font-size: var(--text-2xl);
  line-height: 1.15;
}

.heading-style-h3 {
  font-size: var(--text-xl);
  line-height: 1.2;
}

.heading-style-h4 {
  font-size: var(--text-l);
  line-height: 1.2;
}

.text-style-small {
  margin: 0;
  font: 400 var(--text-s)/1.5 var(--font-body);
}

.list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}`;
