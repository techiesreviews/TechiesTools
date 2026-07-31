import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (...parts) => readFileSync(join(root, ...parts), "utf8");

test("Guided Website keeps its canonical route inside the Framework shell while the unfinished menu entry stays hidden", () => {
  const page = read("src", "pages", "framework", "guided-website.astro");
  const mainMenu = read("src", "components", "dashboard", "AppSidebar.astro");

  assert.match(page, /<DashboardShell>/);
  assert.match(page, /<GuidedWebsiteWorkflow\s*\/>/);
  assert.match(page, /<link rel="canonical" href=\{canonical\}/);
  assert.match(page, /<meta name="description"/);
  assert.doesNotMatch(page, /noindex|prototype/i);
  assert.doesNotMatch(mainMenu, /label="Guided website"/);
  assert.doesNotMatch(mainMenu, /href="\/framework\/guided-website"/);
});

test("Guided Website uses the canonical Settings bar shell and a vertical journey navigator", () => {
  const workflow = read("src", "components", "guided-website", "GuidedWebsiteWorkflow.astro");

  assert.match(workflow, /import SettingsBar from "\.\.\/settings\/SettingsBar\.astro"/);
  assert.match(workflow, /<SettingsBar path="Tools" title="Guided website" ariaLabel="Guided website questions">/);
  assert.match(workflow, /class="guided-journey"/);
  assert.match(workflow, /class="guided-step-list__copy"/);
  assert.match(workflow, /\.guided-step-list \{ display: grid;[\s\S]*grid-template-columns: 1fr;/);
  assert.doesNotMatch(workflow, /grid-template-columns:\s*repeat\(6,\s*1fr\)/);
  assert.doesNotMatch(workflow, /<aside class="guided-panel"/);
});

test("Guided Website promotes the full-page workflow without prototype variants", () => {
  const workflow = read("src", "components", "guided-website", "GuidedWebsiteWorkflow.astro");
  const comparison = read("src", "components", "guided-website", "ComparisonStep.astro");
  const preview = read("src", "components", "guided-website", "GuidedWebsitePreview.astro");
  const productionSurface = `${workflow}\n${comparison}\n${preview}`;

  for (const step of ["project", "composition", "density", "surface", "voice", "review"]) {
    assert.match(workflow, new RegExp(`data-guided-step="${step}"`));
  }
  for (const decision of ["composition", "density", "surface", "voice"]) {
    assert.match(workflow, new RegExp(`data-guided-decision="${decision}"`));
  }
  assert.match(productionSurface, /data-guided-page-choice/);
  assert.match(workflow, /data-guided-skip/);
  assert.match(workflow, /data-guided-download/);
  assert.match(workflow, /aria-live="polite"/);
  assert.equal((workflow.match(/data-guided-project-field="[^"]+" required/g) ?? []).length, 4);
  assert.match(productionSurface, /var\(--semantic-/);
  assert.match(productionSurface, /var\(--space-/);
  assert.doesNotMatch(productionSurface, /prototype-switcher|data-prototype-variant|variant-b|variant-c/i);
  assert.doesNotMatch(productionSurface, /ARC|FORMA|NORTH|Field Notes/);
  assert.match(productionSurface, /Add real proof before publishing/);
  for (const archetype of [
    "Product-led",
    "Editorial-led",
    "Campaign pace",
    "Editorial scan",
    "Quiet canvas",
    "Layered workspace",
    "Utility-first",
    "Expressive campaign",
  ]) {
    assert.match(workflow, new RegExp(archetype));
  }
  assert.match(comparison, /data-guided-reference/);
  assert.match(preview, /guided-preview__artifact/);
});

test("Guided Website records the live reference basis without copying website branding into the previews", () => {
  const decision = read("docs", "adr", "0019-guided-website-uses-full-page-visual-questions.md");
  const preview = read("src", "components", "guided-website", "GuidedWebsitePreview.astro");

  for (const source of ["linear.app", "press.stripe.com", "apple.com", "theverge.com", "mailchimp.com", "gov.uk"]) {
    assert.match(decision, new RegExp(source.replaceAll(".", "\\.")));
  }
  assert.match(decision, /Research snapshot: 2026-07-31/);
  assert.doesNotMatch(preview, /Linear|Stripe|Apple|Verge|Mailchimp|GOV\.UK/);
});

test("density and surface comparisons keep their evidence dimensions controlled", () => {
  const preview = read("src", "components", "guided-website", "GuidedWebsitePreview.astro");
  const densityRules = preview.match(/\.guided-preview--density[\s\S]*?(?=\n\s*\.guided-preview--surface)/)?.[0] ?? "";
  const surfaceRules = preview.match(/\.guided-preview--surface[\s\S]*?(?=\n\s*\.guided-preview--voice)/)?.[0] ?? "";

  assert.ok(densityRules, "density rules must exist");
  assert.doesNotMatch(densityRules, /display:\s*(?:none|grid)/, "density must not add or remove page content");
  assert.doesNotMatch(densityRules, /grid-template-columns/, "density must preserve composition");

  assert.ok(surfaceRules, "surface rules must exist");
  assert.doesNotMatch(surfaceRules, /display:\s*(?:none|grid)/, "surface must not add or remove page content");
  assert.doesNotMatch(surfaceRules, /grid-template-columns|transform:|margin-block/, "surface must preserve composition and spacing");
});

test("Guided Website browser controller persists validated evidence and keeps duplicate choices synchronized", () => {
  const browser = read("src", "guided-website", "browser.ts");

  assert.match(browser, /parseGuidedWebsiteDraft/);
  assert.match(browser, /applyGuidedWebsiteAction/);

  assert.match(browser, /techies-tools:guided-website:v1/);
  assert.match(browser, /input\[data-guided-choice\]/);
  assert.match(browser, /input\[data-guided-decision=/);
  assert.match(browser, /button\.hidden = draft\.currentStep === "review"/);
  assert.match(browser, /button\.disabled = stepIndex > availableIndex/);
  assert.match(browser, /heading\.dataset\.guidedFocus = "true"/);
  assert.match(browser, /framework-elements:outputs/);
  assert.match(browser, /artifacts\.context\.available/);
  assert.match(browser, /frameworkContext = null/);
  assert.match(browser, /compileGuidedWebsiteGenerationContext/);
  assert.match(browser, /guidedWebsiteDecisionLabels\[decision\]\[evidence\.value\]/);
  assert.doesNotMatch(browser, /evidence\.value\.replaceAll/);
  assert.match(browser, /guided-website-context\.md/);
  assert.match(browser, /aria-pressed/);
  assert.match(browser, /URL\.createObjectURL/);
  assert.match(browser, /window\.setTimeout\(\(\) => URL\.revokeObjectURL/);
  assert.match(browser, /localStorage\.setItem/);
});

test("Guided Website responsive layout stacks questions before full-page choices", () => {
  const workflow = read("src", "components", "guided-website", "GuidedWebsiteWorkflow.astro");
  const route = read("src", "pages", "framework", "guided-website.astro");

  assert.match(route, /container: guided-route \/ inline-size/);
  assert.match(workflow, /@container guided-route \(max-width: 62rem\)[\s\S]*\.guided-website \{\s*grid-template-columns: 1fr;/);
  assert.match(workflow, /\.guided-comparison \{[\s\S]*grid-template-columns: 1fr;/);
  assert.match(workflow, /@media \(max-width: 620px\)/);
  assert.match(read("src", "components", "guided-website", "GuidedWebsitePreview.astro"), /container-type: inline-size;[\s\S]*font-size: clamp\([^;]+cqi/);
  assert.doesNotMatch(route, /\.dashboard-shell__rail \{ display: none/);
});
