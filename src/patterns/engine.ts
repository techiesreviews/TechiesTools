import { effectiveDeclarationIndex, parseCssDeclarationList } from "../framework/css-declarations/index.ts";
import type { PatternControl, PatternDefinition } from "./definition.ts";

export interface PatternState {
  source: string;
}

export interface PatternCompilation {
  definition: PatternDefinition;
  state: PatternState;
  source: string;
  inlineStyle: string;
  css: string;
  html: string;
}

const declarationsToSource = (declarations: readonly { property: string; value: string; important?: boolean }[]) =>
  declarations.map(({ property, value, important }) => `${property}: ${value}${important ? " !important" : ""};`).join("\n");

const normalizedValue = (property: string, value: string) => {
  const parsed = parseCssDeclarationList(`${property}: ${value};`);
  return parsed.success ? parsed.declarations[0]?.value : undefined;
};

export const defaultPatternState = (definition: PatternDefinition): PatternState => ({ source: definition.defaultCss });

export const sanitizePatternState = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternState => {
  if (typeof input.source !== "string" || input.source.length > 8_000) return defaultPatternState(definition);
  const parsed = parseCssDeclarationList(input.source);
  return parsed.success ? { source: parsed.source } : defaultPatternState(definition);
};

export const compilePattern = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternCompilation => {
  const state = sanitizePatternState(definition, input);
  const parsed = parseCssDeclarationList(state.source);
  if (!parsed.success) throw new Error(`Sanitized CSS for '${definition.id}' must remain valid.`);
  const source = parsed.source;
  const inlineStyle = parsed.declarations
    .map(({ property, value, important }) => `${property}:${value}${important ? "!important" : ""}`)
    .join(";");
  const indented = source.split("\n").map((line) => `  ${line}`).join("\n");
  const editableRule = `${definition.selector} {\n${indented}\n}`;
  return Object.freeze({
    definition,
    state: Object.freeze({ source }),
    source,
    inlineStyle,
    css: definition.supportCss ? `${editableRule}\n\n${definition.supportCss.trim()}` : editableRule,
    html: definition.html,
  });
};

const findControl = (definition: PatternDefinition, controlId: string): PatternControl => {
  const control = definition.controls.find(({ id }) => id === controlId);
  if (!control) throw new Error(`Unknown '${definition.id}' Pattern control '${controlId}'.`);
  return control;
};

export const setPatternControl = (definition: PatternDefinition, source: string, controlId: string, optionId: string) => {
  const control = findControl(definition, controlId);
  const option = control.options.find(({ id }) => id === optionId) ?? control.options[0];
  const parsed = parseCssDeclarationList(source);
  const parsedDefault = parseCssDeclarationList(definition.defaultCss);
  if (!parsedDefault.success) throw new Error(`Pattern '${definition.id}' default CSS must remain valid.`);
  const declarations = (parsed.success ? parsed.declarations : parsedDefault.declarations).map((declaration) => ({ ...declaration }));

  option.declarations.forEach((change) => {
    const index = effectiveDeclarationIndex(declarations, change.property);
    const next = { property: change.property, value: change.value, important: false };
    if (index >= 0) declarations[index] = next;
    else declarations.push(next);
  });
  const nextSource = parseCssDeclarationList(declarationsToSource(declarations));
  if (!nextSource.success) throw new Error(`Pattern '${definition.id}' control '${controlId}' produced invalid CSS.`);
  return nextSource.source;
};

export const selectedPatternOption = (definition: PatternDefinition, source: string, controlId: string) => {
  const control = findControl(definition, controlId);
  const parsed = parseCssDeclarationList(source);
  if (!parsed.success) return undefined;
  return control.options.find((option) => option.declarations.every((change) => {
    const index = effectiveDeclarationIndex(parsed.declarations, change.property);
    return index >= 0 && parsed.declarations[index].value === normalizedValue(change.property, change.value);
  }))?.id;
};

export const patternStorageKey = (definition: PatternDefinition) => `techies-tools:pattern-${definition.id}:v1`;

export const serializePatternState = (definition: PatternDefinition, input: Partial<PatternState>) => JSON.stringify({
  version: 1,
  patternId: definition.id,
  state: sanitizePatternState(definition, input),
});

export const parseStoredPatternState = (definition: PatternDefinition, source: string | null): PatternState => {
  if (!source) return defaultPatternState(definition);
  try {
    const parsed = JSON.parse(source) as { version?: unknown; patternId?: unknown; state?: Partial<PatternState> };
    if (parsed.version !== 1 || parsed.patternId !== definition.id || !parsed.state || typeof parsed.state !== "object") {
      return defaultPatternState(definition);
    }
    return sanitizePatternState(definition, parsed.state);
  } catch {
    return defaultPatternState(definition);
  }
};
