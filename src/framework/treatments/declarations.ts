import type { Declaration, TokenFamily } from "../model/index.ts";

export const tokenDeclaration = (
  label: string,
  family: TokenFamily,
  names: readonly string[],
  starter = names[0],
): Declaration => ({
  label,
  control: { kind: "token", families: [family], options: names.map((name) => ({ family, name })) },
  starter: { kind: "token", family, name: starter },
});

export const choiceDeclaration = (
  label: string,
  options: readonly string[],
  starter = options[0],
): Declaration => ({
  label,
  control: { kind: "choice", options: options.map((value) => ({ value, label: value })) },
  starter: { kind: "choice", value: starter },
});

export const lengthDeclaration = (
  label: string,
  value: string,
  allowNegative = false,
  allowPercentage = false,
): Declaration => ({
  label,
  control: {
    kind: "length",
    ...(allowNegative ? { allowNegative: true as const } : {}),
    ...(allowPercentage ? { allowPercentage: true as const } : {}),
  },
  starter: { kind: "length", value },
});

export const dimensionDeclaration = (
  label: string,
  family: "typography" | "spacing" | "radius",
  names: readonly string[],
  starter = names[0],
) => tokenDeclaration(label, family, names, starter);

export const semanticColorDeclaration = (
  label: string,
  names: readonly string[],
  starter = names[0],
) => tokenDeclaration(label, "semantic", names, starter);
