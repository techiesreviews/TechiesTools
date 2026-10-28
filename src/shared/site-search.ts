/** One place the site search can take you. Built on the server, matched in the browser. */
export interface SiteSearchEntry {
  group: string;
  title: string;
  description: string;
  href: string;
  /** Opens another techies.tools address in a new tab. */
  external?: boolean;
  /** Extra words that should find this entry without being shown. */
  keywords?: readonly string[];
}

export const normalizeSearchText = (text: string): string =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();

const scoreEntry = (entry: SiteSearchEntry, query: string, words: readonly string[]): number => {
  const title = normalizeSearchText(entry.title);
  const description = normalizeSearchText(entry.description);
  const keywords = normalizeSearchText((entry.keywords ?? []).join(" "));
  const titleWords = title.split(/[^\p{L}\p{N}]+/u);
  let score = title === query ? 100 : title.startsWith(query) ? 60 : 0;
  for (const word of words) {
    if (titleWords.some((titleWord) => titleWord.startsWith(word))) score += 20;
    else if (title.includes(word)) score += 10;
    else if (keywords.includes(word)) score += 4;
    else if (description.includes(word)) score += 2;
    else return 0;
  }
  return score;
};

/** Every entry for an empty query; otherwise only entries that contain every word, best match first. */
export const searchSite = (entries: readonly SiteSearchEntry[], rawQuery: string): SiteSearchEntry[] => {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [...entries];
  const words = query.split(" ");
  return entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, query, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ entry }) => entry);
};
