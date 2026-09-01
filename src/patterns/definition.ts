import { parseCssDeclarationList } from "../framework/css-declarations/index.ts";

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
  previewScale: number;
  html: string;
  defaultCss: string;
  supportCss?: string;
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
  if (!input.selector.startsWith(".")) throw new Error(`Pattern '${input.id}' must use a class selector.`);
  const selectorClass = input.selector.match(/\.([a-zA-Z0-9_-]+)/)?.[1];
  if (!selectorClass || !input.html.includes(selectorClass)) throw new Error(`Pattern '${input.id}' HTML must contain its selector class.`);
  if (!(input.previewScale > 0 && input.previewScale <= 1)) throw new Error(`Pattern '${input.id}' preview scale must be above 0 and at most 1.`);

  const parsed = parseCssDeclarationList(input.defaultCss);
  if (!parsed.success) throw new Error(`Pattern '${input.id}' default CSS must be a valid declaration list.`);
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
