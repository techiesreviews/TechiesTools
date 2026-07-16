# Domain docs

This repository uses a single domain context.

## Before Framework work

- Read root `CONTEXT.md` completely.
- Read `docs/framework/` sources relevant to the task.
- Read accepted ADRs in `docs/adr/` that govern the area.
- Flag conflicts between requested behavior, documented language, and current code before implementation.

## Vocabulary

Use canonical terms from `CONTEXT.md` in issues, specs, tests, and implementation. Avoid synonyms that the glossary explicitly rejects. If a required concept is missing or ambiguous, resolve it through domain modeling before adding it to the glossary.

## Decisions

ADRs live in root `docs/adr/`. Surface contradictions explicitly. Add an ADR only for a hard-to-reverse, surprising decision with a real trade-off.
