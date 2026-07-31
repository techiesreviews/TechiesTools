import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { generate, parse, walk } from "css-tree";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8").replaceAll("\r\n", "\n");
const mobileMedia = "(max-width:720px)";

const astroStyles = (source) => Array.from(
  source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g),
  (match) => match[1],
).join("\n");

const finalDeclarations = (css, selector, media = null) => {
  const declarations = new Map();
  const stylesheet = parse(css, { context: "stylesheet" });

  walk(stylesheet, function visit(node) {
    if (node.type !== "Rule") return;
    const activeMedia = this.atrule?.name === "media"
      ? generate(this.atrule.prelude).replaceAll(/\s/g, "")
      : null;
    if (media === null ? activeMedia !== null : activeMedia !== null && activeMedia !== media) return;

    const normalizedSelector = selector.replaceAll(/\s/g, "");
    const selectors = generate(node.prelude)
      .split(",")
      .map((value) => value.replaceAll(/\s/g, ""));
    if (!selectors.includes(normalizedSelector)) return;

    node.block.children.forEach((child) => {
      if (child.type !== "Declaration") return;
      const current = declarations.get(child.property);
      if (current?.important && !child.important) return;
      declarations.set(child.property, {
        important: child.important,
        value: generate(child.value),
      });
    });
  });

  return Object.fromEntries([...declarations].map(([property, declaration]) => [property, declaration.value]));
};

test("responsive declaration resolution includes unscoped cascade and importance", () => {
  const laterUnscopedOverride = `
    .dashboard-shell { overflow: hidden; }
    @media (max-width: 720px) { .dashboard-shell { overflow: visible; } }
    .dashboard-shell { overflow: hidden; }
  `;
  const earlierImportantOverride = `
    .dashboard-shell { overflow: hidden !important; }
    @media (max-width: 720px) { .dashboard-shell { overflow: visible; } }
  `;

  assert.equal(finalDeclarations(laterUnscopedOverride, ".dashboard-shell", mobileMedia).overflow, "hidden");
  assert.equal(finalDeclarations(earlierImportantOverride, ".dashboard-shell", mobileMedia).overflow, "hidden");
});

test("mobile dashboard exposes the preview through document scrolling", () => {
  const globalCss = read("src", "styles", "global.css");
  const shellSource = read("src", "components", "dashboard", "AppShell.astro");
  const dashboardCss = astroStyles(shellSource);
  const sidebarCss = astroStyles(read("src", "components", "dashboard", "AppSidebar.astro"));

  assert.equal(finalDeclarations(globalCss, "html").overflow, "hidden");
  assert.equal(finalDeclarations(globalCss, "body").overflow, "hidden");
  const htmlMobile = finalDeclarations(globalCss, "html", mobileMedia);
  const bodyMobile = finalDeclarations(globalCss, "body", mobileMedia);
  assert.equal(htmlMobile["overflow-y"], "auto");
  assert.equal(bodyMobile["overflow-y"], "auto");
  assert.equal(htmlMobile.overflow, "hidden");
  assert.equal(bodyMobile.overflow, "hidden");
  assert.equal(htmlMobile["overflow-x"], undefined);
  assert.equal(bodyMobile["overflow-x"], undefined);
  assert.equal(finalDeclarations(globalCss, ".dashboard-shell > .dashboard-shell__rail", mobileMedia)["max-block-size"], "none");
  assert.equal(finalDeclarations(globalCss, ".dashboard-shell > .dashboard-shell__main", mobileMedia)["max-block-size"], "none");

  const dashboardMobile = finalDeclarations(dashboardCss, ".dashboard-shell", mobileMedia);
  assert.equal(dashboardMobile["grid-template-columns"], "1fr");
  assert.equal(dashboardMobile["max-block-size"], "none");
  assert.equal(dashboardMobile.overflow, "visible");
  assert.equal(finalDeclarations(dashboardCss, ".dashboard-shell__rail", mobileMedia)["max-block-size"], "none");
  const mainMobile = finalDeclarations(dashboardCss, ".dashboard-shell__main", mobileMedia);
  assert.equal(mainMobile["block-size"], "100dvh");
  assert.equal(mainMobile.contain, "paint");
  assert.equal(mainMobile["max-block-size"], "none");
  assert.equal(finalDeclarations(sidebarCss, ".app-sidebar__collapse", mobileMedia)["inset-inline-end"], "0");
});

test("preview page roots include padding inside their available width", () => {
  const designSystemCss = astroStyles(read("src", "components", "dashboard", "DesignSystemPreview.astro"));
  const elementsCss = astroStyles(read("src", "components", "dashboard", "ElementReference.astro"));

  assert.equal(finalDeclarations(designSystemCss, ".framework-prototype__page")["box-sizing"], "border-box");
  assert.equal(finalDeclarations(elementsCss, ".element-reference")["box-sizing"], "border-box");
});
