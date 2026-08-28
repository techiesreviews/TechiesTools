import type { PrimitiveToken } from "../compiler/index.ts";

export const FRAMEWORK_SITE_THEME_STORAGE_KEY = "techies-tools:framework:site-theme:v1";

export type FrameworkSiteTheme = Readonly<{
  version: 1;
  contentHash: string;
  variables: Readonly<Record<string, string>>;
  fontStylesheet?: string;
}>;

const canonicalAlias = (id: string) => {
  const [family, name] = id.split(".", 2);
  if (!name) return undefined;
  if (family === "semantic") return `--semantic-${name}`;
  if (family === "spacing") return `--space-${name}`;
  if (family === "radius") return `--radius-${name}`;
  if (family !== "typography") return undefined;
  return name.startsWith("family-") ? `--font-${name.slice("family-".length)}` : `--text-${name}`;
};

const fontStylesheetFrom = (tokensCss: string | undefined) => {
  const href = tokensCss?.match(/@import url\("([^"]+)"\);/)?.[1];
  if (!href) return undefined;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && url.hostname === "fonts.googleapis.com" && url.pathname === "/css2"
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
};

export const frameworkSiteTheme = (
  tokens: readonly PrimitiveToken[],
  contentHash: string,
  tokensCss?: string,
): FrameworkSiteTheme => {
  const variables: Record<string, string> = {};
  tokens.forEach((token) => {
    variables[token.cssName] = token.value;
    const alias = canonicalAlias(token.id);
    if (alias) variables[alias] = token.value;
  });
  const fontStylesheet = fontStylesheetFrom(tokensCss);
  return {
    version: 1,
    contentHash,
    variables,
    ...(fontStylesheet ? { fontStylesheet } : {}),
  };
};

export const parseFrameworkSiteTheme = (source: string | null): FrameworkSiteTheme | null => {
  if (!source) return null;
  try {
    const candidate = JSON.parse(source) as Partial<FrameworkSiteTheme>;
    if (candidate.version !== 1 || typeof candidate.contentHash !== "string" || !candidate.variables || typeof candidate.variables !== "object") return null;
    const variables = Object.fromEntries(Object.entries(candidate.variables).filter(([name, value]) =>
      /^--[a-z0-9][a-z0-9-]*$/.test(name)
      && typeof value === "string"
      && value.length > 0
      && value.length <= 500
      && !/[;{}\r\n]/.test(value),
    ));
    const fontStylesheet = typeof candidate.fontStylesheet === "string"
      ? fontStylesheetFrom(`@import url("${candidate.fontStylesheet}");`)
      : undefined;
    return {
      version: 1,
      contentHash: candidate.contentHash,
      variables,
      ...(fontStylesheet ? { fontStylesheet } : {}),
    };
  } catch {
    return null;
  }
};
