import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8").replaceAll("\r\n", "\n");

test("mobile dashboard exposes the preview through document scrolling", () => {
  const globalCss = read("src", "styles", "global.css");
  const dashboard = read("src", "components", "dashboard", "DashboardShell.astro");
  const globalBreakpoint = globalCss.indexOf("@media (max-width: 720px)");
  const dashboardBreakpoint = dashboard.indexOf("@media (max-width: 720px)");
  assert.ok(globalBreakpoint >= 0 && dashboardBreakpoint >= 0, "mobile dashboard breakpoints must exist");

  const globalMobileCss = globalCss.slice(globalBreakpoint);
  const dashboardMobileCss = dashboard.slice(dashboardBreakpoint);
  assert.match(globalMobileCss, /html,\s*body\s*\{[^}]*overflow:\s*auto;/s);
  assert.match(globalMobileCss, /\.dashboard-shell\s*>\s*\.dashboard-shell__rail\s*\{[^}]*max-block-size:\s*none;/s);
  assert.match(globalMobileCss, /\.dashboard-shell\s*>\s*\.dashboard-shell__main\s*\{[^}]*max-block-size:\s*none;/s);
  assert.match(dashboardMobileCss, /\.dashboard-shell\s*\{[^}]*max-block-size:\s*none;[^}]*overflow:\s*visible;/s);
  assert.match(dashboardMobileCss, /\.dashboard-shell__rail\s*\{[^}]*max-block-size:\s*none;/s);
  assert.match(dashboardMobileCss, /\.dashboard-shell__main\s*\{[^}]*block-size:\s*100dvh;[^}]*max-block-size:\s*none;/s);
});

test("preview page roots include padding inside their available width", () => {
  const designSystem = read("src", "components", "dashboard", "DesignSystemPreview.astro");
  const elements = read("src", "components", "dashboard", "ElementReference.astro");

  assert.match(designSystem, /\.framework-prototype__page\s*\{[^}]*box-sizing:\s*border-box;/s);
  assert.match(elements, /\.element-reference\s*\{[^}]*box-sizing:\s*border-box;/s);
});
