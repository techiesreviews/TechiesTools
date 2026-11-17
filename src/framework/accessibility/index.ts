import { deepFreeze, tokenFamilies, type ParseResult, type SelectedValue, type TokenFamily } from "../model/index.ts";
import type { ResolvedFramework } from "../compiler/index.ts";
import { effectiveDeclarationIndex } from "../css-declarations/index.ts";
import { contrastBetween, contrastThreshold, gradeContrast, parseColor, relativeLuminance, type LinearRgb } from "../colors/contrast.ts";

export type ContrastCheck = {
  id: string;
  elementId: string;
  kind: "normal-text" | "large-text" | "non-text-ui";
  subject: { rulePath: string; property: string; editable: boolean; compatibleTokenIds: readonly string[] };
  comparison: { rulePath: string; property: string; editable: boolean; compatibleTokenIds: readonly string[] };
};

export type AccessibilityRepair = {
  id: string;
  checkId: string;
  checkKind: ContrastCheck["kind"];
  elementId: string;
  rulePath: string;
  property: string;
  value: SelectedValue;
  tokenId: string;
  ratio: number;
  rating: string;
  comparison: { rulePath: string; property: string };
  basis: { targetTokenId?: string; comparisonTokenId?: string };
};

export type ContrastAdvisory = {
  id: string;
  elementId: string;
  ratio: number | null;
  threshold: number;
  message: "Contrast can be improved.";
  repairs: readonly AccessibilityRepair[];
  reason?: string;
};

const tokenColor = (framework: ResolvedFramework, tokenId: string, seen = new Set<string>()): LinearRgb | undefined => {
  if (seen.has(tokenId)) return undefined;
  seen.add(tokenId);
  const token = framework.primitives.find((item) => item.id === tokenId && item.type === "color");
  if (!token) return undefined;
  const value = token.resolvedValue ?? token.value;
  const variable = /^var\((--[a-z0-9-]+)\)$/i.exec(value)?.[1];
  if (variable) {
    const referenced = framework.primitives.find((item) => item.cssName === variable);
    return referenced ? tokenColor(framework, referenced.id, seen) : undefined;
  }
  return parseColor(value);
};

const declarationAt = (framework: ResolvedFramework, elementId: string, rulePath: string, property: string) => {
  const relative = rulePath.slice(elementId.length + 1);
  const declarations = framework.elements.find((item) => item.id === elementId)?.rules.find((item) => item.id === relative)?.declarations;
  if (!declarations) return undefined;
  const index = effectiveDeclarationIndex(declarations, property);
  return index >= 0 ? declarations[index] : undefined;
};

const declarationColor = (framework: ResolvedFramework, elementId: string, location: { rulePath: string; property: string }) => {
  const declaration = declarationAt(framework, elementId, location.rulePath, location.property);
  return declaration?.tokenId ? tokenColor(framework, declaration.tokenId) : declaration?.cssValue ? parseColor(declaration.cssValue) : undefined;
};

const ratingFor = (kind: ContrastCheck["kind"], ratio: number) => `${ratio.toFixed(2)}:1 · WCAG ${gradeContrast(kind, ratio).level}`;

export const evaluateContrastChecks = ({
  framework,
  checks,
}: {
  framework: ResolvedFramework;
  checks: readonly ContrastCheck[];
}): readonly ContrastAdvisory[] => deepFreeze(checks.flatMap<ContrastAdvisory>((check): ContrastAdvisory[] => {
  const subject = declarationColor(framework, check.elementId, check.subject);
  const comparison = declarationColor(framework, check.elementId, check.comparison);
  if (!subject || !comparison) return [{
    id: check.id,
    elementId: check.elementId,
    ratio: null,
    threshold: contrastThreshold(check.kind),
    message: "Contrast can be improved." as const,
    repairs: [],
    reason: "The effective colors could not be measured. Review this declared pair manually before export.",
  }];
  const ratio = contrastBetween(subject, comparison);
  const threshold = contrastThreshold(check.kind);
  if (ratio >= threshold) return [];
  const subjectDeclaration = declarationAt(framework, check.elementId, check.subject.rulePath, check.subject.property);
  const comparisonDeclaration = declarationAt(framework, check.elementId, check.comparison.rulePath, check.comparison.property);
  const endpoints = [
    { target: check.subject, targetColor: subject, targetTokenId: subjectDeclaration?.tokenId, counterpart: check.comparison, counterpartColor: comparison, counterpartTokenId: comparisonDeclaration?.tokenId },
    { target: check.comparison, targetColor: comparison, targetTokenId: comparisonDeclaration?.tokenId, counterpart: check.subject, counterpartColor: subject, counterpartTokenId: subjectDeclaration?.tokenId },
  ].filter((endpoint) => endpoint.target.editable);
  const candidates = endpoints.flatMap((endpoint) => endpoint.target.compatibleTokenIds.flatMap((tokenId) => {
    const token = framework.primitives.find((item) => item.id === tokenId && item.type === "color");
    const color = token && tokenColor(framework, token.id);
    if (!token || !color) return [];
    const candidateRatio = contrastBetween(color, endpoint.counterpartColor);
    if (candidateRatio < threshold) return [];
    const dot = token.id.indexOf(".");
    if (dot < 1) return [];
    const family = token.id.slice(0, dot);
    if (!tokenFamilies.includes(family as TokenFamily)) return [];
    return [{
      id: `${check.id}:${endpoint.target.rulePath}:${endpoint.target.property}:${token.id}`,
      checkId: check.id,
      checkKind: check.kind,
      elementId: check.elementId,
      rulePath: endpoint.target.rulePath,
      property: endpoint.target.property,
      value: { kind: "token" as const, family: family as TokenFamily, name: token.id.slice(dot + 1) },
      tokenId: token.id,
      ratio: candidateRatio,
      rating: ratingFor(check.kind, candidateRatio),
      comparison: { rulePath: endpoint.counterpart.rulePath, property: endpoint.counterpart.property },
      basis: { targetTokenId: endpoint.targetTokenId, comparisonTokenId: endpoint.counterpartTokenId },
      rank: [token.id.startsWith("semantic.") ? 0 : 1, Math.abs(relativeLuminance(color) - relativeLuminance(endpoint.targetColor)), -candidateRatio, token.id] as const,
    }];
  })).sort((left, right) => left.rank[0] - right.rank[0] || left.rank[1] - right.rank[1] || left.rank[2] - right.rank[2] || left.rank[3].localeCompare(right.rank[3]))
    .slice(0, 2)
    .map(({ rank: _rank, ...repair }) => repair as AccessibilityRepair);
  return [{
    id: check.id,
    elementId: check.elementId,
    ratio,
    threshold,
    message: "Contrast can be improved." as const,
    repairs: candidates,
    ...(!candidates.length ? { reason: "No compatible existing Token reaches the required WCAG threshold. Continue unchanged or revise the Token system." } : {}),
  }];
}));

export const prepareAccessibilityRepair = ({
  framework,
  repair,
}: {
  framework: ResolvedFramework;
  repair: AccessibilityRepair;
}): ParseResult<AccessibilityRepair> => {
  const candidate = tokenColor(framework, repair.tokenId);
  const comparison = declarationColor(framework, repair.elementId, repair.comparison);
  const declaration = declarationAt(framework, repair.elementId, repair.rulePath, repair.property);
  const comparisonDeclaration = declarationAt(framework, repair.elementId, repair.comparison.rulePath, repair.comparison.property);
  const ratio = candidate && comparison ? contrastBetween(candidate, comparison) : 0;
  if (!candidate
    || !comparison
    || !declaration
    || repair.value.kind !== "token"
    || `${repair.value.family}.${repair.value.name}` !== repair.tokenId
    || declaration.tokenId !== repair.basis.targetTokenId
    || comparisonDeclaration?.tokenId !== repair.basis.comparisonTokenId
    || ratio < contrastThreshold(repair.checkKind)) {
    return {
      success: false,
      diagnostics: [{
        code: "accessibility.repair-invalid",
        message: "The proposed contrast repair is no longer valid.",
        repair: "Recalculate improvements against the current Framework.",
        channels: ["preview", "elements", "context"],
        elementId: repair.elementId,
        ruleId: repair.rulePath,
        property: repair.property,
        severity: "warning",
        portability: "app-only",
      }],
    };
  }
  return { success: true, data: deepFreeze({ ...repair, ratio, rating: ratingFor(repair.checkKind, ratio) }), diagnostics: [] };
};
