# Agent collaboration policy

These instructions apply to every coding or design agent working in this repository.

Before meaningful Framework work, read `CONTEXT.md`, `docs/framework/`, and relevant accepted ADRs in `docs/adr/`. Flag conflicts between requested behavior, documented language, and current code before implementation.

## DRY component and Pattern authoring

Follow [`docs/framework/component-authoring.md`](docs/framework/component-authoring.md) when creating components, Patterns, or feature interfaces.

- Check existing helpers and Component Guidance first. Define reusable defaults once; consume Framework Tokens instead of creating parallel design scales or copying shared treatments.
- Load `utilities.css` before component styles. Apply shared layout, content, media, and typography classes explicitly to the elements that need them.
- Give each component one identifying `name_component` root class. Use shared child helpers instead of component-prefixed duplicates; nested components have their own identifying roots.
- Put component-specific overrides in native `@scope (.name_component) to ([class*="_component"])`; use `:scope` for the root and simple helper selectors for descendants. Keep responsive `@media` rules inside the scope.
- Reserve `_component` for component roots. Scope boundaries stop selector matching, not inheritance; reset inherited values where a nested component needs independence.
- Declare `--_columns: 1` on every `.layout-grid` through the shared helper. Change it only on intended grids; use family selectors only when the entire family should change.
- Choose heading tags for document structure independently of typography classes. Verify supported browsers and nested-component isolation.
- Preserve the shared compiler, editor, persistence, Preview, and export contract when changing this convention. All built-in Patterns use it; do not fall back to duplicated component CSS.

## Agent rules

Kitchen rulebook: `scripts/agents/kit rulebook` (stations, who decides, builder and reviewer pins).
Agent commands: `scripts/agents/kit --help`; `scripts/agents/kit <command> --help` for one.

This project's own agent rules (talking to Lex, constructive dissent, multi-agent handoffs, prototype lifecycle) are in [`docs/agents/kitchen-extras.md`](docs/agents/kitchen-extras.md#agent-rules); `scripts/agents/kit rulebook` prints them after the shared kitchen rulebook. On routing and review (which model builds or reviews, the second look), the shared rulebook wins.

## Agent skills

Skills are the copies installed on Lex's computer; none live in this repository (Lex, 2026-10-30). Never add a skill file or skill text here: `scripts/agents/kit pr` runs a skill guard that refuses a `SKILL.md`, a `skills/` folder or a line of skill text. Agents select the smallest relevant skill set and follow each skill's status and routing instructions.

### Adaptive orchestration

For multi-capability work, use the versioned task-graph contract and evidence gates in `docs/agents/adaptive-orchestration.md`. Select capabilities per task; do not run a fixed agent roster. Builder and reviewer models come from the shared rulebook's pins.

### Issue tracker

Issues, PRDs and wayfinder maps are markdown files in `docs/wayfinder/`, committed on `develop`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five-role triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
