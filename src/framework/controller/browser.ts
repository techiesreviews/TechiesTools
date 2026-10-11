import { createFrameworkController } from "./index.ts";
import { completionTokensFor } from "./completion-tokens.ts";
import { createLatestTaskScheduler } from "./latest-task.ts";
import { completeRuleDeclaration } from "../element-authoring/index.ts";
import { buildElementCatalog } from "../catalog/index.ts";
import { treatmentModules } from "../treatments/index.ts";
import { packageArtifacts, resolvedColorSwatch, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../starter/index.ts";
import { frameworkSiteTheme } from "../site-theme/index.ts";
import { emitFrameworkEvent, onFrameworkEvent, type PrimitiveUpdate } from "../events.ts";

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
    emitFrameworkEvent("framework-site-theme:update", frameworkSiteTheme(compilation.resolved.primitives, compilation.preview.value.contentHash, compilation.preview.value.fontStylesheet));
  }
  draftStyle.textContent = catalog.elements.filter((element) => element.lifecycle === "Draft").map((element) => controller.draftSpecimen(element.id).css).filter(Boolean).join("\n");
  emitFrameworkEvent("framework-elements:outputs", { preview: compilation.preview, artifacts: compilation.artifacts, identity: compilation.identity, diagnostics: compilation.diagnostics, accessibilityAdvisories: compilation.accessibilityAdvisories });
  emitFrameworkEvent("framework-elements:state", {
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
  });
};
const primitiveUpdates = createLatestTaskScheduler<PrimitiveSnapshot, number>(
  (candidate) => publish(controller.updatePrimitives(candidate, completeSnapshot(baselineSnapshot) ? baselineSnapshot : undefined), "external"),
  (callback) => window.setTimeout(callback, 250),
  (handle) => window.clearTimeout(handle),
);

onFrameworkEvent("framework-preview:update", (detail: PrimitiveUpdate | undefined) => {
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
onFrameworkEvent("framework-elements:edit-rule", (detail) => {
  if (!detail) return;
  primitiveUpdates.flush();
  publish(controller.editRuleDeclarations(detail.elementId, detail.ruleId, detail.source), "edit");
});
onFrameworkEvent("framework-elements:complete", (detail) => {
  const rulePath = detail ? `${detail.elementId}/${detail.ruleId}` : "";
  const items = detail && catalog.rule(rulePath) ? completeRuleDeclaration({
    catalog,
    rulePath,
    source: detail.source,
    offset: detail.offset,
    tokens: completionTokensFor(snapshot, controller.current().resolved.primitives),
  }) : [];
  emitFrameworkEvent("framework-elements:completions", { editorId: detail?.editorId, items });
});
onFrameworkEvent("framework-elements:reset-element", (detail) => {
  const elementId = detail?.elementId;
  if (elementId) {
    primitiveUpdates.flush();
    publish(controller.resetElement(elementId), "reset");
  }
});
onFrameworkEvent("framework-elements:reset-group", (detail) => {
  const groupId = detail?.groupId;
  if (groupId) {
    primitiveUpdates.flush();
    publish(controller.resetGroup(groupId), "reset");
  }
});
onFrameworkEvent("framework-elements:reset-framework", () => {
  primitiveUpdates.flush();
  publish(controller.resetFramework(), "reset");
});
onFrameworkEvent("framework-elements:request-state", (detail) => {
  primitiveUpdates.flush();
  publish(controller.current(), detail?.reason ?? "state");
});
onFrameworkEvent("framework-export:request", () => {
  primitiveUpdates.flush();
  publish(controller.validateForExport());
});
onFrameworkEvent("framework-accessibility:accept", (detail) => {
  const repair = detail?.repair;
  if (!repair) return;
  primitiveUpdates.flush();
  const compilation = controller.acceptAccessibilityRepair(repair);
  publish(compilation, "accessibility-repair");
  emitFrameworkEvent(compilation.accessibilityAdvisories.some((advisory) => advisory.id === repair.checkId)
    ? "framework-accessibility:failed"
    : "framework-accessibility:accepted");
});
onFrameworkEvent("framework-export:package", () => {
  primitiveUpdates.flush();
  const compilation = controller.validateForExport();
  publish(compilation);
  if (Object.values(compilation.artifacts).some((artifact) => !artifact.available)) return;
  try {
    emitFrameworkEvent("framework-export:package-ready", packageArtifacts(compilation.artifacts));
  } catch (error) {
    emitFrameworkEvent("framework-export:package-failed", { message: error instanceof Error ? error.message : "The package could not be created." });
  }
});

publish(controller.current(), "initial");
window.setTimeout(() => emitFrameworkEvent("framework-primitives:request-baseline"), 0);
