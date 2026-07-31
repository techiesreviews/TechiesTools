export type GlassCardScene = "mesh" | "grid" | "image";

export interface GlassCardSettings {
  scene: GlassCardScene;
  lightX: number;
  lightY: number;
  lightColor: string;
  blur: number;
  surfaceOpacity: number;
  radius: number;
  glareIntensity: number;
  glareSize: number;
  edgeWidth: number;
  edgeIntensity: number;
  edgeSpread: number;
  glowBlur: number;
  glowIntensity: number;
  glowSize: number;
  glowTravel: number;
}

export const defaultGlassCardSettings: Readonly<GlassCardSettings> = Object.freeze({
  scene: "mesh",
  lightX: 30,
  lightY: 0,
  lightColor: "#ffffff",
  blur: 25,
  surfaceOpacity: 0.12,
  radius: 24,
  glareIntensity: 0.12,
  glareSize: 60,
  edgeWidth: 1.5,
  edgeIntensity: 0.85,
  edgeSpread: 85,
  glowBlur: 94,
  glowIntensity: 0.2,
  glowSize: 65,
  glowTravel: 0.7,
});

const clamp = (value: unknown, minimum: number, maximum: number, fallback: number) => {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
};

const color = (value: unknown, fallback: string) =>
  typeof value === "string" && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : fallback;

const scene = (value: unknown): GlassCardScene =>
  value === "grid" || value === "image" || value === "mesh" ? value : defaultGlassCardSettings.scene;

export const sanitizeGlassCardSettings = (input: Partial<GlassCardSettings> = {}): GlassCardSettings => ({
  scene: scene(input.scene),
  lightX: clamp(input.lightX, -50, 150, defaultGlassCardSettings.lightX),
  lightY: clamp(input.lightY, -50, 150, defaultGlassCardSettings.lightY),
  lightColor: color(input.lightColor, defaultGlassCardSettings.lightColor),
  blur: clamp(input.blur, 0, 100, defaultGlassCardSettings.blur),
  surfaceOpacity: clamp(input.surfaceOpacity, 0, 1, defaultGlassCardSettings.surfaceOpacity),
  radius: clamp(input.radius, 0, 80, defaultGlassCardSettings.radius),
  glareIntensity: clamp(input.glareIntensity, 0, 1, defaultGlassCardSettings.glareIntensity),
  glareSize: clamp(input.glareSize, 10, 180, defaultGlassCardSettings.glareSize),
  edgeWidth: clamp(input.edgeWidth, 0, 6, defaultGlassCardSettings.edgeWidth),
  edgeIntensity: clamp(input.edgeIntensity, 0, 1, defaultGlassCardSettings.edgeIntensity),
  edgeSpread: clamp(input.edgeSpread, 10, 180, defaultGlassCardSettings.edgeSpread),
  glowBlur: clamp(input.glowBlur, 0, 200, defaultGlassCardSettings.glowBlur),
  glowIntensity: clamp(input.glowIntensity, 0, 1, defaultGlassCardSettings.glowIntensity),
  glowSize: clamp(input.glowSize, 10, 150, defaultGlassCardSettings.glowSize),
  glowTravel: clamp(input.glowTravel, 0, 2, defaultGlassCardSettings.glowTravel),
});
