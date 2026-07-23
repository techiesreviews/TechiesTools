import { createFrameworkController } from "./index.ts";
import { completionTokensFor } from "./completion-tokens.ts";
import { completeRuleDeclaration } from "../actions-authoring/index.ts";
import { elementDefinitionSchema, type ElementDefinition } from "../model/index.ts";
import { packageArtifacts, resolvedColorSwatch, type FrameworkCompilation, type PrimitiveSnapshot } from "../compiler/index.ts";

type PrimitiveUpdate = Partial<PrimitiveSnapshot> & { baseline?: boolean };
type RuleEdit = { elementId: string; ruleId: string; source: string };
type CompletionRequest = RuleEdit & { editorId: string; offset: number };

const definitionsNode = document.querySelector<HTMLScriptElement>("[data-actions-definitions]");
const parsedDefinitions = elementDefinitionSchema.array().safeParse(JSON.parse(definitionsNode?.textContent || "[]"));
if (!parsedDefinitions.success) throw new Error("Actions Treatment Definitions failed browser initialization validation.");
const definitions = parsedDefinitions.data as ElementDefinition[];

const starterPrimitives = {
  "semantic.primary": "#1d4ed8",
  "semantic.action": "#2563eb",
  "semantic.surface": "#ffffff",
  "semantic.text": "#111827",
  "semantic.border": "#c7d2fe",
  "semantic.focus": "#2563eb",
  "spacing.3xs": "0.5rem",
  "spacing.s": "0.75rem",
  "typography.m": "1rem",
  "radius.m": "0.5rem",
};
const controller = createFrameworkController({
  definitions,
  primitiveDefaults: starterPrimitives,
  identity: { id: "techies", name: "Techies Framework" },
  sourceRevision: document.documentElement.dataset.sourceRevision || "working-tree",
  contextSchemaVersion: "2",
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
  }
  draftStyle.textContent = ["a", "button"].map((id) => controller.draftSpecimen(id).css).filter(Boolean).join("\n");
  window.dispatchEvent(new CustomEvent("framework-actions:outputs", { detail: { preview: compilation.preview, artifacts: compilation.artifacts, identity: compilation.identity, diagnostics: compilation.diagnostics } }));
  window.dispatchEvent(new CustomEvent("framework-actions:state", {
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

window.addEventListener("framework-preview:update", (event) => {
  const detail = (event as CustomEvent<PrimitiveUpdate>).detail;
  if (!detail) return;
  if (detail.baseline) {
    mergeSnapshot(baselineSnapshot, detail);
    return;
  }
  mergeSnapshot(snapshot, detail);
  if (completeSnapshot(snapshot)) publish(controller.updatePrimitives(snapshot, completeSnapshot(baselineSnapshot) ? baselineSnapshot : undefined), "external");
});
window.addEventListener("framework-actions:edit-rule", (event) => {
  const detail = (event as CustomEvent<RuleEdit>).detail;
  if (!detail) return;
  publish(controller.editRuleDeclarations(detail.elementId, detail.ruleId, detail.source), "edit");
});
window.addEventListener("framework-actions:complete", (event) => {
  const detail = (event as CustomEvent<CompletionRequest>).detail;
  const definition = definitions.find((item) => item.id === detail?.elementId);
  const items = detail && definition ? completeRuleDeclaration({
    definition,
    ruleId: detail.ruleId,
    source: detail.source,
    offset: detail.offset,
    tokens: completionTokensFor(snapshot, controller.current().resolved.primitives),
  }) : [];
  window.dispatchEvent(new CustomEvent("framework-actions:completions", { detail: { editorId: detail?.editorId, items } }));
});
window.addEventListener("framework-actions:reset-element", (event) => {
  const elementId = (event as CustomEvent<{ elementId: string }>).detail?.elementId;
  if (elementId) publish(controller.resetElement(elementId), "reset");
});
window.addEventListener("framework-actions:reset-group", () => publish(controller.resetGroup("Actions"), "reset"));
window.addEventListener("framework-actions:reset-framework", () => publish(controller.resetFramework(), "reset"));
window.addEventListener("framework-actions:request-state", (event) => publish(controller.current(), (event as CustomEvent<{ reason?: string }>).detail?.reason ?? "state"));
window.addEventListener("framework-export:request", () => publish(controller.validateForExport()));
window.addEventListener("framework-export:package", () => {
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
