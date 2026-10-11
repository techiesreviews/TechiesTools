import { effectiveDeclarationIndex, parseCssDeclarationList } from "../framework/css-declarations/index.ts";
import { formatCss, formatHtml } from "../code-editor/format.ts";
import { generate, parse, walk } from "css-tree/dist/csstree.esm";
import { getComponentDefinition } from "../framework/component-catalog/index.ts";
import { utilityCss } from "../utilities/index.ts";
import { rootClassNames, type PatternControl, type PatternDefinition } from "./definition.ts";

export interface PatternState {
  source: string;
  nestedSource: string;
  supportSource: string;
  htmlSource: string;
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
    .replace(/_component$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 54)
    .replace(/-+$/g, "");
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(normalized) ? `${normalized}_component` : fallback;
};

const belongsToNamespace = (name: string, namespace: string) =>
  name === namespace || name.startsWith(`${namespace}__`) || name.startsWith(`${namespace}--`);

const rewriteHtmlNamespace = (source: string, from: string, to: string) => source.replace(/\bclass\s*=\s*(['"])(.*?)\1/gs, (_attribute, quote: string, classes: string) =>
  `class=${quote}${classes.split(/(\s+)/).map((name) => belongsToNamespace(name, from) ? `${to}${name.slice(from.length)}` : name).join("")}${quote}`);

interface SourceEdit { start:number; end:number; value:string; }

const applySourceEdits = (source: string, edits: readonly SourceEdit[]) => edits
  .slice()
  .sort((left, right) => right.start - left.start)
  .reduce((result, edit) => `${result.slice(0, edit.start)}${edit.value}${result.slice(edit.end)}`, source);

const replaceBareNamespace = (source: string, from: string, to: string) =>
  source.replace(new RegExp(`(^|[^a-zA-Z0-9_-])${escapedPattern(from)}(?=$|[^a-zA-Z0-9_-])`, "g"), `$1${to}`);

const isOwnedKeyframeName = (name: string, namespace: string) =>
  new RegExp(`^${escapedPattern(namespace)}--[a-z][a-z0-9-]*$`).test(name);

const rewriteOwnedKeyframeNames = (source: string, from: string, to: string) =>
  source.replace(new RegExp(`(^|[^a-zA-Z0-9_-])(${escapedPattern(from)}--[a-z][a-z0-9-]*)(?=$|[^a-zA-Z0-9_-])`, "g"), (_match, prefix: string, name: string) =>
    `${prefix}${to}${name.slice(from.length)}`);

const isKeyframeSelector = (value: string) => value.split(",").every((part) =>
  /^(?:from|to|(?:0|[1-9]\d*)(?:\.\d+)?%)$/.test(part.trim()));

const rewriteCssNamespace = (source: string, from: string, to: string) => {
  if (from === to) return source;
  try {
    const ast: any = parse(source, { context:"stylesheet", positions:true });
    const edits: SourceEdit[] = [];
    walk(ast, (node: any) => {
      if (node.type === "ClassSelector" && node.loc && belongsToNamespace(node.name, from)) {
        edits.push({ start:node.loc.start.offset, end:node.loc.end.offset, value:`.${to}${node.name.slice(from.length)}` });
      }
      const namesContainer = node.type === "Declaration" && ["container", "container-name"].includes(node.property.toLowerCase());
      const namesAnimation = node.type === "Declaration" && ["animation", "animation-name"].includes(node.property.toLowerCase());
      const namesContainerQuery = node.type === "Atrule" && node.name === "container";
      const namesKeyframes = node.type === "Atrule" && /keyframes$/i.test(node.name) && node.prelude
        && isOwnedKeyframeName(generate(node.prelude).trim(), from);
      const value = namesContainer || namesAnimation ? node.value : namesContainerQuery || namesKeyframes ? node.prelude : null;
      if (value?.loc) {
        const original = source.slice(value.loc.start.offset, value.loc.end.offset);
        const rewritten = namesAnimation || namesKeyframes
          ? rewriteOwnedKeyframeNames(original, from, to)
          : replaceBareNamespace(original, from, to);
        if (rewritten !== original) edits.push({ start:value.loc.start.offset, end:value.loc.end.offset, value:rewritten });
      }
    });
    return applySourceEdits(source, edits);
  } catch { return source; }
};

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

const compilePatternHtml = (definition: PatternDefinition, htmlSource: string, attributes: Readonly<Record<string, string | null>>, exportName: string) => {
  const openingEnd = htmlSource.indexOf(">");
  if (openingEnd < 0) throw new Error(`Pattern '${definition.id}' HTML needs a root opening tag.`);
  let opening = htmlSource.slice(0, openingEnd);
  for (const control of attributeControls(definition)) {
    const name = control.attribute!;
    opening = opening.replace(new RegExp(`\\s${name}=(?:"[^"]*"|'[^']*')`, "g"), "");
    if (typeof attributes[name] === "string") opening += ` ${name}="${attributes[name]}"`;
  }
  return rewriteHtmlNamespace(`${opening}${htmlSource.slice(openingEnd)}`, definitionClassName(definition), exportName);
};

const escapedPattern = (source: string) => source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const canonicalizeHtmlNamespace = (definition: PatternDefinition, source: string, exportName: string) => {
  return rewriteHtmlNamespace(source, exportName, definitionClassName(definition));
};

const canonicalizeCssNamespace = (definition: PatternDefinition, source: string, exportName: string) =>
  rewriteCssNamespace(source, exportName, definitionClassName(definition));

const validateHtml = (definition: PatternDefinition, source: string) => {
  if (!source.trim() || source.length > 20_000) return "HTML must contain one component and stay under 20 KB.";
  if (/<\/?(?:script|style|iframe|object|embed|base|meta|link)\b/i.test(source)) return "Scripts, embedded documents, and document metadata are not allowed.";
  if (/\son[a-z]+\s*=|\ssrcdoc\s*=/i.test(source)) return "Event-handler and srcdoc attributes are not allowed.";
  if (/\s(?:href|src|action|formaction)\s*=\s*["']?\s*(?:javascript:|data:text\/html)/i.test(source)) return "Unsafe URLs are not allowed.";
  if (!rootClassNames(source).includes(definitionClassName(definition))) return `HTML must keep the .${definitionClassName(definition)} root class.`;
  return null;
};

export type PatternEditResult = { success: true; state: PatternState } | { success: false; message: string };

const scopePrelude = (selector: string) => `(${selector}) to ([class*="_component"])`;

const parseSafeStylesheet = (definition: PatternDefinition, source: string) => {
  try {
    const ast: any = parse(source, { context: "stylesheet", positions: true, parseCustomProperty: true });
    let safe = true;
    const visit = (nodes: any, scoped = false, keyframes = false) => {
      nodes.forEach((node: any) => {
        if (node.type === "Rule") {
          if (!scoped && !keyframes) safe = false;
          if (keyframes && !isKeyframeSelector(generate(node.prelude))) safe = false;
          visit(node.block.children, scoped || keyframes, false);
        } else if (node.type === "Atrule") {
          if (node.name === "scope") {
            const scope = node.prelude?.children?.first;
            if (scope?.type !== "Scope" || !scope.root || !scope.limit
              || generate(scope.limit) !== '[class*="_component"]') { safe = false; return; }
            for (const selector of scope.root.children.toArray()) {
              const parts = selector.children.toArray();
              // A scope must start at this Pattern; descendant component scopes may
              // use context, but cannot select siblings or unrelated roots.
              if (parts[0]?.type !== "ClassSelector" || parts[0].name !== definitionClassName(definition)
                || parts.some((part: any) => part.type === "Combinator" && ![" ", ">"].includes(part.name))) safe = false;
            }
            visit(node.block.children, true);
          } else if (node.name === "keyframes") {
            if (!node.prelude || !isOwnedKeyframeName(generate(node.prelude).trim(), definitionClassName(definition))) safe = false;
            if (!node.block?.children.size) safe = false;
            if (node.block) visit(node.block.children, false, true);
          } else if (["media", "supports", "container"].includes(node.name) && node.block) {
            visit(node.block.children, scoped);
          } else safe = false;
        } else if (node.type === "Declaration") {
          if (!scoped && !keyframes) safe = false;
        } else if (node.type !== "Comment") safe = false;
      });
    };
    visit(ast.children);
    walk(ast, (node: any) => { if (node.type === "Url" || node.type === "Raw" || (node.type === "Combinator" && ["+", "~"].includes(node.name))) safe = false; });
    return safe ? ast : null;
  } catch { return null; }
};

const safeSupportSource = (definition: PatternDefinition, source: string) => source.length <= 30_000 && Boolean(parseSafeStylesheet(definition, source));
const safeNestedSource = (definition: PatternDefinition, source: string) => source.length <= 30_000
  && Boolean(parseSafeStylesheet(definition, `@scope ${scopePrelude(definition.selector)} {\n${source}\n}`));

export const defaultPatternState = (definition: PatternDefinition): PatternState => ({
  source: definition.defaultCss,
  nestedSource: definition.nestedCss?.trim() ?? "",
  supportSource: definition.supportCss?.trim() ?? "",
  htmlSource: definition.html,
  attributes: sanitizeAttributes(definition, definition.defaultAttributes),
  exportName: definitionClassName(definition),
});

/** Migrate stored BEM drafts without discarding user HTML or declarations. Runs only when reading storage. */
const migrateLegacyPatternState = (definition: PatternDefinition, input: Partial<PatternState>): Partial<PatternState> => {
  const classes = definition.legacyClasses;
  if (!classes || typeof input.htmlSource !== "string") return input;
  const legacyRoot = Object.keys(classes)[0];
  const rootClasses = rootClassNames(input.htmlSource);
  if (!rootClasses.includes(legacyRoot) || rootClasses.includes(definitionClassName(definition))) return input;
  const renameClass = (name: string) => classes[name] ?? (name.startsWith(`${legacyRoot}__`) ? name.slice(legacyRoot.length + 2) : name);
  const htmlSource = input.htmlSource.replace(/\bclass\s*=\s*(['"])(.*?)\1/gs, (_match, quote: string, names: string) =>
    `class=${quote}${names.split(/\s+/).map(renameClass).join(" ")}${quote}`);
  const migrateCss = (css: string) => {
    const renamed = rewriteCssNamespace(css, legacyRoot, definitionClassName(definition));
    try {
      const ast: any = parse(renamed, { positions: true });
      const edits: SourceEdit[] = [];
      walk(ast, (node: any) => {
        if (node.type === "ClassSelector" && node.loc) {
          const oldName = node.name.startsWith(definitionClassName(definition) + "__")
            ? legacyRoot + node.name.slice(definitionClassName(definition).length) : node.name;
          const value = node.name === definitionClassName(definition) ? ":scope" : `.${renameClass(oldName)}`;
          edits.push({ start: node.loc.start.offset, end: node.loc.end.offset, value });
        }
        if (node.type === "NestingSelector" && node.loc) edits.push({ start: node.loc.start.offset, end: node.loc.end.offset, value: ":scope" });
      });
      return applySourceEdits(renamed, edits);
    } catch { return css; }
  };
  return {
    ...input,
    source: input.source ? rewriteCssNamespace(`${definition.selector} {${input.source}}`, legacyRoot, definitionClassName(definition)).replace(/^[^{]*\{|}\s*$/g, "") : input.source,
    htmlSource,
    exportName: input.exportName === legacyRoot ? definitionClassName(definition) : input.exportName,
    nestedSource: migrateCss([input.nestedSource ?? "", input.supportSource ?? ""].join("\n")),
    supportSource: "",
  };
};

export const sanitizePatternState = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternState => {
  const defaults = defaultPatternState(definition);
  if (typeof input.source !== "string" || input.source.length > 8_000) return defaults;
  const parsed = parseCssDeclarationList(input.source);
  const nestedSource = typeof input.nestedSource === "string" && safeNestedSource(definition, input.nestedSource) ? input.nestedSource.trim() : defaults.nestedSource;
  const supportSource = typeof input.supportSource === "string" && safeSupportSource(definition, input.supportSource) ? input.supportSource.trim() : defaults.supportSource;
  const htmlSource = typeof input.htmlSource === "string" && !validateHtml(definition, input.htmlSource) ? input.htmlSource : defaults.htmlSource;
  return parsed.success ? {
    source: parsed.source,
    nestedSource,
    supportSource,
    htmlSource,
    attributes: sanitizeAttributes(definition, input.attributes),
    exportName: normalizePatternExportName(definition, input.exportName),
  } : defaults;
};

export const compilePattern = (definition: PatternDefinition, input: Partial<PatternState> = {}): PatternCompilation => {
  const state = sanitizePatternState(definition, input);
  const parsed = parseCssDeclarationList(state.source);
  if (!parsed.success) throw new Error(`Sanitized CSS for '${definition.id}' must remain valid.`);
  const source = parsed.source;
  const exportDeclarations = parsed.declarations.map((declaration) => {
    const property = declaration.property.toLowerCase();
    if (["container", "container-name"].includes(property)) {
      return { ...declaration, value:replaceBareNamespace(declaration.value, definitionClassName(definition), state.exportName) };
    }
    if (["animation", "animation-name"].includes(property)) {
      return { ...declaration, value:rewriteOwnedKeyframeNames(declaration.value, definitionClassName(definition), state.exportName) };
    }
    return declaration;
  });
  const exportSource = declarationsToSource(exportDeclarations);
  const selector = `.${state.exportName}`;
  const inlineStyle = exportDeclarations
    .map(({ property, value, important }) => `${property}:${value}${important ? "!important" : ""}`)
    .join(";");
  const indented = exportSource.split("\n").map((line) => `  ${line}`).join("\n");
  const nestedCss = state.nestedSource
    ? rewriteCssNamespace(state.nestedSource, definitionClassName(definition), state.exportName)
    : "";
  const editableRule = `@scope ${scopePrelude(selector)} {\n  :scope {\n${indented}\n  }\n${nestedCss}\n}`;
  const supportCss = state.supportSource
    ? rewriteCssNamespace(state.supportSource, definitionClassName(definition), state.exportName)
    : undefined;
  const css = formatCss(supportCss ? `${editableRule}\n\n${supportCss}` : editableRule);
  try { parse(css, { context:"stylesheet" }); }
  catch { throw new Error(`Formatted CSS for '${definition.id}' must remain valid.`); }
  const html = formatHtml(compilePatternHtml(definition, state.htmlSource, state.attributes, state.exportName));
  return Object.freeze({
    definition,
    state: Object.freeze({ source, nestedSource: state.nestedSource, supportSource: state.supportSource, htmlSource: state.htmlSource, attributes: state.attributes, exportName: state.exportName }),
    source,
    selector,
    inlineStyle,
    css,
    html,
  });
};

/** Isolate author CSS inside its Pattern Preview without changing portable export bytes. */
export const scopePatternPreviewCss = (definition: PatternDefinition, css: string) =>
  `@scope ([data-pattern-scope="${definition.id}"]) {\n@layer utilities {\n${utilityCss}\n}\n${(definition.dependencies ?? [])
    .map((id) => getComponentDefinition(id)?.css ?? "")
    .filter(Boolean)
    .map((dependency) => `@layer components {\n${dependency}\n}`)
    .join("\n\n")}${definition.dependencies?.length ? "\n\n" : ""}${css}\n}`;

export const setPatternHtml = (definition: PatternDefinition, input: Partial<PatternState>, html: string): PatternEditResult => {
  const state = sanitizePatternState(definition, input);
  const canonical = canonicalizeHtmlNamespace(definition, html, state.exportName);
  const message = validateHtml(definition, canonical);
  return message ? { success: false, message } : { success: true, state: sanitizePatternState(definition, { ...state, htmlSource: canonical }) };
};

export const setPatternStylesheet = (definition: PatternDefinition, input: Partial<PatternState>, css: string): PatternEditResult => {
  const state = sanitizePatternState(definition, input);
  if (!css.trim() || css.length > 40_000) return { success: false, message: "CSS must contain the component stylesheet and stay under 40 KB." };
  const canonical = canonicalizeCssNamespace(definition, css, state.exportName);
  const ast = parseSafeStylesheet(definition, canonical);
  if (!ast) return { success: false, message: "The stylesheet contains invalid or unsafe CSS." };
  const top = ast.children.toArray();
  const ownerScopes = top.filter((node: any) => node.type === "Atrule" && node.name === "scope"
    && generate(node.prelude?.children?.first?.root) === definition.selector);
  if (ownerScopes.length !== 1) return { success: false, message: `CSS must contain exactly one bounded ${definition.selector} scope.` };
  const owner = ownerScopes[0].block.children.toArray();
  const roots = owner.filter((node: any) => node.type === "Rule" && generate(node.prelude).trim() === ":scope");
  if (roots.length !== 1) return { success: false, message: "CSS must contain exactly one component root rule." };
  const root = roots[0];
  const rootChildren = root.block.children.toArray();
  const declarationSource = rootChildren.filter((node: any) => node.type === "Declaration").map((node: any) => `${generate(node)};`).join("\n");
  const parsed = parseCssDeclarationList(declarationSource);
  if (!parsed.success) return { success: false, message: parsed.issues[0]?.message ?? "The component rule is invalid." };
  const nestedSource = owner.filter((node: any) => node !== root).map((node: any) => generate(node)).join("\n\n");
  // Root nesting remains editable: keep it inside a separate root-state rule.
  if (rootChildren.some((node: any) => node.type !== "Declaration")) return { success: false, message: "Keep component state and responsive rules beside the :scope declaration rule." };
  const removed = ownerScopes[0];
  const supportSource = `${canonical.slice(0, removed.loc.start.offset)}${canonical.slice(removed.loc.end.offset)}`.trim();
  return { success: true, state: sanitizePatternState(definition, { ...state, source: parsed.source, nestedSource, supportSource }) };
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

export const patternStorageKey = (definition: PatternDefinition) => `techies-tools:pattern-${definition.id}:v${definition.storageVersion ?? 1}`;

export const serializePatternState = (definition: PatternDefinition, input: Partial<PatternState>) => JSON.stringify({
  version: 4,
  patternId: definition.id,
  state: sanitizePatternState(definition, input),
});

export const parseStoredPatternState = (definition: PatternDefinition, source: string | null): PatternState => {
  if (!source) return defaultPatternState(definition);
  try {
    const parsed = JSON.parse(source) as { version?: unknown; patternId?: unknown; state?: Partial<PatternState> };
    if (![1, 2, 3, 4].includes(Number(parsed.version)) || parsed.patternId !== definition.id || !parsed.state || typeof parsed.state !== "object") {
      return defaultPatternState(definition);
    }
    return sanitizePatternState(definition, migrateLegacyPatternState(definition, parsed.state));
  } catch {
    return defaultPatternState(definition);
  }
};
