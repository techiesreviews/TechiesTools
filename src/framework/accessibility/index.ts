import { deepFreeze, tokenFamilies, type ParseResult, type SelectedValue, type TokenFamily } from "../model/index.ts";
import type { ResolvedFramework } from "../compiler/index.ts";

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

type LinearRgb = readonly [number, number, number];
const thresholdFor = (kind: ContrastCheck["kind"]) => kind === "normal-text" ? 4.5 : 3;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const linearChannel = (value: number) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const parseHex = (value: string): LinearRgb | undefined => {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (!match) return undefined;
  const hex = match[1].length === 3 ? [...match[1]].map((part) => part + part).join("") : match[1];
  return [0, 2, 4].map((offset) => linearChannel(Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)) as unknown as LinearRgb;
};

const parseRgb = (value: string): LinearRgb | undefined => {
  const match = /^rgba?\(\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)\s*[, ]\s*([0-9.]+%?)(?:\s*[/,]\s*(?:1(?:\.0+)?|100%))?\s*\)$/i.exec(value);
  if (!match) return undefined;
  const channel = (raw: string) => clamp(Number.parseFloat(raw) / (raw.endsWith("%") ? 100 : 255));
  return [linearChannel(channel(match[1])), linearChannel(channel(match[2])), linearChannel(channel(match[3]))];
};

const parseOklch = (value: string): LinearRgb | undefined => {
  const match = /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+)\s+([+-]?[0-9.]+)(?:deg)?(?:\s*\/\s*(?:1(?:\.0+)?|100%))?\s*\)$/i.exec(value);
  if (!match) return undefined;
  const lightness = Number.parseFloat(match[1]) / (match[1].endsWith("%") ? 100 : 1);
  const chroma = Number.parseFloat(match[2]);
  const hue = Number.parseFloat(match[3]) * Math.PI / 180;
  if (![lightness, chroma, hue].every(Number.isFinite)) return undefined;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
};

const parseColor = (value: string): LinearRgb | undefined => parseHex(value.trim()) ?? parseRgb(value.trim()) ?? parseOklch(value.trim());
const luminance = (color: LinearRgb) => 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
const contrast = (left: LinearRgb, right: LinearRgb) => {
  const [light, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
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
  for (let index = declarations.length - 1; index >= 0; index -= 1) {
    if (declarations[index].property === property) return declarations[index];
  }
  return undefined;
};

const declarationColor = (framework: ResolvedFramework, elementId: string, location: { rulePath: string; property: string }) => {
  const declaration = declarationAt(framework, elementId, location.rulePath, location.property);
  return declaration?.tokenId ? tokenColor(framework, declaration.tokenId) : declaration?.cssValue ? parseColor(declaration.cssValue) : undefined;
};

const ratingFor = (kind: ContrastCheck["kind"], ratio: number) => {
  if (kind === "normal-text") return ratio >= 7 ? `${ratio.toFixed(2)}:1 · WCAG AAA` : `${ratio.toFixed(2)}:1 · WCAG AA`;
  if (kind === "large-text") return ratio >= 4.5 ? `${ratio.toFixed(2)}:1 · WCAG AAA` : `${ratio.toFixed(2)}:1 · WCAG AA`;
  return `${ratio.toFixed(2)}:1 · WCAG AA`;
};

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
    threshold: thresholdFor(check.kind),
    message: "Contrast can be improved." as const,
    repairs: [],
    reason: "The effective colors could not be measured. Review this declared pair manually before export.",
  }];
  const ratio = contrast(subject, comparison);
  const threshold = thresholdFor(check.kind);
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
    const candidateRatio = contrast(color, endpoint.counterpartColor);
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
      rank: [token.id.startsWith("semantic.") ? 0 : 1, Math.abs(luminance(color) - luminance(endpoint.targetColor)), -candidateRatio, token.id] as const,
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
  const ratio = candidate && comparison ? contrast(candidate, comparison) : 0;
  if (!candidate
    || !comparison
    || !declaration
    || repair.value.kind !== "token"
    || `${repair.value.family}.${repair.value.name}` !== repair.tokenId
    || declaration.tokenId !== repair.basis.targetTokenId
    || comparisonDeclaration?.tokenId !== repair.basis.comparisonTokenId
    || ratio < thresholdFor(repair.checkKind)) {
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
