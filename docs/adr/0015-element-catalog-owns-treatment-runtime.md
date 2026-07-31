# Element Catalog Owns The Treatment Runtime

Status: accepted  
Date: 2026-07-23

## Context

The first editable Treatments were Link and Button. Their Markdown frontmatter embedded executable definitions, the model contained an Actions-only allowlist, browser events used `framework-actions:*`, and persisted rules used local IDs. Extending that shape would duplicate policy for every intent and allow Guidance, controls, compilation, and persistence to drift.

## Decision

One immutable **Element Catalog** joins typed Markdown **Element Guidance**, source-controlled intent **Treatment modules**, and the effective Token registry by stable Element ID.

- Markdown owns semantic guidance, Treatment Version, Baseline data, and typed Activation Evidence.
- `src/framework/treatments/<intent>/` owns executable selectors, declaration metadata, relationships, specimens, and contrast-check metadata.
- A Treatment Definition is the authored allowlist. No central Element-name allowlist exists.
- Every editable or persisted rule uses a **Treatment Rule Path**: `element/rule` or `element/relationship/rule`.
- Catalog construction validates one-to-one joins, lifecycle coherence, immutable low-specificity selectors, Element-owned properties, existing Token values, relationships, specimens, and interactive focus treatment.
- Authoring, persistence, compilation, controller state, and UI generation consume the Catalog.
- Browser events use the `framework-elements:*` namespace.

Lifecycle is version-led and exact:

- `0.0.0` is **Native** and cannot have a Definition.
- `0.x.x` is **Draft**, has a Definition, and renders only in an isolated specimen.
- `1.0.0` or later is **Active**, has a Definition and complete source-controlled Activation Evidence, and may enter `elements.css` and portable Context.

Preference persistence uses schema/key version 2 and absolute Treatment Rule Paths. Valid version-1 data migrates at the read boundary; the next successful write removes the legacy key.

Contrast evaluation is app-only and non-blocking. A failing explicit check says **Contrast can be improved.** and exposes **See improvements**. At most two single-declaration remedies use existing compatible Tokens and show their calculated WCAG rating. Accept revalidates, applies one cloned difference, compiles, persists once, and resumes the pending export. Cancel writes nothing and resumes the unchanged export. Checker metadata and decisions never enter `context.md`.

## Consequences

Adding an intent means adding Treatment modules and registering them; compiler, authoring, persistence, and UI infrastructure do not gain Element-specific branches. Native Fallback is explicit rather than an unfinished Draft. Stable versions require evidence stored beside Guidance. Version-1 Element preferences remain recoverable without retaining the old runtime contract.

This ADR supersedes the Actions-specific executable-definition and lifecycle portions of the July 16 Treatment Definition research. It amends ADR 0011's inventory lifecycle wording. ADR 0014's three-artifact export contract remains unchanged.
