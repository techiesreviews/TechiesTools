import {
  FRAMEWORK_SITE_THEME_STORAGE_KEY,
  parseFrameworkSiteTheme,
  type FrameworkSiteTheme,
} from "./index.ts";

const root = document.documentElement;
const appliedVariables = new Set<string>();

const syncFontStylesheet = (href?: string) => {
  const current = document.querySelector<HTMLLinkElement>("link[data-framework-site-fonts]");
  if (!href) {
    current?.remove();
    return;
  }
  if (current?.href === href) return;
  const stylesheet = current ?? document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.dataset.frameworkSiteFonts = "";
  stylesheet.href = href;
  if (!current) document.head.append(stylesheet);
};

const applyTheme = (theme: FrameworkSiteTheme) => {
  const nextNames = new Set(Object.keys(theme.variables));
  appliedVariables.forEach((name) => {
    if (!nextNames.has(name)) root.style.removeProperty(name);
  });
  Object.entries(theme.variables).forEach(([name, value]) => root.style.setProperty(name, value));
  appliedVariables.clear();
  nextNames.forEach((name) => appliedVariables.add(name));
  root.dataset.frameworkSiteTheme = theme.contentHash;
  syncFontStylesheet(theme.fontStylesheet);
};

const resetTheme = () => {
  appliedVariables.forEach((name) => root.style.removeProperty(name));
  appliedVariables.clear();
  delete root.dataset.frameworkSiteTheme;
  syncFontStylesheet();
  try { localStorage.removeItem(FRAMEWORK_SITE_THEME_STORAGE_KEY); } catch { /* Recovery stays available without storage. */ }
};

const storedTheme = (() => {
  try { return parseFrameworkSiteTheme(localStorage.getItem(FRAMEWORK_SITE_THEME_STORAGE_KEY)); }
  catch { return null; }
})();
if (storedTheme) applyTheme(storedTheme);

window.addEventListener("framework-site-theme:update", (event) => {
  const theme = parseFrameworkSiteTheme(JSON.stringify((event as CustomEvent).detail));
  if (!theme) return;
  applyTheme(theme);
  try { localStorage.setItem(FRAMEWORK_SITE_THEME_STORAGE_KEY, JSON.stringify(theme)); } catch { /* Live theme still works in-memory. */ }
});

window.addEventListener("framework-site-theme:reset", resetTheme);
window.addEventListener("storage", (event) => {
  if (event.key !== FRAMEWORK_SITE_THEME_STORAGE_KEY) return;
  const theme = parseFrameworkSiteTheme(event.newValue);
  if (theme) applyTheme(theme);
  else resetTheme();
});
