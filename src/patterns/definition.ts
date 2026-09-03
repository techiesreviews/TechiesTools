import { parseCssDeclarationList } from "../framework/css-declarations/index.ts";
import { getComponentDefinition, type ComponentId } from "../framework/component-catalog/index.ts";

export interface PatternDeclarationChange {
  property: string;
  value: string;
}

export interface PatternControlOption {
  id: string;
  label: string;
  declarations?: readonly PatternDeclarationChange[];
  attributeValue?: string | null;
}

export interface PatternControl {
  id: string;
  label: string;
  attribute?: `data-${string}`;
  options: readonly PatternControlOption[];
}

export interface PatternDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  selector: string;
  storageVersion?: number;
  previewScale: number;
  html: string;
  defaultCss: string;
  nestedCss?: string;
  supportCss?: string;
  authoringSurfaceFor?: ComponentId;
  dependencies?: readonly ComponentId[];
  defaultAttributes?: Readonly<Record<string, string>>;
  controls: readonly PatternControl[];
}

export interface PatternCatalogEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  previewScale: number;
}

export const definePattern = (input: PatternDefinition): PatternDefinition => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.id)) throw new Error(`Invalid Pattern ID '${input.id}'.`);
  const selectorClass = input.selector.match(/^\.([a-z][a-z0-9]*(?:(?:--?)[a-z0-9]+)*)$/)?.[1];
  if (!selectorClass) throw new Error(`Pattern '${input.id}' must use one kebab-case or BEM modifier class selector.`);
  if (input.storageVersion !== undefined && (!Number.isInteger(input.storageVersion) || input.storageVersion < 1)) throw new Error(`Pattern '${input.id}' has an invalid storage version.`);
  const rootClass = input.html.match(/^\s*<[a-z][\w-]*\b([^>]*)>/i)?.[1]
    ?.match(/\bclass\s*=\s*(["'])(.*?)\1/is)?.[2]
    ?.split(/\s+/);
  if (!rootClass?.includes(selectorClass)) throw new Error(`Pattern '${input.id}' HTML root must contain its exact selector class.`);
  if (!(input.previewScale > 0 && input.previewScale <= 1)) throw new Error(`Pattern '${input.id}' preview scale must be above 0 and at most 1.`);

  const parsed = parseCssDeclarationList(input.defaultCss);
  if (!parsed.success) throw new Error(`Pattern '${input.id}' default CSS must be a valid declaration list.`);
  if (input.dependencies?.some((dependency, index) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dependency) || input.dependencies!.indexOf(dependency) !== index)) {
    throw new Error(`Pattern '${input.id}' has invalid component dependencies.`);
  }
  if (input.authoringSurfaceFor) {
    const component = getComponentDefinition(input.authoringSurfaceFor);
    if (!component || component.selector !== input.selector || input.dependencies?.includes(input.authoringSurfaceFor)) {
      throw new Error(`Pattern '${input.id}' has an invalid component authoring source.`);
    }
  }
  const controlIds = new Set<string>();
  input.controls.forEach((control) => {
    if (controlIds.has(control.id) || control.options.length < 2) throw new Error(`Pattern '${input.id}' has an invalid '${control.id}' control.`);
    controlIds.add(control.id);
    if (control.attribute && !/^data-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(control.attribute)) {
      throw new Error(`Pattern '${input.id}' has an invalid '${control.attribute}' attribute control.`);
    }
    const optionIds = new Set<string>();
    control.options.forEach((option) => {
      const hasAttributeValue = Object.hasOwn(option, "attributeValue");
      const hasDeclarations = (option.declarations?.length ?? 0) > 0;
      const safeAttributeValue = option.attributeValue === null
        || (typeof option.attributeValue === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(option.attributeValue));
      if (optionIds.has(option.id)
        || (control.attribute ? !hasAttributeValue || !safeAttributeValue || hasDeclarations : hasAttributeValue || !hasDeclarations)) {
        throw new Error(`Pattern '${input.id}' has an invalid '${control.id}' option.`);
      }
      optionIds.add(option.id);
    });
  });

  const declaredAttributes = new Set<string>(input.controls.flatMap((control) => control.attribute ? [control.attribute] : []));
  Object.entries(input.defaultAttributes ?? {}).forEach(([name, value]) => {
    if (!declaredAttributes.has(name) || typeof value !== "string") {
      throw new Error(`Pattern '${input.id}' has an invalid default attribute '${name}'.`);
    }
  });

  return Object.freeze({ ...input, defaultCss: parsed.source });
};

export const catalogEntry = (definition: PatternDefinition): PatternCatalogEntry => Object.freeze({
  id: definition.id,
  title: definition.title,
  category: definition.category,
  description: definition.description,
  href: `/patterns/${definition.id}`,
  previewScale: definition.previewScale,
});
