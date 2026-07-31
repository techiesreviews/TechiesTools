import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  defaultGlassCardSettings,
  sanitizeGlassCardSettings,
} from "../src/glass-card/model.ts";
import { compileGlassCard } from "../src/glass-card/compiler.ts";
import { packageGlassCardArtifacts } from "../src/glass-card/package-artifacts.ts";
import {
  parseStoredGlassCardSettings,
  serializeGlassCardSettings,
} from "../src/glass-card/preferences.ts";
import {
  FRAMEWORK_UI_DIFF_STORAGE_KEY,
  loadFrameworkPaletteColors,
  parseFrameworkPaletteColors,
} from "../src/framework/colors/palette-preferences.ts";
import {
  frameworkHexToOklch,
  frameworkOklchToHex,
  frameworkScaleFor,
} from "../src/framework/colors/palette-generation.ts";
import { primitiveTokensFromSnapshot } from "../src/framework/compiler/index.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");
const zipEntries = (bytes) => {
  const entries = new Map();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const contentStart = nameStart + nameLength + extraLength;
    const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    entries.set(name, decoder.decode(bytes.subarray(contentStart, contentStart + size)));
    offset = contentStart + size;
  }
  return entries;
};

test("glass-card settings preserve external light positions while clamping unsafe values", () => {
  const settings = sanitizeGlassCardSettings({
    lightX: -25,
    lightY: 125,
    blur: -5,
    surfaceOpacity: 2,
    lightColor: "not-a-color",
  });

  assert.equal(settings.lightX, -25);
  assert.equal(settings.lightY, 125);
  assert.equal(settings.blur, 0);
  assert.equal(settings.surfaceOpacity, 1);
  assert.equal(settings.lightColor, defaultGlassCardSettings.lightColor);
  assert.equal(sanitizeGlassCardSettings({ scene: "grid" }).scene, "grid");
  assert.equal(sanitizeGlassCardSettings({ scene: "invalid" }).scene, defaultGlassCardSettings.scene);
});

test("glass-card compilation keeps Preview variables and portable artifacts synchronized", () => {
  const compilation = compileGlassCard({
    ...defaultGlassCardSettings,
    lightX: -25,
    lightY: 125,
    lightColor: "#3366ff",
    glowTravel: 0.7,
  });

  assert.equal(compilation.variables["--glass-light-x"], "-25%");
  assert.equal(compilation.variables["--glass-light-y"], "125%");
  assert.equal(compilation.variables["--glass-light-rgb"], "51 102 255");
  assert.equal(compilation.variables["--glass-glow-x"], "-52.5%");
  assert.equal(compilation.variables["--glass-glow-y"], "52.5%");
  assert.match(compilation.css, /\.glass-glow-card__edge/);
  assert.match(compilation.html, /aria-hidden="true"/);
  assert.match(compilation.standaloneHtml, /<!doctype html>/i);
  assert.doesNotMatch(compilation.css, /tailwind|drop-shadow\([^)]*%|\/\s*2|\/\s*5/);
});

test("glass-card Download all packages the exact current three artifacts deterministically", () => {
  const compilation = compileGlassCard({ lightColor: "#C2410B", blur: 31 });
  const first = packageGlassCardArtifacts(compilation);
  const second = packageGlassCardArtifacts(compilation);

  assert.equal(first.name, "glass-card.zip");
  assert.equal(first.mimeType, "application/zip");
  assert.deepEqual(first.value, second.value);
  assert.deepEqual(
    [...zipEntries(first.value)],
    [
      ["glass-card.css", compilation.css],
      ["glass-card.html", compilation.html],
      ["glass-card-standalone.html", compilation.standaloneHtml],
    ],
  );
});

test("glass-card preferences restore validated versioned settings", () => {
  const source = serializeGlassCardSettings({ ...defaultGlassCardSettings, lightX: 140, scene: "image" });
  assert.equal(parseStoredGlassCardSettings(source).lightX, 140);
  assert.equal(parseStoredGlassCardSettings(source).scene, "image");
  assert.deepEqual(parseStoredGlassCardSettings('{"version":99}'), defaultGlassCardSettings);
  assert.deepEqual(parseStoredGlassCardSettings("not-json"), defaultGlassCardSettings);
});

test("Framework palette shortcuts expose every generated variable color from current preferences", () => {
  const ocean = parseFrameworkPaletteColors(JSON.stringify({
    version: 1,
    controls: { "data-color-convention": "brand" },
    colors: [
      { name: " Ocean ", hex: "#0af" },
      { name: "Unsafe", hex: "not-a-color" },
      { name: "", hex: "#123456" },
    ],
  }));
  assert.equal(ocean.length, 7);
  assert.deepEqual(ocean.map((color) => color.variable), [
    "--brand-ocean-lightest",
    "--brand-ocean-lighter",
    "--brand-ocean-light",
    "--brand-ocean",
    "--brand-ocean-dark",
    "--brand-ocean-darker",
    "--brand-ocean-darkest",
  ]);
  assert.equal(ocean[3]?.name, "Ocean / Base");
  assert.equal(ocean[3]?.value, "#00AAFF");
  assert.ok(ocean.every((color) => /^#[\dA-F]{6}$/.test(color.value)));

  const storage = {
    getItem: (key) => key === FRAMEWORK_UI_DIFF_STORAGE_KEY
      ? JSON.stringify({ version: 1, colors: [{ name: "Ember", hex: "#C2410C" }] })
      : null,
  };
  const ember = loadFrameworkPaletteColors(storage);
  assert.equal(ember.length, 7);
  assert.equal(ember[3]?.variable, "--color-ember");
  const emberValue = frameworkHexToOklch("#C2410C");
  const compilerColors = primitiveTokensFromSnapshot({ colors: [{
    name: "Ember",
    value: emberValue,
    scale: frameworkScaleFor(emberValue),
    variable: "--color-ember",
  }] }).filter((token) => token.id.startsWith("color."));
  assert.deepEqual(
    Object.fromEntries(ember.map((color) => [color.variable, color.value])),
    Object.fromEntries(compilerColors.map((token) => [token.cssName, frameworkOklchToHex(token.value)])),
  );
  const conventionOnly = parseFrameworkPaletteColors(JSON.stringify({
    version: 1,
    controls: { "data-color-convention": "brand" },
  }));
  assert.equal(conventionOnly[0]?.variable, "--brand-primary-lightest");
  const collisionWithEmptyStoredTypeName = parseFrameworkPaletteColors(JSON.stringify({
    version: 1,
    controls: {
      "data-color-convention": "text",
      "data-type-name": "",
    },
    colors: [{ name: "m", hex: "#000000" }],
  }));
  assert.equal(collisionWithEmptyStoredTypeName[3]?.variable, "--text-color-m");
  const longName = "A".repeat(81);
  assert.equal(
    parseFrameworkPaletteColors(JSON.stringify({
      version: 1,
      colors: [{ name: longName, hex: "#123456" }],
    }))[3]?.variable,
    `--color-${longName.toLowerCase()}`,
  );
  const manyColors = Array.from({ length: 65 }, (_, index) => ({
    name: `Color ${index + 1}`,
    hex: "#123456",
  }));
  const manyChoices = parseFrameworkPaletteColors(JSON.stringify({ version: 1, colors: manyColors }));
  assert.equal(manyChoices.length, 65 * 7);
  assert.equal(manyChoices.at(-1)?.variable, "--color-65-darkest");
  assert.equal(parseFrameworkPaletteColors(null).length, 7);
  assert.equal(parseFrameworkPaletteColors('{"version":2}').length, 7);
});

test("glass-card route uses the shared application shell and canonical Main menu selection", () => {
  const appShell = read("src", "components", "dashboard", "AppShell.astro");
  const dashboardShell = read("src", "components", "dashboard", "DashboardShell.astro");
  const page = read("src", "pages", "tools", "glass-card.astro");
  const sidebar = read("src", "components", "dashboard", "AppSidebar.astro");
  const settings = read("src", "components", "glass-card", "GlassCardSettingsBar.astro");
  const preview = read("src", "components", "glass-card", "GlassCardPreview.astro");
  const compiler = read("src", "glass-card", "compiler.ts");

  assert.match(appShell, /<slot name="settings"\s*\/>/);
  assert.match(appShell, /<main[^>]+data-preview-scope/);
  assert.match(dashboardShell, /<AppShell[^>]+previewScope="framework"/);
  assert.match(page, /<AppShell[^>]+previewScope="glass-card"/);
  assert.match(page, /<GlassCardSettingsBar slot="settings"/);
  assert.match(sidebar, /href="\/tools\/glass-card"/);
  assert.match(sidebar, /currentPath\.startsWith\("\/framework\/"\)/);
  assert.match(sidebar, /currentPath === "\/tools\/glass-card"/);
  assert.match(sidebar, /label="Glass card"/);
  assert.match(settings, /title="Glass card" ariaLabel="Glass card settings"/);
  assert.match(preview, /ariaLabel="Glass card Preview"/);
  assert.match(preview, /aria-label="Glass card canvas"/);
  assert.match(compiler, /<title>Glass card<\/title>/);
  assert.doesNotMatch(`${sidebar}\n${settings}\n${preview}\n${compiler}`, /Glass glow/i);
});

test("glass-card UI keeps parameters and export in the Settings bar while Preview supports direct input", () => {
  const settings = read("src", "components", "glass-card", "GlassCardSettingsBar.astro");
  const preview = read("src", "components", "glass-card", "GlassCardPreview.astro");
  const exportDialog = read("src", "components", "glass-card", "GlassCardExportDialog.astro");
  const browser = read("src", "glass-card", "controller", "browser.ts");

  for (const section of ["Preview", "Light", "Glass", "Reflection", "Ambient glow"]) {
    assert.match(settings, new RegExp(`<SettingsAccordion[^>]+title="${section}"`, "i"));
  }
  for (const setting of ["lightX", "lightY", "lightColor", "blur", "surfaceOpacity", "radius", "glareIntensity", "glareSize", "edgeWidth", "edgeIntensity", "edgeSpread", "glowBlur", "glowIntensity", "glowSize", "glowTravel"]) {
    assert.match(settings, new RegExp(`name="${setting}"`));
  }
  assert.match(settings, /dataAttribute="data-glass-setting"/);
  assert.match(settings, /outputDataAttribute="data-glass-output"/);
  assert.match(settings, /<GlassCardExportDialog slot="footer"/);
  assert.match(preview, /class="glass-glow-card__ambient"/);
  assert.match(preview, /class="glass-glow-card__edge"/);
  assert.match(preview, /data-glass-light-handle/);
  assert.equal(preview.match(/data-glass-card-style/g)?.length, 2);
  assert.match(settings, /data-glass-scene/);
  assert.match(settings, /frameworkPalette/);
  assert.match(browser, /setPointerCapture/);
  assert.match(browser, /getBoundingClientRect/);
  assert.match(browser, /pointercancel/);
  assert.match(browser, /requestAnimationFrame/);
  assert.match(browser, /querySelectorAll<HTMLElement>\("\[data-glass-card-style\]"\)/);
  assert.match(browser, /GLASS_CARD_STORAGE_KEY/);
  assert.match(exportDialog, /copyDataAttribute="data-glass-export-copy"/);
  assert.match(exportDialog, /saveDataAttribute="data-glass-export-save"/);
  assert.match(exportDialog, /value: "standaloneHtml"/);
  assert.match(exportDialog, /downloadAllDataAttribute="data-glass-export-all"/);
  assert.match(browser, /import \{ packageGlassCardArtifacts \} from "\.\.\/package-artifacts\.ts"/);
  assert.match(browser, /querySelectorAll<HTMLButtonElement>\("\[data-glass-export-copy\]"\)/);
  assert.match(browser, /querySelectorAll<HTMLButtonElement>\("\[data-glass-export-save\]"\)/);
  assert.match(browser, /querySelector<HTMLButtonElement>\("\[data-glass-export-all\]"\)/);
  assert.match(browser, /button\.dataset\.glassExportCopy as ArtifactName/);
  assert.match(browser, /button\.dataset\.glassExportSave as ArtifactName/);
  assert.match(browser, /packageGlassCardArtifacts\(compilation\)/);
  assert.match(browser, /flushRender\(\);[\s\S]{0,240}artifact\(requested\)/);
  assert.match(browser, /type DownloadResult = \{ success: true \} \| \{ success: false; message: string \}/);
  assert.match(browser, /const download = \(name: string, type: string, value: string \| ArrayBuffer\): DownloadResult =>/);
  assert.match(browser, /try \{[\s\S]{0,500}link\.hidden = true;\s*document\.body\.append\(link\);\s*link\.click\(\);\s*return \{ success: true \}/);
  assert.match(browser, /catch \(error\) \{\s*return \{ success: false, message:/);
  assert.match(browser, /finally \{[\s\S]{0,300}window\.setTimeout\(\(\) => \{[\s\S]{0,160}link\?\.remove\(\);[\s\S]{0,160}URL\.revokeObjectURL\(objectUrl\)/);
  assert.match(browser, /const reportDownload = \(name: string, result: DownloadResult\) =>/);
  assert.match(browser, /reportDownload\(\s*artifactLabels\[requested\],\s*download\(/);
  assert.match(browser, /try \{\s*const packaged = packageGlassCardArtifacts\(compilation\);[\s\S]{0,240}reportDownload\(\s*packaged\.name,\s*download\(/);
  assert.match(browser, /catch \(error\) \{\s*setStatus\(`Could not start download for glass-card\.zip\./);
  assert.doesNotMatch(browser, /data-glass-copy-active|data-glass-download-html|glass-glow-card\.html/);
});
