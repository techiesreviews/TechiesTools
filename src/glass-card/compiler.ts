import { sanitizeGlassCardSettings, type GlassCardSettings } from "./model.ts";

export interface GlassCardCompilation {
  settings: GlassCardSettings;
  variables: Readonly<Record<string, string>>;
  css: string;
  html: string;
  standaloneHtml: string;
}

const formatNumber = (value: number, maximumFractionDigits = 3) =>
  Number(value.toFixed(maximumFractionDigits)).toString();

const hexToRgb = (value: string) => {
  const hex = value.slice(1);
  return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16)).join(" ");
};

const cardMarkup = `<article class="glass-glow-card">
  <span class="glass-glow-card__ambient" aria-hidden="true"></span>
  <span class="glass-glow-card__edge" aria-hidden="true"></span>
  <div class="glass-glow-card__content">
    <header>
      <span class="glass-glow-card__chip" aria-hidden="true"></span>
      <p class="glass-glow-card__eyebrow">Executive member</p>
      <p class="glass-glow-card__number">4412 8890 0012 3456</p>
    </header>
    <footer class="glass-glow-card__footer">
      <span>Alexander Thorne</span>
      <span class="glass-glow-card__mark" aria-hidden="true"><i></i><i></i></span>
    </footer>
  </div>
</article>`;

const componentCss = `.glass-glow-card,
.glass-glow-card * {
  box-sizing: border-box;
}

.glass-glow-card {
  position: relative;
  isolation: isolate;
  inline-size: min(26.25rem, 100%);
  aspect-ratio: 21 / 13;
  border-radius: var(--glass-radius);
  color: #fff;
  background-color: rgb(255 255 255 / var(--glass-surface-opacity));
  background-image:
    radial-gradient(
      circle at var(--glass-light-x) var(--glass-light-y),
      rgb(var(--glass-light-rgb) / var(--glass-glare-intensity)) 0,
      rgb(var(--glass-light-rgb) / 0) var(--glass-glare-size)
    );
  box-shadow: 0 2.5rem 5rem rgb(0 0 0 / 0.4);
  -webkit-backdrop-filter: blur(var(--glass-blur));
  backdrop-filter: blur(var(--glass-blur));
}

.glass-glow-card__ambient,
.glass-glow-card__edge {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.glass-glow-card__ambient {
  z-index: -1;
  background: rgb(var(--glass-light-rgb));
  filter: blur(var(--glass-glow-blur));
  opacity: var(--glass-glow-intensity);
  transform: translate(var(--glass-glow-x), var(--glass-glow-y)) scale(var(--glass-glow-scale));
}

.glass-glow-card__edge {
  z-index: 1;
  padding: var(--glass-edge-width);
  background: radial-gradient(
    circle at var(--glass-light-x) var(--glass-light-y),
    rgb(var(--glass-light-rgb) / var(--glass-edge-intensity)) 0,
    rgb(var(--glass-light-rgb) / var(--glass-edge-mid-intensity)) var(--glass-edge-midpoint),
    rgb(var(--glass-light-rgb) / 0) var(--glass-edge-spread)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.glass-glow-card__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  block-size: 100%;
  padding: clamp(1.25rem, 5vw, 2rem);
  overflow: hidden;
  border-radius: inherit;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.glass-glow-card__chip {
  display: block;
  inline-size: 3rem;
  block-size: 2.25rem;
  margin-block-end: 1.25rem;
  border-radius: 0.375rem;
  background: linear-gradient(135deg, #d4d4d8, #71717a);
  opacity: 0.8;
}

.glass-glow-card__eyebrow,
.glass-glow-card__number {
  margin: 0;
}

.glass-glow-card__eyebrow {
  color: rgb(255 255 255 / 0.6);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.glass-glow-card__number {
  margin-block-start: 0.25rem;
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: 300;
  letter-spacing: 0.1em;
}

.glass-glow-card__footer {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  font-size: 1rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.glass-glow-card__mark {
  display: flex;
}

.glass-glow-card__mark i {
  display: block;
  inline-size: 2rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.8);
}

.glass-glow-card__mark i + i {
  margin-inline-start: -0.75rem;
  background: rgb(255 255 255 / 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .glass-glow-card,
  .glass-glow-card * {
    transition-duration: 0.01ms !important;
  }
}`;

export const compileGlassCard = (input: Partial<GlassCardSettings> = {}): GlassCardCompilation => {
  const settings = sanitizeGlassCardSettings(input);
  const edgeMidIntensity = Math.min(1, settings.edgeIntensity * 0.45);
  const variables = Object.freeze({
    "--glass-light-x": `${formatNumber(settings.lightX)}%`,
    "--glass-light-y": `${formatNumber(settings.lightY)}%`,
    "--glass-light-rgb": hexToRgb(settings.lightColor),
    "--glass-blur": `${formatNumber(settings.blur)}px`,
    "--glass-surface-opacity": formatNumber(settings.surfaceOpacity),
    "--glass-radius": `${formatNumber(settings.radius)}px`,
    "--glass-glare-intensity": formatNumber(settings.glareIntensity),
    "--glass-glare-size": `${formatNumber(settings.glareSize)}%`,
    "--glass-edge-width": `${formatNumber(settings.edgeWidth)}px`,
    "--glass-edge-intensity": formatNumber(settings.edgeIntensity),
    "--glass-edge-mid-intensity": formatNumber(edgeMidIntensity),
    "--glass-edge-midpoint": `${formatNumber(settings.edgeSpread * 0.45)}%`,
    "--glass-edge-spread": `${formatNumber(settings.edgeSpread)}%`,
    "--glass-glow-blur": `${formatNumber(settings.glowBlur)}px`,
    "--glass-glow-intensity": formatNumber(settings.glowIntensity),
    "--glass-glow-scale": formatNumber(settings.glowSize / 100),
    "--glass-glow-x": `${formatNumber((settings.lightX - 50) * settings.glowTravel)}%`,
    "--glass-glow-y": `${formatNumber((settings.lightY - 50) * settings.glowTravel)}%`,
  });
  const variableSource = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`).join("\n");
  const css = `.glass-glow-card {\n${variableSource}\n}\n\n${componentCss}`;
  const standaloneHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Glass card</title>
  <style>
    body {
      display: grid;
      min-block-size: 100vh;
      place-items: center;
      overflow: hidden;
      margin: 0;
      padding: 2rem;
      background:
        radial-gradient(circle at 15% 15%, #3b82f6 0, transparent 38%),
        radial-gradient(circle at 82% 78%, #8b5cf6 0, transparent 42%),
        #0a0a0c;
    }

${css.split("\n").map((line) => `    ${line}`).join("\n")}
  </style>
</head>
<body>
${cardMarkup.split("\n").map((line) => `  ${line}`).join("\n")}
</body>
</html>`;

  return Object.freeze({ settings, variables, css, html: cardMarkup, standaloneHtml });
};
