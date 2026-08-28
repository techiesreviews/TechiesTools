import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  FRAMEWORK_SITE_THEME_STORAGE_KEY,
  frameworkSiteTheme,
  parseFrameworkSiteTheme,
} from "../src/framework/site-theme/index.ts";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("compiled Primitive IDs bridge custom namespaces to stable site aliases", () => {
  const tokens = [
    { id: "color.primary", cssName: "--brand-primary", value: "#7c3aed", type: "color" },
    { id: "semantic.action", cssName: "--role-action", value: "var(--brand-primary)", resolvedValue: "#7c3aed", type: "color" },
    { id: "semantic.surface", cssName: "--role-surface", value: "#fff", type: "color" },
    { id: "typography.family-body", cssName: "--type-family-body", value: "'Inter', system-ui, sans-serif", type: "string" },
    { id: "typography.m", cssName: "--type-m", value: "clamp(1rem, calc(0.9rem + 0.5vw), 1.125rem)", type: "dimension" },
    { id: "spacing.m", cssName: "--rhythm-m", value: "clamp(1rem, calc(0.9rem + 0.5vw), 1.25rem)", type: "dimension" },
    { id: "radius.m", cssName: "--curve-m", value: "0.75rem", type: "dimension" },
  ];
  const css = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");';
  const theme = frameworkSiteTheme(tokens, "abc123", css);

  assert.equal(theme.variables["--brand-primary"], "#7c3aed");
  assert.equal(theme.variables["--role-action"], "var(--brand-primary)");
  assert.equal(theme.variables["--semantic-action"], "var(--brand-primary)");
  assert.equal(theme.variables["--semantic-surface"], "#fff");
  assert.equal(theme.variables["--font-body"], "'Inter', system-ui, sans-serif");
  assert.equal(theme.variables["--text-m"], tokens[4].value);
  assert.equal(theme.variables["--space-m"], tokens[5].value);
  assert.equal(theme.variables["--radius-m"], "0.75rem");
  assert.match(theme.fontStylesheet, /^https:\/\/fonts\.googleapis\.com\/css2\?/);
});

test("persisted site themes reject unsafe variables and font origins", () => {
  const parsed = parseFrameworkSiteTheme(JSON.stringify({
    version: 1,
    contentHash: "safe",
    variables: {
      "--semantic-action": "#2563eb",
      "--bad;name": "red",
      "--semantic-text": "red; background:url(https://example.com)",
    },
    fontStylesheet: "https://example.com/font.css",
  }));

  assert.deepEqual(parsed?.variables, { "--semantic-action": "#2563eb" });
  assert.equal(parsed?.fontStylesheet, undefined);
  assert.equal(FRAMEWORK_SITE_THEME_STORAGE_KEY, "techies-tools:framework:site-theme:v1");
  assert.equal(parseFrameworkSiteTheme("not-json"), null);
});

test("every Main-menu route loads and persists the compiled Framework site theme", () => {
  const mainMenu = read("src", "components", "dashboard", "AppSidebar.astro");
  const frameworkController = read("src", "framework", "controller", "browser.ts");
  const themeController = read("src", "framework", "site-theme", "browser.ts");
  const bootstrap = read("src", "components", "dashboard", "FrameworkSiteThemeBootstrap.astro");
  const routes = [
    read("src", "pages", "framework", "[page].astro"),
    read("src", "pages", "tools", "glass-card.astro"),
    read("src", "pages", "patterns.astro"),
    read("src", "pages", "patterns", "[pattern].astro"),
    read("src", "pages", "changelog.astro"),
  ];

  assert.match(mainMenu, /framework\/site-theme\/browser\.ts/);
  assert.match(frameworkController, /frameworkSiteTheme\(compilation\.resolved\.primitives/);
  assert.match(frameworkController, /framework-site-theme:update/);
  assert.match(themeController, /localStorage\.getItem\(FRAMEWORK_SITE_THEME_STORAGE_KEY\)/);
  assert.match(themeController, /localStorage\.setItem\(FRAMEWORK_SITE_THEME_STORAGE_KEY/);
  assert.match(themeController, /root\.style\.setProperty\(name, value\)/);
  assert.match(themeController, /data-framework-site-fonts/);
  assert.match(bootstrap, /<script is:inline define:vars=\{\{ storageKey \}\}>/);
  assert.match(bootstrap, /localStorage\.getItem\(storageKey\)/);
  assert.match(bootstrap, /document\.documentElement\.style\.setProperty/);
  assert.match(bootstrap, /data-framework-site-fonts/);
  for (const route of routes) {
    assert.match(route, /import FrameworkSiteThemeBootstrap/);
    const head = route.slice(route.indexOf("<head>"), route.indexOf("</head>"));
    assert.match(head, /<FrameworkSiteThemeBootstrap \/>/);
  }
});

test("Reset stays in a protected sticky recovery header and clears the live theme", () => {
  const settingsBar = read("src", "components", "settings", "SettingsBar.astro");
  const frameworkSettings = read("src", "components", "dashboard", "FrameworkSettingsBar.astro");

  assert.match(frameworkSettings, /data-framework-reset data-settings-recovery/);
  assert.match(frameworkSettings, /framework-site-theme:reset/);
  assert.match(settingsBar, /\.settings-bar__header \{ position:sticky; inset-block-start:0;/);
  assert.match(settingsBar, /\[data-settings-recovery\][\s\S]*background:white; color:oklch\(20% 0\.02 260\); font:700 12px\/1 system-ui/);
  assert.match(settingsBar, /\[data-settings-recovery\]:focus-visible/);
  assert.match(settingsBar, /inline-size:max\(100%,48px\); block-size:max\(100%,48px\)/);
});
