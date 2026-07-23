# Element Treatments Implementation

Status: implemented foundation  
Binding decision: ADR 0015

## Runtime boundary

`buildElementCatalog({ guidance, treatments, tokens })` is the only join between content, executable Treatment metadata, and the effective Token registry. A successful Catalog is deeply immutable and supplies ordered Elements plus `get`, `rule`, and `group` lookups. Diagnostics identify stable Element IDs and Treatment Rule Paths.

The runtime flow is:

1. Astro loads all 92 typed Markdown Guidance entries.
2. Intent modules register executable Definitions.
3. Catalog construction validates the complete inventory.
4. The generic Elements UI, authoring service, controller, preference store, compiler, Preview, and export consume that Catalog.

No runtime layer may infer a Definition from prose or invent CSS for a Native entry.

## Ownership

Markdown owns purpose, use and avoid guidance, semantic HTML, variants, Baseline record, Treatment Version, and Activation Evidence.

Intent modules own immutable selectors and allowed declaration metadata:

- ordinary path: `elementId/ruleId`
- relationship path: `elementId/relationshipId/ruleId`

Selectors use one top-level `:where(...)` envelope. Ordinary rules cannot use combinators. Relationship selectors may use combinators, but their rightmost subject must be the declared target. Runtime preferences can select admitted values or store validated declaration-only CSS; they never persist a selector or compiled CSS.

The CSS box is a strict projection of the selected Definition Rule. It rejects duplicate or unknown properties, `!important`, unadmitted values, and omission of required declarations. Token references retain their Token identity after parsing so accessibility checks and Context export do not lose provenance.

## Lifecycle

| Version | State | Definition | Ordinary CSS/Context |
| --- | --- | --- | --- |
| `0.0.0` | Native | forbidden | excluded |
| `0.x.x` | Draft | required | isolated specimen only |
| `>=1.0.0` | Active | required | included after Activation Evidence |

Activation Evidence contains passing Definition, Baseline, native-behavior, keyboard, focus, and parity checks. Patch and minor changes revalidate affected evidence. A major change requires an explicit migration/review decision.

## Persistence

- Element differences: `techies-tools:framework:element-diffs:v2`
- Rule drafts: `techies-tools:framework:rule-drafts:v2`
- Store schema: `2`
- Rule keys: absolute Treatment Rule Paths

Version-1 relative paths migrate by prefixing the owning Element ID. Invalid paths are quarantined without coercion. A successful subsequent write removes legacy keys.

Stored differences survive a patch or minor Treatment upgrade only after full revalidation against the current Definition. Major-version changes, version rollbacks, and unstable-version mismatches are quarantined for explicit review.

## Accessibility repair

Definitions may declare explicit normal-text, large-text, or non-text contrast checks. Evaluation uses effective resolved colors and full-precision WCAG contrast math; display rounds to two decimals.

Failures are warning-only and app-only. A configured check is never silently omitted when colors cannot be measured or no existing Token can repair it. `evaluateContrastChecks` searches compatible Tokens on both editable declarations and returns at most two existing-token, single-declaration remedies. `prepareAccessibilityRepair` revalidates the selected remedy against current state. Accept persists exactly one validated difference; cancel persists nothing. Both resume the original export action.

Portable artifacts remain exactly `tokens.css`, `elements.css`, and `context.md`. App checker metadata, measurements, and decisions are never serialized.

## Extension checklist

An intent extension must:

1. use only existing compatible Tokens;
2. author meaningful Element-owned CSS or keep the Element Native;
3. register one Definition per non-Native Element;
4. provide stable Rule Paths, specimens, and explicit relationships;
5. preserve native semantics, keyboard behavior, and visible focus;
6. add contrast metadata only where subject and comparison are unambiguous;
7. complete Activation Evidence before assigning a stable version;
8. pass Catalog, authoring, migration, compiler, accessibility, and UI tests.
