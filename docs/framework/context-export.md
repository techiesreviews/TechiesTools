# Context Export

Context Export produces `context.md`: the self-contained Markdown member of one synchronized Framework Artifact Set. It can be supplied to an AI without either CSS sibling or techies.tools.

## Authoring model

People maintain focused Markdown sources rather than editing the generated export. Element Guidance uses one file per entry with validated YAML frontmatter for identifiers, intent groups, Treatment Version, independent Activation Evidence, and allowed variants. Prose records purpose, treatment, constraints, accessibility guidance, positive usage, anti-patterns, and examples.

Only Active Treatments become ordinary positive guidance. Draft `0.x.x` entries and Native `0.0.0` entries are excluded. A stable Treatment Version remains excluded whenever any independent Activation Evidence gate is incomplete.

## Generated document

The generated document is ordered for AI consumption:

1. Machine-readable Framework identity, version, schema, and source revision metadata.
2. Framework identity and design intent.
3. Primitives and semantic roles.
4. Element Guidance grouped by intent.
5. Component Guidance when introduced.
6. Section and page-composition guidance when introduced.
7. Accessibility requirements.
8. Global do / avoid rules.
9. Artifact manifest followed by an Implementation Reference containing exact full copies of `tokens.css` and `elements.css`, plus semantic HTML examples.

## Editing rule

`context.md` is generated output and not the internal authoring source for techies.tools. It operates independently when supplied to an AI. An AI may propose preference changes inside the document and update its Framework Version, but those changes affect techies.tools only through a validated Context Import and explicit review.

## Portability

Intent and constraints are implementation-independent. The Implementation Reference demonstrates the preferred outcome in web-native terms; consuming agents translate that outcome into React, Astro, native HTML/CSS, Elementor, Bricks, or another requested harness.

## Standards references

The Context Document directs capable agents to current external references instead of freezing changeable platform guidance into the export:

- **Website Specification MCP** — `https://mcp.specification.website/mcp`. Query it for current platform-agnostic website requirements, implementation guidance, checklists, and topic changes. The endpoint is read-only and exposes structured search, topic, category, checklist, and change tools.
- **MDN Web Docs** — `https://developer.mozilla.org/`. Use MDN to confirm current HTML semantics, attributes, content models, CSS behavior, Web APIs, examples, and browser compatibility.

If MCP access is unavailable, use the human-readable Website Specification at `https://specification.website/`. If live documentation access is unavailable, follow the Context Document and Native Fallback without inventing unsupported platform behavior.

Standards References own technical correctness and current platform behavior. Framework guidance owns design intent and preference. A consuming AI must not use generic examples from a Standards Reference to silently replace a Default Treatment.

### Lookup policy

Live standards lookup is conditional during generation. Query current references when using unfamiliar or recently introduced platform features, when browser support matters, when accessibility behavior is uncertain, when implementing forms, dialogs, media, security, SEO, or performance behavior, or when guidance explicitly requests verification.

Every completed interface receives a final standards audit. The audit checks relevant Website Specification requirements and MDN-backed semantics, behavior, and compatibility without replacing Framework preferences.

Accessibility audits use WCAG 2.2 Level AA as a required floor and report applicable AAA text-contrast targets separately. They must not summarize partial automated checks as whole-page conformance.

Context Export includes portable accessibility intent and required semantic color relationships. It excludes visualization-only checker metadata, measured DOM evidence, tooltip/popover state, and app-specific contrast instrumentation.

## Identity and versioning

Every Context Export uses schema 2 and begins with machine-readable metadata:

```yaml
frameworkId: techies
frameworkName: Techies Framework
frameworkVersion: 0.1.0
schemaVersion: 2
sourceRevision: <git revision>
contentHash: <deterministic effective-content hash>
```

`frameworkVersion` changes when effective preference content changes. `schemaVersion` changes when the Context Document structure or parsing contract changes. `sourceRevision` traces the export to its exact repository state. `contentHash` identifies byte-stable effective Framework content. Generated artifacts contain no timestamp, so unchanged effective content remains byte-identical. When an AI receives multiple exports with the same Framework ID but conflicting versions, it must surface the conflict instead of silently combining them.

New Frameworks default to `Techies Framework` with the stable identifier `techies`. People may change both values; identifiers are normalized to a portable slug and remain stable across later exports unless explicitly renamed.

Unresolved placeholders are excluded or explicitly marked unresolved. Context Export must not promote implementation defaults into personal preference merely because the Preview needs a temporary value.

### Framework version changes

- **Patch** — adjusted value, wording, constraint, or preference without expanding the guidance surface.
- **Minor** — added Active Element, component, section guidance, or backward-compatible field.
- **Major** — removed or renamed a guidance contract, or changed established meaning incompatibly.
- **Schema version** — changes only when the Context Document parsing or structural contract changes.

An AI editing a Context Document proposes the Framework Version change. Context Import validates the proposed bump against the actual diff. An incorrect bump produces an Import Diagnostic and scoped Repair Prompt rather than being silently accepted.

## Optional round trip

techies.tools and an exported Context Document do not maintain a live connection. The export remains useful on its own for Generative UI.

When an AI changes preferences, it proposes the appropriate patch, minor, or major Framework Version from the actual diff and preserves all required Framework Definitions. The changed document may later be submitted as a Context Import. techies.tools validates identity, schema version, source version, stable entry identifiers, required guidance fields, parseable implementation references, and the proposed version bump before showing a preference diff. Nothing is applied automatically.

Documents that no longer follow required Framework Definitions cannot be imported. They remain usable as standalone AI context, but techies.tools cannot safely infer how their free-form changes map back to Framework sources.

### Validation behavior

- Missing or incompatible required core definitions reject the import.
- Unknown custom sections are preserved as extensions and produce a warning.
- Invalid guidance entries are isolated so valid entries remain reviewable.
- Version conflicts require explicit user resolution.
- Free-form prose is never guessed into structured preference changes.

Every failure produces an Import Diagnostic containing the violated rule, affected document location, received value, reason safe import is impossible, expected form, and concrete repair steps. Diagnostics also provide a copyable Repair Prompt that includes only the affected definition and instructs an AI to preserve all unrelated content. Repairs are never applied silently.
