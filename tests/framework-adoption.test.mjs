import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("global tokens publish canonical Techies Starter Framework primitives and semantic roles", () => {
  const tokens = read("src", "styles", "tokens.css");

  for (const variable of [
    "--semantic-primary",
    "--semantic-action",
    "--semantic-surface",
    "--semantic-text",
    "--semantic-border",
    "--semantic-focus",
    "--font-body",
    "--font-heading",
    "--font-code",
    "--text-m",
    "--space-m",
    "--radius-m",
  ]) {
    assert.match(tokens, new RegExp(`${variable}:`));
  }

  assert.match(tokens, /--background:\s*var\(--semantic-surface\)/);
  assert.match(tokens, /--foreground:\s*var\(--semantic-text\)/);
  assert.match(tokens, /--primary:\s*var\(--semantic-action\)/);
  assert.match(tokens, /--ring:\s*var\(--semantic-focus\)/);
});

test("shared application surfaces derive their palette from global Framework aliases", () => {
  const appShell = read("src", "components", "dashboard", "AppShell.astro");
  const sidebarItem = read("src", "components", "dashboard", "SidebarItem.astro");
  const settings = read("src", "components", "settings", "SettingsBar.astro");
  const exportActions = read("src", "components", "settings", "SettingsExportActions.astro");
  const exportDialog = read("src", "components", "settings", "SettingsExportDialog.astro");
  const segmentedControl = read("src", "components", "settings", "SettingsSegmentedControl.astro");
  const preview = read("src", "components", "preview", "PreviewBrowser.astro");
  const changelog = read("src", "pages", "changelog.astro");

  assert.doesNotMatch(appShell, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(sidebarItem, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(settings, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(exportActions, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(exportDialog, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(segmentedControl, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(preview, /#[0-9a-f]{3,8}/i);
  assert.doesNotMatch(changelog, /#[0-9a-f]{3,8}/i);

  assert.match(settings, /--settings-bar-accent:var\(--primary\)/);
  assert.match(preview, /background:\s*var\(--card\)/);
  assert.match(changelog, /var\(--semantic-action\)/);
});

test("every rendered page receives the global Framework token layer", () => {
  for (const page of [
    ["src", "pages", "framework", "[page].astro"],
    ["src", "pages", "tools", "glass-card.astro"],
    ["src", "pages", "changelog.astro"],
    ["src", "pages", "patterns.astro"],
  ]) {
    assert.match(read(...page), /styles\/global\.css/);
  }
});
