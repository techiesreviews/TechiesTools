# 0018 — First-class tools share Settings and Preview chrome

- Status: Accepted
- Date: 2026-07-31

## Context

Framework and Glass Card both need compact settings, route-aware Preview browser chrome, responsive presets, pixel feedback, and export-safe state. Recreating those interactions per tool creates visual drift and separate controller contracts. New tools may also vary in interaction complexity; a repository-wide ban or mandate for React is too coarse.

## Decision

All first-class `/tools/*` experiences use the shared Settings primitives and `PreviewBrowser.astro`. Tool controls remain in the Settings bar unless they directly manipulate the rendered result. Shared primitives own their markup, styling, accessibility state, and generic interaction events; tool controllers own domain state and output compilation.

React is permitted only as a per-tool decision. A tool documents why an isolated React island materially improves a dense interaction graph or required integration. Astro and focused TypeScript modules remain the default for ordinary form-driven tools. React must not replace or fork the shared Settings and Preview contracts.

The tool-authoring preflight and verification contract lives in `docs/tools/authoring.md`.

## Consequences

- Framework and Glass Card render the same browser bar and viewport controls.
- Color, range, segmented, and accordion behavior can improve in one place.
- Existing tool compilers remain framework-agnostic and deterministic.
- React can be used wisely without becoming an automatic dependency or architecture split.
- Tool PRs carry a small up-front control inventory and state-output mapping burden, reducing late UX and export mismatches.
