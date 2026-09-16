---
status: accepted
amends: ADR-0020
---

# Shared utilities and bounded Pattern scopes

The product owner requested shared defaults and bounded component scopes for all existing Patterns. Per-Pattern BEM copies of layout, image, and typography treatment made defaults costly to change and prevented nested components from defining clear style boundaries.

## Decision

All thirteen built-in Patterns use a `name_component` root and shared role helpers. Component-specific rules live in `@scope (.name_component) to ([class*="_component"])`. `:scope` owns root declarations; responsive rules remain with their component. Nested components use independent scopes. Scope limits stop selector matching, not inheritance.

One utility module supplies Preview and a new portable `utilities.css` artifact. The Framework Artifact Set is now exactly five files: `tokens.css`, `elements.css`, `utilities.css`, `components.css`, and `context.md`. The four CSS files load in that order. ZIP packaging preserves their exact bytes; Context embeds all four CSS artifacts; effective utility content participates in the Framework content hash. Existing schema 2 metadata gains the utilities manifest member and load-order entry; no Context importer is currently implemented.

Utilities are opt-in classes and use Framework Tokens. Every `.layout-grid` declares `--_columns: 1`, so nesting cannot accidentally inherit an outer grid's column count. Box sizing applies only within component trees. This introduces no global body or heading reset and does not activate Native Fallback Elements.

The shared Button gains `.button_component`; `.btn` remains a compatibility helper backed by the same catalog treatment. Patterns declare the Button dependency and set contextual `--btn-*` hooks in independent Button scopes. The Button authoring surface still derives its treatment from that catalog.

The compiler validates bounded scopes, keeps arbitrary rules inside the owning component, rejects external-resource CSS, and preserves editable root declarations and controls. Renaming changes the owner, its named containers, and owned keyframes, while reusable helpers and nested component identities remain stable. Native `@scope` support is required for the complete visual treatment.

Existing storage keys remain stable. Legacy class maps translate persisted BEM drafts into scopes while preserving user text and declarations; serialized state version 4 identifies the new source shape. Reset restores the migrated built-in defaults. Preserving a personal draft takes precedence over deleting its redundant declarations.

## Consequences

A shared helper change now reaches every consuming Pattern and portable export. Helper defaults therefore require responsive and nested-component verification. The editor's inspector must distinguish identical selectors, especially `:scope`, by their owning scope. Preview and portable CSS consume identical helper and component source rather than maintaining separate implementations.

Pattern ZIPs remain two files, the Pattern HTML and CSS, and require the Framework stylesheets. Existing four-artifact consumers must include `utilities.css` when adopting migrated Patterns. This supersedes ADR 0020's artifact count and BEM-oriented Pattern nesting preference; its Component ownership and role-driven color decisions remain in force.
