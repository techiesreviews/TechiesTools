import { effectiveDeclarationIndex, parseCssDeclarationList } from "../framework/css-declarations/index.ts";
import type { PatternControl, PatternDefinition } from "./definition.ts";

export interface PatternState {
  source: string;
  attributes: Readonly<Record<string, string | null>>;
  exportName: string;
}

export interface PatternCompilation {
  definition: PatternDefinition;
  state: PatternState;
  source: string;
  selector: string;
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

const definitionClassName = (definition: PatternDefinition) => definition.selector.slice(1);

export const normalizePatternExportName = (definition: PatternDefinition, input: unknown) => {
  const fallback = definitionClassName(definition);
  if (typeof input !== "string") return fallback;
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/g, "");
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(normalized) ? normalized : fallback;
};

const replacePatternNamespace = (definition: PatternDefinition, source: string, exportName: string) =>
  source.split(definitionClassName(definition)).join(exportName);

const attributeControls = (definition: PatternDefinition) => definition.controls.filter((control) => control.attribute);

const sanitizeAttributes = (definition: PatternDefinition, input: unknown) => {
  const received = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const defaults = definition.defaultAttributes ?? {};
  return Object.freeze(Object.fromEntries(attributeControls(definition).flatMap((control) => {
    const name = control.attribute!;
    const candidate = Object.hasOwn(received, name) ? received[name] : defaults[name];
    const allowed = control.options.some((option) => option.attributeValue === candidate);
    return (typeof candidate === "string" || candidate === null) && allowed ? [[name, candidate]] : [];
  })));
};

const compilePatternHtml = (definition: PatternDefinition, attributes: Readonly<Record<string, string | null>>, exportName: string) => {
  const openingEnd = definition.html.indexOf(">");
  if (openingEnd < 0) throw new Error(`Pattern '${definition.id}' HTML needs a root opening tag.`);
  let opening = definition.html.slice(0, openingEnd);
  for (const control of attributeControls(definition)) {
    const name = control.attribute!;
    opening = opening.replace(new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, "g"), "");
    if (typeof attributes[name] === "string") opening += ` ${name}="${attributes[name]}"`;
  }
  return replacePatternNamespace(definition, `${opening}${definition.html.slice(openingEnd)}`, exportName);
};

export const defaultPatternState = (definition: PatternDefinition): PatternState => ({
  source: definition.defaultCss,
  attributes: sanitizeAttributes(definition, definition.defaultAttributes),
  exportName: definitionClassName(definition),
});

export const sanitizePatternState = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternState => {
  const defaults = defaultPatternState(definition);
  if (typeof input.source !== "string" || input.source.length > 8_000) return defaults;
  const parsed = parseCssDeclarationList(input.source);
  return parsed.success ? {
    source: parsed.source,
    attributes: sanitizeAttributes(definition, input.attributes),
    exportName: normalizePatternExportName(definition, input.exportName),
  } : defaults;
};

export const compilePattern = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternCompilation => {
  const state = sanitizePatternState(definition, input);
  const parsed = parseCssDeclarationList(state.source);
  if (!parsed.success) throw new Error(`Sanitized CSS for '${definition.id}' must remain valid.`);
  const source = parsed.source;
  const exportSource = replacePatternNamespace(definition, source, state.exportName);
  const selector = `.${state.exportName}`;
  const inlineStyle = parsed.declarations
    .map(({ property, value, important }) => `${property}:${value}${important ? "!important" : ""}`)
    .join(";");
  const indented = exportSource.split("\n").map((line) => `  ${line}`).join("\n");
  const editableRule = `${selector} {\n${indented}\n}`;
  const supportCss = definition.supportCss
    ? replacePatternNamespace(definition, definition.supportCss.trim(), state.exportName)
    : undefined;
  return Object.freeze({
    definition,
    state: Object.freeze({ source, attributes: state.attributes, exportName: state.exportName }),
    source,
    selector,
    inlineStyle,
    css: supportCss ? `${editableRule}\n\n${supportCss}` : editableRule,
    html: compilePatternHtml(definition, state.attributes, state.exportName),
  });
};

export const setPatternExportName = (definition: PatternDefinition, input: Partial<PatternState>, exportName: string) => {
  const state = sanitizePatternState(definition, input);
  return sanitizePatternState(definition, { ...state, exportName });
};

const findControl = (definition: PatternDefinition, controlId: string): PatternControl => {
  const control = definition.controls.find(({ id }) => id === controlId);
  if (!control) throw new Error(`Unknown '${definition.id}' Pattern control '${controlId}'.`);
  return control;
};

export const setPatternControl = (definition: PatternDefinition, source: string, controlId: string, optionId: string) => {
  const control = findControl(definition, controlId);
  if (control.attribute) throw new Error(`Pattern '${definition.id}' control '${controlId}' changes an attribute, not CSS.`);
  const option = control.options.find(({ id }) => id === optionId) ?? control.options[0];
  const parsed = parseCssDeclarationList(source);
  const parsedDefault = parseCssDeclarationList(definition.defaultCss);
  if (!parsedDefault.success) throw new Error(`Pattern '${definition.id}' default CSS must remain valid.`);
  const declarations = (parsed.success ? parsed.declarations : parsedDefault.declarations).map((declaration) => ({ ...declaration }));

  option.declarations!.forEach((change) => {
    const index = effectiveDeclarationIndex(declarations, change.property);
    const next = { property: change.property, value: change.value, important: false };
    if (index >= 0) declarations[index] = next;
    else declarations.push(next);
  });
  const nextSource = parseCssDeclarationList(declarationsToSource(declarations));
  if (!nextSource.success) throw new Error(`Pattern '${definition.id}' control '${controlId}' produced invalid CSS.`);
  return nextSource.source;
};

export const setPatternStateControl = (definition: PatternDefinition, input: Partial<PatternState>, controlId: string, optionId: string) => {
  const state = sanitizePatternState(definition, input);
  const control = findControl(definition, controlId);
  const option = control.options.find(({ id }) => id === optionId) ?? control.options[0];
  if (!control.attribute) return sanitizePatternState(definition, {
    ...state,
    source: setPatternControl(definition, state.source, controlId, option.id),
  });
  const attributes = { ...state.attributes };
  attributes[control.attribute] = option.attributeValue!;
  return sanitizePatternState(definition, { ...state, attributes });
};

export const selectedPatternOption = (definition: PatternDefinition, input: string | Partial<PatternState>, controlId: string) => {
  const control = findControl(definition, controlId);
  const state = typeof input === "string" ? sanitizePatternState(definition, { source: input }) : sanitizePatternState(definition, input);
  if (control.attribute) {
    const current = state.attributes[control.attribute] ?? null;
    return control.options.find((option) => option.attributeValue === current)?.id;
  }
  const parsed = parseCssDeclarationList(state.source);
  if (!parsed.success) return undefined;
  return control.options.find((option) => option.declarations!.every((change) => {
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
