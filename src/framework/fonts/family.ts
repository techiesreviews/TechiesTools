const fontFamilyPattern = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,79}$/;

export const isSafeFontFamilyName = (value: unknown): value is string =>
  typeof value === "string" && fontFamilyPattern.test(value);
