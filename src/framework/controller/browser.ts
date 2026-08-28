import { createFrameworkController } from "./index.ts";
import { completionTokensFor } from "./completion-tokens.ts";
import { createLatestTaskScheduler } from "./latest-task.ts";
import { completeRuleDeclaration } from "../element-authoring/index.ts";
import { buildElementCatalog } from "../catalog/index.ts";
import { treatmentModules } from "../treatments/index.ts";
import { packageArtifacts, resolvedColorSwatch, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";
import type { AccessibilityRepair } from "../accessibility/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../starter/index.ts";
import { frameworkSiteTheme } from "../site-theme/index.ts";

type PrimitiveUpdate = Partial<PrimitiveSnapshot> & { baseline?: boolean; deferCompilation?: boolean };
type RuleEdit = { elementId: string; ruleId: string; source: string };
type CompletionRequest = RuleEdit & { editorId: string; offset: number };

const guidanceNode = document.querySelector<HTMLScriptElement>("[data-element-guidance]");
const catalogResult = buildElementCatalog({
  guidance: JSON.parse(guidanceNode?.textContent || "[]"),
  treatments: treatmentModules,
  tokens: starterTokenRegistry,
});
if (!catalogResult.success) throw new Error(`Element Catalog failed browser initialization validation: ${catalogResult.diagnostics.map((item) => item.message).join(" ")}`);
const catalog = catalogResult.data;
const controller = createFrameworkController({
  catalog,
  primitiveDefaults: starterPrimitiveDefaults,
  identity: { id: "techies", name: "Techies Framework" },
  sourceRevision: document.documentElement.dataset.sourceRevision || "working-tree",
});
const style = document.createElement("style");
style.dataset.frameworkTreatmentPreview = "";
document.head.appendChild(style);
const draftStyle = document.createElement("style");
draftStyle.dataset.frameworkDraftTreatmentPreview = "";
document.head.appendChild(draftStyle);
const snapshot: PrimitiveSnapshot = {};
const baselineSnapshot: PrimitiveSnapshot = {};
const mergeSnapshot = (target: PrimitiveSnapshot, detail: PrimitiveUpdate) => {
  if (detail.variables) target.variables = { ...(target.variables ?? {}), ...detail.variables };
  if (detail.colors) target.colors = detail.colors;
  if (detail.semantics) target.semantics = detail.semantics;
  if (detail.type) target.type = detail.type;
  if (detail.radii) target.radii = detail.radii;
  if (detail.spacing) target.spacing = detail.spacing;
};
const completeSnapshot = (value: PrimitiveSnapshot) => Boolean(value.colors && value.semantics && value.type && value.radii && value.spacing);
const publish = (compilation: FrameworkCompilation, reason = "external") => {
  if (compilation.preview.available) {
    style.textContent = compilation.preview.value.css;
    document.documentElement.dataset.frameworkContentHash = compilation.preview.value.contentHash;
    const tokensCss = compilation.artifacts.tokens.available ? compilation.artifacts.tokens.value.value : undefined;
    window.dispatchEvent(new CustomEvent("framework-site-theme:update", {
      detail: frameworkSiteTheme(compilation.resolved.primitives, compilation.preview.value.contentHash, tokensCss),
    }));
  }
  draftStyle.textContent = catalog.elements.filter((element) => element.lifecycle === "Draft").map((element) => controller.draftSpecimen(element.id).css).filter(Boolean).join("\n");
  window.dispatchEvent(new CustomEvent("framework-elements:outputs", { detail: { preview: compilation.preview, artifacts: compilation.artifacts, identity: compilation.identity, diagnostics: compilation.diagnostics, accessibilityAdvisories: compilation.accessibilityAdvisories } }));
  window.dispatchEvent(new CustomEvent("framework-elements:state", {
    detail: {
      elements: compilation.resolved.elements.map((element) => ({
        id: element.id,
        rules: Object.fromEntries(element.rules.map((rule) => [rule.id, Object.fromEntries(rule.declarations.map((declaration) => [declaration.property, declaration.value]))])),
      })),
      sources: Object.fromEntries(compilation.resolved.elements.map((element) => [element.id, Object.fromEntries(element.rules.map((rule) => {
        const source = controller.ruleDeclarationSource(element.id, rule.id);
        return [rule.id, source.success ? source.data : ""];
      }))])),
      tokens: compilation.resolved.primitives
        .filter((token) => ["semantic", "color", "spacing", "typography", "radius"].includes(token.id.split(".")[0]))
        .map(({ id, cssName, value, type }) => ({ id, cssName, value, type, swatch: type === "color" ? resolvedColorSwatch(id, compilation.resolved.primitives) : value })),
      diagnostics: compilation.diagnostics,
      reason,
    },
  }));
};
const primitiveUpdates = createLatestTaskScheduler<PrimitiveSnapshot, number>(
  (candidate) => publish(controller.updatePrimitives(candidate, completeSnapshot(baselineSnapshot) ? baselineSnapshot : undefined), "external"),
  (callback) => window.setTimeout(callback, 250),
  (handle) => window.clearTimeout(handle),
);

window.addEventListener("framework-preview:update", (event) => {
  const detail = (event as CustomEvent<PrimitiveUpdate>).detail;
  if (!detail) return;
  if (detail.baseline) {
    mergeSnapshot(baselineSnapshot, detail);
    return;
  }
  mergeSnapshot(snapshot, detail);
  if (completeSnapshot(snapshot)) {
    primitiveUpdates.schedule(snapshot);
    if (!detail.deferCompilation) primitiveUpdates.flush();
  }
});
window.addEventListener("framework-elements:edit-rule", (event) => {
  const detail = (event as CustomEvent<RuleEdit>).detail;
  if (!detail) return;
  primitiveUpdates.flush();
  publish(controller.editRuleDeclarations(detail.elementId, detail.ruleId, detail.source), "edit");
});
window.addEventListener("framework-elements:complete", (event) => {
  const detail = (event as CustomEvent<CompletionRequest>).detail;
  const rulePath = detail ? `${detail.elementId}/${detail.ruleId}` : "";
  const items = detail && catalog.rule(rulePath) ? completeRuleDeclaration({
    catalog,
    rulePath,
    source: detail.source,
    offset: detail.offset,
    tokens: completionTokensFor(snapshot, controller.current().resolved.primitives),
  }) : [];
  window.dispatchEvent(new CustomEvent("framework-elements:completions", { detail: { editorId: detail?.editorId, items } }));
});
window.addEventListener("framework-elements:reset-element", (event) => {
  const elementId = (event as CustomEvent<{ elementId: string }>).detail?.elementId;
  if (elementId) {
    primitiveUpdates.flush();
    publish(controller.resetElement(elementId), "reset");
  }
});
window.addEventListener("framework-elements:reset-group", (event) => {
  const groupId = (event as CustomEvent<{ groupId?: string }>).detail?.groupId;
  if (groupId) {
    primitiveUpdates.flush();
    publish(controller.resetGroup(groupId), "reset");
  }
});
window.addEventListener("framework-elements:reset-framework", () => {
  primitiveUpdates.flush();
  publish(controller.resetFramework(), "reset");
});
window.addEventListener("framework-elements:request-state", (event) => {
  primitiveUpdates.flush();
  publish(controller.current(), (event as CustomEvent<{ reason?: string }>).detail?.reason ?? "state");
});
window.addEventListener("framework-export:request", () => {
  primitiveUpdates.flush();
  publish(controller.validateForExport());
});
window.addEventListener("framework-accessibility:accept", (event) => {
  const repair = (event as CustomEvent<{ repair?: AccessibilityRepair }>).detail?.repair;
  if (!repair) return;
  primitiveUpdates.flush();
  const compilation = controller.acceptAccessibilityRepair(repair);
  publish(compilation, "accessibility-repair");
  window.dispatchEvent(new CustomEvent(
    compilation.accessibilityAdvisories.some((advisory) => advisory.id === repair.checkId)
      ? "framework-accessibility:failed"
      : "framework-accessibility:accepted",
  ));
});
window.addEventListener("framework-export:package", () => {
  primitiveUpdates.flush();
  const compilation = controller.validateForExport();
  publish(compilation);
  if (Object.values(compilation.artifacts).some((artifact) => !artifact.available)) return;
  try {
    window.dispatchEvent(new CustomEvent("framework-export:package-ready", { detail: packageArtifacts(compilation.artifacts) }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent("framework-export:package-failed", {
      detail: { message: error instanceof Error ? error.message : "The package could not be created." },
    }));
  }
});

publish(controller.current(), "initial");
window.setTimeout(() => window.dispatchEvent(new CustomEvent("framework-primitives:request-baseline")), 0);
