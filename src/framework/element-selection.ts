import type { ElementUiState } from "./events.ts";

export type ElementSelectionCatalog = Readonly<{
  /** Title and intent group for every selectable Element. */
  elements: Readonly<Record<string, { title: string; intent: string }>>;
  /** Elements with an authored Treatment, and so a rule picker. */
  treatmentIds: readonly string[];
  referencePath: string;
}>;

export const noElementSelection: ElementUiState = Object.freeze({ selectedElement: null, treatmentRule: null });

/** Select an Element; Treatment Elements start on `rule`, otherwise their base rule. Unknown IDs keep `current`. */
export const selectElement = (catalog: ElementSelectionCatalog, current: ElementUiState, elementId: string, rule?: string | null): ElementUiState => {
  if (!catalog.elements[elementId]) return current;
  return { selectedElement: elementId, treatmentRule: catalog.treatmentIds.includes(elementId) ? rule ?? "base" : null };
};

/** Change the Treatment rule of the selected Element; ignored without a Treatment selection. */
export const selectTreatmentRule = (state: ElementUiState, rule: string): ElementUiState =>
  state.selectedElement && state.treatmentRule !== null ? { ...state, treatmentRule: rule } : state;

/** Restore a persisted selection, dropping Elements that no longer exist. */
export const restoreElementSelection = (catalog: ElementSelectionCatalog, stored: ElementUiState | undefined): ElementUiState =>
  stored?.selectedElement ? selectElement(catalog, noElementSelection, stored.selectedElement, stored.treatmentRule) : noElementSelection;

export type ElementSelectionView = Readonly<{
  selected: string | null;
  hasTreatment: boolean;
  treatmentRule: string | null;
  pickerLabel: string;
  pickerMeta: string;
  link: { href: string; label: string } | null;
}>;

export const elementSelectionView = (catalog: ElementSelectionCatalog, state: ElementUiState, label?: string): ElementSelectionView => {
  const id = state.selectedElement;
  const item = id ? catalog.elements[id] : undefined;
  if (!id || !item) return { selected: null, hasTreatment: false, treatmentRule: null, pickerLabel: "", pickerMeta: "", link: null };
  return {
    selected: id,
    hasTreatment: state.treatmentRule !== null,
    treatmentRule: state.treatmentRule,
    pickerLabel: label ?? item.title,
    pickerMeta: `${item.intent} › <${id}>`,
    link: { href: `${catalog.referencePath}#${id}`, label: `Open <${id}>` },
  };
};
