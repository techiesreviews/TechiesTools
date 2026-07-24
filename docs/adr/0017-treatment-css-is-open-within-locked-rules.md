# Treatment CSS Is Open Within Locked Rules

Status: accepted  
Date: 2026-07-24

## Context

ADR 0015 made the Element Catalog the Treatment runtime and described each Treatment Definition as an authored declaration allowlist. That coupled the CSS editor to starter metadata: a valid declaration could be rejected because its property, value, duplicate position, or `!important` marker was not predeclared. Every Element CSS box therefore behaved differently according to Catalog coverage, and adding ordinary CSS required a source-code change.

People need one predictable CSS authoring surface. The Catalog must still own semantic rule identity, immutable selectors, lifecycle, specimens, and accessibility evidence, but it should not decide which valid declaration-list CSS a person may write.

## Decision

Each Treatment Rule continues to lock its selector and braces. Inside that boundary:

- the CSS editor accepts arbitrary syntactically contained declaration-list CSS, including custom properties, duplicate declarations, literal values, unsupported values, and `!important`; browser CSS support determines its effect;
- Treatment Definition declarations provide starter source, autocomplete priority, token provenance when recognizable, and contrast-check metadata; they are not an editing allowlist;
- all Framework Tokens remain available as completions, with rule-relevant Tokens ranked first;
- accepted source is persisted for that Treatment Rule and compiled into Preview, `elements.css`, and `context.md` when its lifecycle is Active;
- Draft Treatments render accepted source only in their isolated Element Reference specimen and remain outside portable artifacts;
- selector, brace, and at-rule injection remain impossible because parsing occurs in declaration-list context;
- external-resource functions remain blocked so exported Framework CSS stays self-contained;
- unclosed or escaped syntax remains a saved draft while Preview and export retain the last valid compilation and its CSS;
- contrast checks use the last effective declaration when a property occurs more than once, matching CSS cascade order.

## Consequences

Every Element CSS box can use the same editor component and behavior. Catalog additions no longer gate ordinary CSS authoring. Completion and repair metadata remain useful without restricting source. Some arbitrary declarations cannot participate in automatic token provenance or contrast repair; they still compile, and unresolved contrast is reported as a non-blocking advisory.

This ADR supersedes ADR 0015 only where that ADR calls a Treatment Definition an authored declaration allowlist. The Catalog, lifecycle, selector ownership, persistence paths, and three-artifact export contract remain unchanged.
