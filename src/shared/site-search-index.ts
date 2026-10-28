import { patternCatalog } from "../patterns/registry.ts";
import { appPath, appsPath, homePath, homeSections, showcaseApps } from "../showcase/projects.ts";
import type { SiteSearchEntry } from "./site-search.ts";

/** Everything the site search finds, in the order it lists them before you type. */
export const siteSearchEntries = (): SiteSearchEntry[] => {
  const entries: SiteSearchEntry[] = [];
  const seen = new Set<string>();
  const add = (entry: SiteSearchEntry) => {
    if (seen.has(entry.href)) return;
    seen.add(entry.href);
    entries.push(entry);
  };

  for (const app of showcaseApps) {
    const keywords = [app.kind, app.summary, ...app.features.map(({ title }) => title)];
    add({ group: "Apps", title: app.name, description: app.tagline, href: appPath(app), keywords });
    const external = app.home !== "site";
    for (const link of [app.primary, ...(app.links ?? [])]) {
      if (!link) continue;
      add({ group: "Apps", title: link.label, description: external ? app.address ?? app.name : app.name, href: link.href, external, keywords: [app.name, ...keywords] });
    }
  }

  add({ group: "Pages", title: "Home", description: "Every Techies app, security notes, GitHub, and addresses", href: homePath });
  add({ group: "Pages", title: "All apps", description: "Every app in one list", href: appsPath });
  add({ group: "Pages", title: "Changelog", description: "What changed lately", href: "/changelog", keywords: ["release notes", "news", "updates"] });

  for (const pattern of patternCatalog) {
    add({ group: "Patterns", title: pattern.title, description: pattern.description, href: pattern.href, keywords: [pattern.category, "pattern", "component"] });
  }

  for (const section of homeSections) {
    add({ group: "Home page", title: section.label, description: section.description, href: `${homePath}#${section.id}`, keywords: section.keywords });
  }

  return entries;
};
