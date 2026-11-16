import { createFrameworkController, type FrameworkController } from "./index.ts";
import { createStartupQueue } from "./startup-queue.ts";
import { createDroppedEdits } from "./dropped-edits.ts";
import { completionTokensFor } from "./completion-tokens.ts";
import { createLatestTaskScheduler } from "./latest-task.ts";
import { completeRuleDeclaration } from "../element-authoring/index.ts";
import { buildElementCatalog } from "../catalog/index.ts";
import { treatmentModules } from "../treatments/index.ts";
import { packageArtifacts, resolvedColorSwatch, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";
import type { AccessibilityRepair } from "../accessibility/index.ts";
import { starterPrimitiveDefaults, starterTokenRegistry } from "../starter/index.ts";
import { frameworkSiteTheme } from "../site-theme/index.ts";
import { hasSavedElementEdits } from "../preferences/index.ts";
import { isCssTreeLoaded, loadCssTree } from "../../shared/css-tree.ts";

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
// The CSS parser loads only when saved Element edits must be parsed at start, or
// when Element CSS is edited, completed, reset or repaired; a code editor's focus
// starts loading it early. Export waits for it only by queueing behind such an edit.
let controller!: FrameworkController;
const { afterStart, begin } = createStartupQueue({
  start: () => {
    controller = createFrameworkController({
      catalog,
      primitiveDefaults: starterPrimitiveDefaults,
      identity: { id: "techies", name: "Techies Framework" },
      sourceRevision: document.documentElement.dataset.sourceRevision || "working-tree",
    });
    publish(controller.current(), "initial");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("framework-primitives:request-baseline")), 0);
  },
  startNeedsParser: hasSavedElementEdits(),
  loadParser: loadCssTree,
  parserLoaded: isCssTreeLoaded,
});
window.addEventListener("focusin", (event) => {
  // An early start only; a failed download is retried and reported by the edit that needs it.
  if (event.target instanceof Element && event.target.closest("[data-code-editor-surface]")) loadCssTree().catch(() => {});
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
  // The delayed update waits behind queued Element edits; a flush inside a handler still applies it in place.
  (callback) => window.setTimeout(afterStart(callback), 250),
  (handle) => window.clearTimeout(handle),
);

window.addEventListener("framework-preview:update", afterStart((event) => {
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
}));
// An edit that a failed CSS parser download dropped is kept, and replayed by the next
// successful edit or export, so export never hands out CSS older than the editor shows.
const droppedEdits = createDroppedEdits();
const applyRuleEdit = (edit: RuleEdit) => {
  droppedEdits.applied(edit);
  publish(controller.editRuleDeclarations(edit.elementId, edit.ruleId, edit.source), "edit");
};
window.addEventListener("framework-elements:edit-rule", afterStart((event) => {
  const detail = (event as CustomEvent<RuleEdit>).detail;
  if (!detail) return;
  primitiveUpdates.flush();
  droppedEdits.pending().forEach(applyRuleEdit);
  applyRuleEdit(detail);
}, true, (event) => {
  const detail = (event as CustomEvent<RuleEdit>).detail;
  if (detail) droppedEdits.keep(detail);
}));
window.addEventListener("framework-elements:complete", afterStart((event) => {
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
}, true));
window.addEventListener("framework-elements:reset-element", afterStart((event) => {
  const elementId = (event as CustomEvent<{ elementId: string }>).detail?.elementId;
  if (elementId) {
    primitiveUpdates.flush();
    droppedEdits.forgetElements([elementId]);
    publish(controller.resetElement(elementId), "reset");
  }
}, true));
window.addEventListener("framework-elements:reset-group", afterStart((event) => {
  const groupId = (event as CustomEvent<{ groupId?: string }>).detail?.groupId;
  if (groupId) {
    primitiveUpdates.flush();
    droppedEdits.forgetElements(catalog.group(groupId).map((element) => element.id));
    publish(controller.resetGroup(groupId), "reset");
  }
}, true));
window.addEventListener("framework-elements:reset-framework", afterStart(() => {
  primitiveUpdates.flush();
  droppedEdits.clear();
  publish(controller.resetFramework(), "reset");
}, true));
window.addEventListener("framework-elements:request-state", afterStart((event) => {
  primitiveUpdates.flush();
  publish(controller.current(), (event as CustomEvent<{ reason?: string }>).detail?.reason ?? "state");
}));
// Export reads only Element CSS that an earlier start or edit already parsed, so it waits
// for the parser only by queueing behind such an edit, or to replay a dropped edit first.
// While a dropped edit cannot be applied, export reports that instead of older CSS.
const exportWhenCurrent = (run: (event: Event) => void, notCurrent: (event: Event) => void) => {
  const now = afterStart(run, false, notCurrent);
  const afterParser = afterStart(run, true, notCurrent);
  return (event: Event) => (droppedEdits.any() ? afterParser : now)(event);
};
const catchUpDroppedEdits = () => {
  if (droppedEdits.any() && !isCssTreeLoaded()) return false;
  droppedEdits.pending().forEach(applyRuleEdit);
  return true;
};
/** `settled(true)` tells the export dialog its artifacts are current; `false` that they are not. */
const exportSettled = (event: Event, current: boolean) => (event as CustomEvent<{ settled?: (current: boolean) => void } | null>).detail?.settled?.(current);
window.addEventListener("framework-export:request", exportWhenCurrent((event) => {
  let current = false;
  try {
    if (!catchUpDroppedEdits()) return;
    primitiveUpdates.flush();
    publish(controller.validateForExport());
    current = true;
  } finally {
    exportSettled(event, current);
  }
}, (event) => exportSettled(event, false)));
window.addEventListener("framework-accessibility:accept", afterStart((event) => {
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
}, true));
const packageNotCurrent = () => window.dispatchEvent(new CustomEvent("framework-export:package-failed", {
  detail: { message: "Your latest CSS edit is not applied yet. Check your connection and try again." },
}));
window.addEventListener("framework-export:package", exportWhenCurrent(() => {
  if (!catchUpDroppedEdits()) {
    packageNotCurrent();
    return;
  }
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
}, packageNotCurrent));

begin();
