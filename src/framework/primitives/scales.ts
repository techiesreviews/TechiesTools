/** One fluid scale step in rem: the value at the minimum and maximum viewport. */
export type ScaleToken = { token: string; min: number; max: number };

export const typeScaleNames = Object.freeze(["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"] as const);
export const radiusScaleNames = Object.freeze(["xs", "s", "m", "l", "xl"] as const);
export const spacingScaleNames = Object.freeze(["4xs", "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"] as const);

export interface ModularScaleInput {
  names: readonly string[];
  /** Token whose value equals `min`/`max`; unknown names anchor at the first token. */
  baseIndex: string;
  min: number;
  max: number;
  minRatio: number;
  maxRatio: number;
  /** Smallest allowed minimum value. */
  floor?: number;
  /** Decimal places kept; omit to keep full precision. */
  precision?: number;
}

const rounded = (value: number, precision?: number) => precision === undefined ? value : Number(value.toFixed(precision));

/** Geometric scale anchored at `baseIndex`; `max` never falls below `min`. */
export const modularScale = ({ names, baseIndex, min, max, minRatio, maxRatio, floor = 0, precision }: ModularScaleInput): ScaleToken[] => {
  const anchor = Math.max(0, names.indexOf(baseIndex));
  return names.map((token, index) => {
    const step = index - anchor;
    const minValue = Math.max(floor, min * Math.pow(minRatio, step));
    const maxValue = Math.max(minValue, max * Math.pow(maxRatio, step));
    return { token, min: rounded(minValue, precision), max: rounded(maxValue, precision) };
  });
};

/** Type scale parameters as the settings bar publishes them: rem strings and ratio strings. */
export interface TypeScaleParameters {
  min: string;
  max: string;
  minRatio: string;
  maxRatio: string;
  baseIndex: string;
  tokens?: readonly ScaleToken[];
}

/** Explicit manual tokens win; otherwise derive the automatic type scale. */
export const typeScale = (type: TypeScaleParameters): readonly ScaleToken[] => type.tokens?.length ? type.tokens : modularScale({
  names: typeScaleNames,
  baseIndex: type.baseIndex,
  min: Number.parseFloat(type.min) || 1,
  max: Number.parseFloat(type.max) || 1.125,
  minRatio: Number.parseFloat(type.minRatio) || 1.125,
  maxRatio: Number.parseFloat(type.maxRatio) || 1.333,
});

export interface DimensionScaleInput {
  min: number;
  max: number;
  minRatio: number;
  maxRatio: number;
  baseIndex: string;
}

/** Radius scale; `includeFull` appends the pill token. */
export const radiusScale = (input: DimensionScaleInput & { includeFull: boolean }): ScaleToken[] => [
  ...modularScale({ ...input, names: radiusScaleNames, precision: 2 }),
  ...(input.includeFull ? [{ token: "full", min: 999, max: 999 }] : []),
];

/** Spacing scale with a 1px floor. */
export const spacingScale = (input: DimensionScaleInput): ScaleToken[] =>
  modularScale({ ...input, names: spacingScaleNames, floor: 0.0625, precision: 3 });
