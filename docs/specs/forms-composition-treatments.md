# Forms composition Element Treatments

Status: implemented  
Date: 2026-07-23  
Issue: #26

## Derivation

| Element | Version | Decision | Element-owned rationale |
| --- | --- | --- | --- |
| `form` | `0.0.0` | Native | Submission, validation, and ownership semantics are native. A universal layout would incorrectly move component composition into Element CSS. |
| `label` | `1.0.0` | Active | Type emphasis is a safe label-owned preference; inline behavior and control association remain native. |
| `fieldset` | `1.0.0` | Active | The semantic group owns its boundary, radius, and internal breathing room without owning descendant layout. |
| `legend` | `1.0.0` | Active | The group caption owns concise typographic emphasis and inline breathing room. |
| `output` | `1.0.0` | Active | A calculated result owns typographic emphasis while native form association and status behavior remain unchanged. |

## Label

MDN records `label` as Baseline Widely available and defines explicit `for`/`id` and implicit descendant association. The Treatment changes only typography. It does not alter hit targets, focus forwarding, control naming, or layout.

## Fieldset and legend

MDN records both elements as Baseline Widely available. `fieldset` groups controls and labels; its first `legend` supplies the caption. The Treatment preserves disabled-group behavior and adds no display, grid, flex, positioning, or control-state declarations. Its visible boundary is checked against the fieldset surface as non-text UI; insufficient contrast remains exportable and invokes the existing two-remedy advisory flow.

## Output

MDN records `output` as Baseline Widely available, form-associated, and commonly exposed as a status region. Its value is not submitted. The Treatment adds emphasis only; scripts remain responsible for correct result updates.

## Evidence

- Definition: every Active entry has one catalog-owned `base` rule and a locked `:where(element)` selector.
- Baseline: current MDN pages checked 2026-07-23.
- Native behavior: no declaration changes association, grouping, validation, disabled propagation, submission, or status behavior.
- Keyboard and focus: composition elements gain no custom interaction or focus suppression.
- Reflow: logical spacing and fluid Tokens preserve zoom and writing-mode behavior.
- Parity: one Definition drives settings, specimen CSS, `elements.css`, and `context.md`.
