# Typography Font Sources Are Token Inputs

Status: accepted  
Date: 2026-07-23

## Context

Issue 25 originally excluded font family, weight, line height, and letter spacing until a Primitive model existed. The later product decision requires Google Fonts integration and Immediate Active Starter Defaults. Treating a font source as Element CSS would duplicate imports across rules and mix external-resource policy into every Treatment.

Google Fonts CSS2 accepts stylesheet requests at `https://fonts.googleapis.com/css2`, supports multiple families and explicit weight values, and provides `display=swap`. It does not require an API key. External font delivery still adds a network, privacy, and performance dependency.

## Decision

Typography remains one Token family:

- `typography.family-body` and `typography.family-code` are string Tokens.
- Existing `typography.xs` through `typography.4xl` remain dimension Tokens.
- Font weight, line height, and other reviewed numeric values are closed per-rule choices, not free-form Primitives.
- The Typography settings expose curated Google Fonts body and code families plus an on/off switch.
- Enabled export emits one precise CSS2 `@import` in `tokens.css`, before layer declarations, with only used weights and `display=swap`.
- Every family Token ends with a generic local fallback stack.
- `elements.css` references family Tokens and never emits external-resource URLs.

The Starter Default is Inter for body text and Roboto Mono for code. Disabling Google Fonts keeps those family names first but relies on the local fallback if they are unavailable.

## Consequences

The three-artifact contract stays unchanged. `context.md` embeds the exact `tokens.css`, including font source. Consumers can remove or replace the import while retaining fallback behavior, but direct edits are not round-trippable.

This decision intentionally overrides issue 25's font-family Placeholder constraint. Dynamic Google Fonts directory search remains out of scope because it would require a separate Web Fonts Developer API key and a larger discovery/privacy workflow.
