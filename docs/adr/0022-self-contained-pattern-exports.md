---
status: accepted
amends: ADR-0021
---

# Self-contained layered Pattern exports

The product owner requested complete layered exports, then clarified that HTML and CSS must remain separate files. A Pattern download should render without separately obtaining the Framework stylesheets.

## Decision

Pattern CSS exports declare `@layer tokens, elements, utilities, components, patterns;`. The Tokens layer contains the application's canonical starter Tokens followed by the current validated Framework theme variables, preserving configured aliases and fluid expressions. The utilities layer contains the same shared defaults used in Preview, plus an opt-in `.pattern-document` shell for standalone pages. The Components layer includes declared shared dependencies. The Patterns layer contains the current compiler output, including independent nested component scopes.

The `elements` position remains reserved for interoperability with Framework exports. Pattern Preview does not activate global Element Treatments, so the Pattern bundle does not introduce them. Validated theme font imports precede layer blocks and belong to the Tokens layer. Images and external fonts still require their original network resources.

The CSS file contains styles only. The HTML file is a complete document with a relative link to the matching CSS filename. Save both files together and open the HTML file to run the Pattern. Export renaming updates both filenames and the stylesheet link. Pattern ZIPs still contain these two files. Copy, individual download, export preview, and ZIP use one shared artifact compiler.

The editor and live Preview continue to consume local Pattern source, without bundling Tokens into editable component CSS. Theme updates, reset, and storage synchronization refresh an open export dialog. Export reads the live applied theme, including when browser persistence is unavailable.

## Consequences

Pattern CSS is larger, but the two-file package needs no other Framework stylesheets. This amends ADR 0021's requirement to load separate Framework stylesheets for Pattern downloads. Framework export itself remains the existing five-artifact contract. Shared sources remain authoritative; no parallel utility, component, or Token scale is introduced.
