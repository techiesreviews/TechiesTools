export type SemanticShade = "lightest" | "lighter" | "light" | "base" | "dark" | "darker" | "darkest";

export type SemanticPaletteColor = {
  id: string;
  name: string;
  value: string;
  scale: readonly string[];
  variable: string;
};

export type SemanticColorOption = {
  label: string;
  reference: string;
  value: string;
  colorId?: string;
  shade?: SemanticShade;
};

export type SemanticColorRoleAdapter = {
  role: string;
  requestedReference?: string;
  requestedLabel?: string;
  previousOption?: SemanticColorOption;
  apply: (options: readonly SemanticColorOption[], selected: SemanticColorOption) => void;
};

type ReconcileSemanticColorSelectionInput = {
  options: readonly SemanticColorOption[];
  requestedReference?: string;
  requestedLabel?: string;
  previousOption?: SemanticColorOption;
  fallbackReference: string;
};

const shadeDefinitions: readonly {
  label: string;
  shade: SemanticShade;
  suffix: string;
  scaleIndex: number;
}[] = [
  { label: "Lightest", shade: "lightest", suffix: "-lightest", scaleIndex: 0 },
  { label: "Lighter", shade: "lighter", suffix: "-lighter", scaleIndex: 1 },
  { label: "Light", shade: "light", suffix: "-light", scaleIndex: 2 },
  { label: "Base", shade: "base", suffix: "", scaleIndex: 3 },
  { label: "Dark", shade: "dark", suffix: "-dark", scaleIndex: 4 },
  { label: "Darker", shade: "darker", suffix: "-darker", scaleIndex: 5 },
  { label: "Darkest", shade: "darkest", suffix: "-darkest", scaleIndex: 6 },
];

export const buildSemanticColorOptions = (colors: readonly SemanticPaletteColor[]): readonly SemanticColorOption[] => [
  ...colors.flatMap((color) => shadeDefinitions.map(({ label, shade, suffix, scaleIndex }) => ({
    label: `${color.name} / ${label}`,
    reference: `${color.variable}${suffix}`,
    value: shade === "base" ? color.value : color.scale[scaleIndex],
    colorId: color.id,
    shade,
  }))),
  { label: "Black", reference: "oklch(0% 0 0)", value: "oklch(0% 0 0)" },
  { label: "White", reference: "oklch(100% 0 0)", value: "oklch(100% 0 0)" },
];

export const reconcileSemanticColorSelection = ({
  options,
  requestedReference,
  requestedLabel,
  previousOption,
  fallbackReference,
}: ReconcileSemanticColorSelectionInput): SemanticColorOption => {
  const exactReference = options.find((option) => option.reference === requestedReference);
  if (exactReference) return exactReference;

  if (previousOption?.colorId && previousOption.shade) {
    const stableSelection = options.find((option) =>
      option.colorId === previousOption.colorId && option.shade === previousOption.shade);
    if (stableSelection) return stableSelection;
  }

  const exactLabel = options.find((option) => option.label === requestedLabel);
  return exactLabel
    ?? options.find((option) => option.reference === fallbackReference)
    ?? options[0];
};

export const refreshSemanticColorRoles = ({
  colors,
  roles,
  defaults,
}: {
  colors: readonly SemanticPaletteColor[];
  roles: readonly SemanticColorRoleAdapter[];
  defaults: Readonly<Record<string, string>>;
}) => {
  const options = buildSemanticColorOptions(colors);
  roles.forEach((role) => {
    const selected = reconcileSemanticColorSelection({
      options,
      requestedReference: role.requestedReference,
      requestedLabel: role.requestedLabel,
      previousOption: role.previousOption,
      fallbackReference: defaults[role.role] ?? options[0]?.reference ?? "",
    });
    if (!selected) throw new Error(`Semantic color role ${role.role} has no available options.`);
    role.apply(options, selected);
  });
};
