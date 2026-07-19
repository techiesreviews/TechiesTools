import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("Settings bar owns its accessible fixed-region shell", () => {
  const source = read("src", "components", "settings", "SettingsBar.astro");

  assert.match(source, /path:\s*string/);
  assert.match(source, /title:\s*string/);
  assert.match(source, /ariaLabel:\s*string/);
  assert.match(source, /<aside[^>]+class="settings-bar"[^>]+aria-label=\{ariaLabel\}/s);
  assert.match(source, /Astro\.slots\.has\("headerAction"\)/);
  assert.match(source, /<slot name="content"\s*\/>/);
  assert.match(source, /Astro\.slots\.has\("footer"\)/);
  assert.match(source, /data-has-footer=\{hasFooter/);
  assert.match(source, /isolation:isolate/);
  assert.match(source, /grid-template-rows:auto minmax\(0,1fr\)/);
  assert.match(source, /\.settings-bar\[data-has-footer\] \{ grid-template-rows:auto minmax\(0,1fr\) auto; \}/);
  assert.match(source, /settings-bar__header \{ position:relative; z-index:2/);
  assert.match(source, /settings-bar__footer \{ position:relative; z-index:2/);
  assert.match(source, /\.settings-bar:has\(:popover-open\) \.settings-bar__content \{ overflow:hidden; \}/);

  const header = source.indexOf("settings-bar__header");
  const content = source.indexOf("settings-bar__content");
  const footer = source.indexOf("settings-bar__footer");
  assert.ok(header >= 0 && header < content && content < footer);

  assert.equal(source.match(/overflow(?:-block)?:\s*auto/g)?.length, 1);
  for (const variable of ["inline-size", "surface", "border", "text", "muted", "accent"]) {
    assert.match(source, new RegExp(`--settings-bar-${variable}`));
  }
});

test("Framework combobox uses a native anchored Popover overlay", () => {
  const source = read("src", "components", "dashboard", "FrameworkCombobox.prototype.astro");

  assert.match(source, /popover="manual"/);
  assert.match(source, /showPopover\(\)/);
  assert.match(source, /hidePopover\(\)/);
  assert.match(source, /anchor-name:/);
  assert.match(source, /position-anchor:/);
  assert.match(source, /top:anchor\(bottom\)/);
  assert.match(source, /inset:auto/);
  assert.match(source, /width:anchor-size\(width\)/);
  assert.match(source, /position-try-fallbacks:flip-block/);
  assert.doesNotMatch(source, /overlay\.hidden/);
});


test("Framework settings composition retains Framework ownership", () => {
  const source = read("src", "components", "dashboard", "FrameworkSettingsBar.astro");

  assert.match(source, /<SettingsBar path="Tools" title="Framework" ariaLabel="Framework settings">/);
  assert.match(source, /slot="headerAction"[^>]+data-framework-reset/);
  assert.match(source, /<Fragment slot="content">/);
  assert.match(source, /<FrameworkExportDialog slot="footer"\s*\/>/);
  assert.match(source, /techies-tools:framework:v1/);
  assert.match(source, /framework-preview:update/);
  assert.match(source, /framework-export:request/);
  assert.match(source, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(source, /document\.querySelector<HTMLElement>\("\[data-framework-settings\]"\)\?\.closest<HTMLElement>\("\[data-settings-bar\]"\)/);
  assert.match(source, /\.settings-bar \{ --line:var\(--settings-bar-border\); --muted:var\(--settings-bar-muted\); --ink:var\(--settings-bar-text\); --accent:var\(--settings-bar-accent\); \}/);
  assert.doesNotMatch(source, /:global\(\.settings-bar\)/);
});

test("migrated Framework path has no Sidebar compatibility alias", () => {
  assert.equal(existsSync(join(root, "src", "components", "dashboard", "FrameworkSidebar.astro")), false);

  const dashboard = read("src", "components", "dashboard", "DashboardShell.astro");
  const globalCss = read("src", "styles", "global.css");
  assert.match(dashboard, /import FrameworkSettingsBar from "\.\/FrameworkSettingsBar\.astro"/);
  assert.match(dashboard, /<FrameworkSettingsBar\s*\/>/);
  assert.doesNotMatch(`${dashboard}\n${globalCss}`, /FrameworkSidebar|framework-sidebar/);
  assert.match(globalCss, /dashboard-shell__rail > \.dashboard-shell__settings/);
});
