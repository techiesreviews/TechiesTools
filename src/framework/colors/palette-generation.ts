export type FrameworkOklch = Readonly<{ l: number; c: number; h: number }>;

const fallbackHex = "#2563EB";
const fallbackOklch: FrameworkOklch = { l: .623, c: .214, h: 259.8 };
const colorSuffixes = ["", "-lightest", "-lighter", "-light", "-dark", "-darker", "-darkest"] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export const parseFrameworkHex = (value: unknown) => {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(cleaned)) {
    return `#${cleaned.split("").map((channel) => channel.repeat(2)).join("")}`.toUpperCase();
  }
  return /^[\da-f]{6}$/i.test(cleaned) ? `#${cleaned}`.toUpperCase() : null;
};

export const normalizeFrameworkHex = (value: unknown, fallback = fallbackHex) =>
  parseFrameworkHex(value) ?? fallback;

export const parseFrameworkOklch = (value: string): FrameworkOklch => {
  const match = value.trim().match(/^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([+-]?[\d.]+)(?:deg)?(?:\s*\/\s*[\d.]+%?)?\s*\)$/i);
  if (!match) return fallbackOklch;
  const lightness = Number(match[1]) / (match[2] ? 100 : Number(match[1]) > 1 ? 100 : 1);
  const chroma = Number(match[3]);
  const hue = Number(match[4]);
  if (![lightness, chroma, hue].every(Number.isFinite)) return fallbackOklch;
  return {
    l: clamp(lightness),
    c: Math.max(0, chroma),
    h: ((hue % 360) + 360) % 360,
  };
};

export const formatFrameworkOklch = ({ l, c, h }: FrameworkOklch) =>
  `oklch(${Number((l * 100).toFixed(1))}% ${Number(c.toFixed(3))} ${Number(h.toFixed(1))})`;

export const frameworkHexToOklch = (source: string) => {
  const hex = normalizeFrameworkHex(source);
  const cleaned = hex.slice(1);
  const rgb = [0, 2, 4]
    .map((offset) => Number.parseInt(cleaned.slice(offset, offset + 2), 16) / 255)
    .map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const l = .4122214708 * rgb[0] + .5363325363 * rgb[1] + .0514459929 * rgb[2];
  const m = .2119034982 * rgb[0] + .6806995451 * rgb[1] + .1073969566 * rgb[2];
  const s = .0883024619 * rgb[0] + .2817188376 * rgb[1] + .6299787005 * rgb[2];
  const l3 = Math.cbrt(l);
  const m3 = Math.cbrt(m);
  const s3 = Math.cbrt(s);
  const L = .2104542553 * l3 + .793617785 * m3 - .0040720468 * s3;
  const a = 1.9779984951 * l3 - 2.428592205 * m3 + .4505937099 * s3;
  const b = .0259040371 * l3 + .7827717662 * m3 - .808675766 * s3;
  return formatFrameworkOklch({ l: L, c: Math.hypot(a, b), h: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 });
};

export const frameworkOklchToHex = (source: string) => {
  const { l: lightness, c: chroma, h } = parseFrameworkOklch(source);
  const hue = h * Math.PI / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + .3963377774 * a + .2158037573 * b) ** 3;
  const m = (lightness - .1055613458 * a - .0638541728 * b) ** 3;
  const s = (lightness - .0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + .2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - .3413193965 * s,
    -.0041960863 * l - .7034186147 * m + 1.707614701 * s,
  ];
  const channel = (value: number) => {
    const bounded = clamp(value);
    const encoded = bounded <= .0031308 ? 12.92 * bounded : 1.055 * bounded ** (1 / 2.4) - .055;
    return Math.round(clamp(encoded) * 255).toString(16).padStart(2, "0");
  };
  return `#${linear.map(channel).join("")}`.toUpperCase();
};

export const frameworkScaleFor = (value: string): readonly string[] => {
  const color = parseFrameworkOklch(value);
  const levels = [.98893, .953806, .88274, color.l, color.l * .74, color.l * .5, color.l * .28];
  const referenceChromaFactors = [.01614, .08723, .22364];
  const referenceHueOffsets = [12.90372, 12.56369, 11.79823];
  return levels.map((lightness, index) => {
    if (index < 3) return formatFrameworkOklch({
      l: lightness,
      c: color.c * referenceChromaFactors[index],
      h: (color.h + referenceHueOffsets[index]) % 360,
    });
    const chromaFactor = Math.min(1, Math.max(.18, 1 - Math.abs(lightness - .55) / .55));
    return formatFrameworkOklch({ l: lightness, c: color.c * chromaFactor, h: color.h });
  });
};

export const frameworkTokenSlug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "token";

export const frameworkColorSlug = (value: string) =>
  frameworkTokenSlug(value).replace(/^color-/, "").replace(/-color$/, "") || "token";

export const resolveFrameworkColorConvention = ({
  requested,
  colorNames,
  typeName = "text",
  radiusName = "radius",
  spacingName = "space",
}: {
  requested: string;
  colorNames: readonly string[];
  typeName?: string;
  radiusName?: string;
  spacingName?: string;
}) => {
  const requestedConvention = frameworkTokenSlug(requested || "color");
  const slugs = colorNames.map(frameworkColorSlug);
  const systemTokens = [
    [typeName, ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"]],
    [radiusName, ["xs", "s", "m", "l", "xl", "full"]],
    [spacingName, ["4xs", "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"]],
  ].flatMap(([name, tokens]) => (tokens as string[]).map((token) => `--${frameworkTokenSlug(name as string)}-${token}`));
  const collides = (convention: string) => slugs
    .flatMap((name) => colorSuffixes.map((suffix) => `--${convention}-${name}${suffix}`))
    .some((token) => systemTokens.includes(token));
  let convention = requestedConvention;
  let suffix = 0;
  while (collides(convention)) convention = `${requestedConvention}-color${++suffix > 1 ? `-${suffix}` : ""}`;
  return { requested: requestedConvention, convention, hasCollision: convention !== requestedConvention } as const;
};
