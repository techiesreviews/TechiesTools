import { compileGlassCard, type GlassCardCompilation } from "../compiler.ts";
import { packageGlassCardArtifacts } from "../package-artifacts.ts";
import { connectExportDialog, exportDialogAttributes } from "../../settings/export-dialog.ts";
import { defaultGlassCardSettings, sanitizeGlassCardSettings, type GlassCardSettings } from "../model.ts";
import {
  GLASS_CARD_STORAGE_KEY,
  parseStoredGlassCardSettings,
  serializeGlassCardSettings,
} from "../preferences.ts";

const preview = document.querySelector<HTMLElement>("[data-glass-preview]");
const card = preview?.querySelector<HTMLElement>("[data-glass-card]");
const cardStyles = Array.from(preview?.querySelectorAll<HTMLElement>("[data-glass-card-style]") ?? []);
const handle = preview?.querySelector<HTMLButtonElement>("[data-glass-light-handle]");
const stage = preview?.querySelector<HTMLElement>("[data-glass-stage]");
const settingsRoot = document.querySelector<HTMLElement>("[data-glass-settings]");
const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-glass-setting]"));
const exportStatus = document.querySelector<HTMLElement>("[data-glass-export-status]");

type ArtifactName = "css" | "html" | "standaloneHtml";

let state: GlassCardSettings = { ...defaultGlassCardSettings };
let compilation: GlassCardCompilation = compileGlassCard(state);
let renderFrame = 0;
let activePointer: number | null = null;


try {
  state = parseStoredGlassCardSettings(localStorage.getItem(GLASS_CARD_STORAGE_KEY));
} catch {
  state = { ...defaultGlassCardSettings };
}

const formatOutput = (key: keyof GlassCardSettings, value: GlassCardSettings[keyof GlassCardSettings]) => {
  if (key === "lightColor") return String(value).toUpperCase();
  const number = Number(value);
  const input = inputs.find((item) => item.dataset.glassSetting === key);
  if (input?.dataset.format === "percent") return `${Math.round(number * 100)}%`;
  return `${Number(number.toFixed(2))}${input?.dataset.unit ?? ""}`;
};

const artifact = (name: ArtifactName) => compilation[name];
const artifactLabels: Record<ArtifactName, string> = {
  css: "glass-card.css",
  html: "glass-card.html",
  standaloneHtml: "glass-card-standalone.html",
};
const artifactMimeTypes: Record<ArtifactName, string> = {
  css: "text/css;charset=utf-8",
  html: "text/html;charset=utf-8",
  standaloneHtml: "text/html;charset=utf-8",
};

const render = () => {
  renderFrame = 0;
  compilation = compileGlassCard(state);
  state = compilation.settings;

  for (const cardStyle of cardStyles) {
    for (const [name, value] of Object.entries(compilation.variables)) cardStyle.style.setProperty(name, value);
  }

  for (const input of inputs) {
    const key = input.dataset.glassSetting as keyof GlassCardSettings | undefined;
    if (!key) continue;
    const value = state[key];
    input.value = key === "lightColor" && input.type === "text" ? String(value).toUpperCase() : String(value);
    if (input.type === "range") input.dispatchEvent(new CustomEvent("settings-range:sync"));
  }
  settingsRoot?.querySelectorAll<HTMLElement>("[data-settings-color-field]").forEach((field) => {
    field.dispatchEvent(new CustomEvent("settings-color:sync", { bubbles: true }));
  });

  document.querySelectorAll<HTMLOutputElement>("[data-glass-output]").forEach((output) => {
    const key = output.dataset.glassOutput as keyof GlassCardSettings | undefined;
    if (key) output.value = formatOutput(key, state[key]);
  });

  const lightSummary = document.querySelector<HTMLElement>('[data-glass-summary="light"]');
  const glassSummary = document.querySelector<HTMLElement>('[data-glass-summary="glass"]');
  const reflectionSummary = document.querySelector<HTMLElement>('[data-glass-summary="reflection"]');
  const glowSummary = document.querySelector<HTMLElement>('[data-glass-summary="glow"]');
  const previewSummary = document.querySelector<HTMLElement>('[data-glass-summary="preview"]');
  if (lightSummary) lightSummary.textContent = `${state.lightColor.toUpperCase()} · ${formatOutput("lightX", state.lightX)}, ${formatOutput("lightY", state.lightY)}`;
  if (glassSummary) glassSummary.textContent = `${formatOutput("blur", state.blur)} blur · ${formatOutput("surfaceOpacity", state.surfaceOpacity)} surface`;
  if (reflectionSummary) reflectionSummary.textContent = `${formatOutput("glareIntensity", state.glareIntensity)} glare · ${formatOutput("edgeWidth", state.edgeWidth)} edge`;
  if (glowSummary) glowSummary.textContent = `${formatOutput("glowIntensity", state.glowIntensity)} · ${formatOutput("glowBlur", state.glowBlur)} blur`;
  if (previewSummary) previewSummary.textContent = state.scene[0].toUpperCase() + state.scene.slice(1);
  if (stage) stage.dataset.scene = state.scene;
  settingsRoot?.querySelectorAll<HTMLButtonElement>("[data-glass-scene]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.glassScene === state.scene));
  });

  handle?.setAttribute("aria-label", `Light position: horizontal ${formatOutput("lightX", state.lightX)}, vertical ${formatOutput("lightY", state.lightY)}`);
  exportDialog.refresh();
};

const scheduleRender = () => {
  if (!renderFrame) renderFrame = requestAnimationFrame(render);
};

const flushRender = () => {
  if (renderFrame) cancelAnimationFrame(renderFrame);
  render();
};

const persist = () => {
  try {
    localStorage.setItem(GLASS_CARD_STORAGE_KEY, serializeGlassCardSettings(state));
  } catch {
    // Storage may be unavailable in privacy modes; the current session still works.
  }
};

const updateSetting = (input: HTMLInputElement, commit: boolean) => {
  const key = input.dataset.glassSetting as Exclude<keyof GlassCardSettings, "scene"> | undefined;
  if (!key) return;
  if (key === "lightColor" && !/^#[\da-f]{6}$/i.test(input.value)) return;
  const value = key === "lightColor" ? input.value : Number(input.value);
  state = sanitizeGlassCardSettings({ ...state, [key]: value });
  scheduleRender();
  if (commit) persist();
};

for (const input of inputs) {
  input.addEventListener("input", () => updateSetting(input, false));
  input.addEventListener("change", () => updateSetting(input, true));
  input.addEventListener("blur", flushRender);
}

const updateLightFromPointer = (event: PointerEvent) => {
  if (!card) return;
  const rect = card.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  state = sanitizeGlassCardSettings({
    ...state,
    lightX: ((event.clientX - rect.left) / rect.width) * 100,
    lightY: ((event.clientY - rect.top) / rect.height) * 100,
  });
  scheduleRender();
};

handle?.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary) return;
  activePointer = event.pointerId;
  handle.setPointerCapture(event.pointerId);
  updateLightFromPointer(event);
});

handle?.addEventListener("pointermove", (event) => {
  if (activePointer !== event.pointerId) return;
  updateLightFromPointer(event);
});

const finishPointer = (event: PointerEvent) => {
  if (activePointer !== event.pointerId) return;
  updateLightFromPointer(event);
  if (handle?.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  activePointer = null;
  flushRender();
  persist();
};

const cancelPointer = (event: PointerEvent) => {
  if (activePointer !== event.pointerId) return;
  if (handle?.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  activePointer = null;
  flushRender();
  persist();
};

handle?.addEventListener("pointerup", finishPointer);
handle?.addEventListener("pointercancel", cancelPointer);

handle?.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 10 : 1;
  const offsets: Partial<Record<string, [number, number]>> = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
  };
  const offset = offsets[event.key];
  if (!offset) return;
  event.preventDefault();
  state = sanitizeGlassCardSettings({ ...state, lightX: state.lightX + offset[0], lightY: state.lightY + offset[1] });
  render();
  persist();
});

document.querySelector<HTMLButtonElement>("[data-glass-reset]")?.addEventListener("click", () => {
  state = { ...defaultGlassCardSettings };
  settingsRoot?.querySelectorAll<HTMLElement>("[data-settings-color-field]").forEach((field) => {
    delete field.dataset.settingsColorSelectedVariable;
  });
  render();
  try {
    localStorage.removeItem(GLASS_CARD_STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
});

settingsRoot?.addEventListener("settings-segmented:change", (event) => {
  const detail = (event as CustomEvent<{ name?: string; value?: string }>).detail;
  if (detail.name !== "scene" || !detail.value) return;
  state = sanitizeGlassCardSettings({ ...state, scene: detail.value as GlassCardSettings["scene"] });
  render();
  persist();
});

const exportDialog = connectExportDialog<ArtifactName>({
  root: document,
  attributes: exportDialogAttributes("data-glass-export", { directCopy: "data-glass-copy-css" }),
  initial: "css",
  artifact: (name) => ({ name: artifactLabels[name], mimeType: artifactMimeTypes[name], value: artifact(name) }),
  packageAll: () => packageGlassCardArtifacts(compilation),
  packageName: () => "glass-card.zip",
  directCopyArtifact: () => "css",
  report: (message) => {
    if (exportStatus) exportStatus.textContent = message;
  },
  beforeOpen: flushRender,
  gate: (action) => {
    flushRender();
    void action();
  },
});

render();
