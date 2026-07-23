# Token-backed Treatment Definition contract

> Superseded in part by [ADR 0015](../adr/0015-element-catalog-owns-treatment-runtime.md) and the [Element Treatments implementation spec](../specs/element-treatments-implementation.md). Markdown no longer embeds executable Definitions; intent modules and the Element Catalog own that contract. Actions-specific allowlists and lifecycle flags are obsolete.

Resolved: 2026-07-16

## Decision

A Treatment Definition stores real CSS selectors and property names. It does not translate friendly property aliases such as `textColor` into `color`; AI can read CSS, and that translation would add drift without adding safety.

Safety comes from closed authored schemas and validation:

- people may select only values offered by a Treatment Definition;
- runtime overrides cannot add or edit selectors, properties, or raw CSS;
- selectors, properties, states, token types, and keyword choices are allowlisted;
- only explicit declarations are emitted, leaving every undeclared browser behavior untouched.

One indirection remains necessary: declarations reference stable Framework token IDs such as `semantic.action`, which resolve to the current CSS variable such as `var(--semantic-action)`. Variable naming conventions may change; semantic token identity must not.

## Authoring shape

Treatment Definitions are optional typed frontmatter beside Element Guidance. This example illustrates base, state, variant, relationship, and specimen rules; it is not a promoted Link treatment.

```yaml
treatmentDefinition:
  schemaVersion: 1
  rules:
    - id: base
      kind: base
      selector: ":where(a[href])"
      declarations:
        color:
          label: "Text color"
          control:
            kind: token
            options:
              - { family: semantic, name: action }
              - { family: semantic, name: text }
          starter: { kind: token, family: semantic, name: action }
        text-decoration-line:
          label: "Underline"
          control:
            kind: choice
            options:
              - { value: underline, label: "Show" }
              - { value: none, label: "Hide" }
          starter: { kind: choice, value: underline }

    - id: hover
      kind: state
      state: hover
      selector: ":where(a[href]:hover)"
      declarations:
        color:
          label: "Hover color"
          control:
            kind: token
            options:
              - { family: semantic, name: primary }
              - { family: semantic, name: action }
          starter: { kind: token, family: semantic, name: primary }

    - id: quiet
      kind: variant
      variant: quiet
      selector: ':where(a[href][data-variant="quiet"])'
      when: "Use for lower-emphasis supporting links."
      declarations:
        color:
          label: "Text color"
          control:
            kind: token
            options:
              - { family: semantic, name: text }
          starter: { kind: token, family: semantic, name: text }

  relationships:
    - id: link-in-navigation
      elements: [a, nav]
      when: "A link names a destination in navigation."
      semanticHtml: '<nav aria-label="Primary"><a href="/elements">Elements</a></nav>'
      rules:
        - id: current
          targetElement: a
          selector: ':where(nav a[aria-current="page"])'
          declarations:
            text-decoration-line:
              label: "Current page mark"
              control:
                kind: choice
                options:
                  - { value: underline, label: "Underline" }
              starter: { kind: choice, value: underline }

  specimens:
    - id: default
      label: "Link"
      semanticHtml: '<a href="/elements">Browse element guidance</a>'
      demonstrates: [base, hover]
    - id: navigation
      label: "Current navigation link"
      relationship: link-in-navigation
      demonstrates: [link-in-navigation/current]
```

## Core types

```ts
type TokenFamily =
  | "semantic"
  | "color"
  | "typography"
  | "spacing"
  | "radius";

type TokenValue = {
  kind: "token";
  family: TokenFamily;
  name: string;
};

type ChoiceValue = {
  kind: "choice";
  value: string;
};

type OmitValue = {
  kind: "omit";
};

type SelectedValue = TokenValue | ChoiceValue | OmitValue;

type TokenControl = {
  kind: "token";
  options: Array<Omit<TokenValue, "kind">>;
};

type ChoiceControl = {
  kind: "choice";
  options: Array<{ value: string; label: string }>;
};

type Declaration = {
  label: string;
  description?: string;
  control: TokenControl | ChoiceControl;
  starter: SelectedValue;
  allowOmit?: true;
};

type Rule = {
  id: string;
  selector: string;
  declarations: Partial<Record<AllowedCSSProperty, Declaration>>;
} & (
  | { kind: "base" }
  | {
      kind: "state";
      state:
        | "hover"
        | "focus-visible"
        | "disabled"
        | "invalid"
        | "checked"
        | "open"
        | "selected";
    }
  | { kind: "variant"; variant: string; when: string }
);

type RelationshipRule = {
  id: string;
  targetElement: string;
  selector: string;
  declarations: Partial<Record<AllowedCSSProperty, Declaration>>;
};

type Relationship = {
  id: string;
  elements: string[];
  when: string;
  semanticHtml: string;
  rules: RelationshipRule[];
};

type Specimen = {
  id: string;
  label: string;
  semanticHtml: string;
  demonstrates: string[];
  relationship?: string;
};

type TreatmentDefinition = {
  schemaVersion: 1;
  rules: Rule[];
  relationships?: Relationship[];
  specimens: Specimen[];
};
```

`AllowedCSSProperty` is a closed enum. Initial candidates are logical margin and padding longhands, `color`, `background-color`, `font-size`, logical border longhands, logical corner radii, outline longhands, text alignment and decoration longhands, list style, gaps, and `max-inline-size`. Exact per-element subsets are decided during intent-group design.

## Validation invariants

### Authored structure

1. Rule, relationship, and specimen IDs are stable and unique in their scope.
2. Every specimen reference resolves to an existing rule or relationship rule.
3. Variant rule names match the Element Guidance `variants` collection.
4. A relationship has one owning entry; every named element exists in the inventory.
5. A Starter Default is one exact option from its control, or `{ kind: "omit" }` when the declaration explicitly sets `allowOmit: true`.
6. `{ kind: "omit" }` means do not emit the property and remains available to local overrides and Context Import so one declaration can return to omission without a full Reset. CSS keyword `none` is never used as a substitute for omission.

### Selectors

1. Selectors are authored source, never user input, and must use low-specificity `:where(...)`.
2. A selector parser recursively validates the full selector AST, including functional pseudo-class arguments. Every rule contains exactly one complex selector; `:where()` contains exactly one validated selector argument, not a hidden selector list.
3. The rightmost subject matches the owning canonical element. A relationship rule declares `targetElement`, and its rightmost subject matches that element.
4. State rules contain the canonical pseudo-class or state attribute for their declared state on the subject. Base rules contain no state selector. Variant rules contain the approved hook for their declared variant and no undeclared state selector.
5. Per-element allowlists control attributes, combinators, pseudo-classes, and pseudo-elements.
6. Initial safe pseudo-elements are limited to applicable uses of `::marker`, `::placeholder`, `::backdrop`, and `::file-selector-button`.
7. Reject universal selectors, IDs, unapproved classes, `:has()`, nesting, at-rules, braces, all unapproved selector lists, and selector escape attempts.

### Properties and values

1. Declaration keys are real CSS property names in a global allowlist and a narrower per-element rule allowlist.
2. Initial global exclusions include `all`, `display`, `visibility`, `position`, inset properties, `z-index`, `order`, `pointer-events`, `content`, `appearance`, arbitrary motion/effects, shorthands, `!important`, and URL-bearing properties.
3. A future exception requires explicit element review plus native-behavior and accessibility invariants.
4. Token values must exist in the current registry and match the property's expected type.
5. Keyword values must exactly match an authored closed option. At build time, every authored option and Starter Default also passes the CSS grammar for its property. Reject delimiters, `!important`, URL values, `var()`, unapproved functions, and CSS-wide keywords such as `initial`, `inherit`, `unset`, and `revert` unless that exact property/value pair receives explicit review.
6. No raw strings, arbitrary CSS functions, URLs, or numeric input outside an authored bounded control.
7. Serialization uses parsed, typed values rather than concatenating untrusted strings.

### Native and lifecycle gates

1. Runtime users can change only declaration values exposed by the definition.
2. Hidden inputs receive no visual rules.
3. Rules may not remove focus indication, markers, native operability, or type-specific behavior.
4. Interactive promoted treatments require an explicit `:focus-visible` treatment and validation of applicable disabled, invalid, checked, selected, or open states.
5. Token changes revalidate every active rule; an invalid active definition blocks ordinary export with an Import Diagnostic-style explanation.
6. Baseline Status, Element Guidance maturity, and Treatment Definition activation remain separate inputs to export eligibility. Their exact lifecycle combination is resolved by the lifecycle ticket.
7. Draft treatment CSS is scoped to its specimen preview. Native entries emit no treatment CSS. Ordinary `@layer elements` export includes only explicitly eligible, promoted Treatment Definitions.

## Runtime overrides

Persist only differences from Starter Defaults in a separately versioned state. Never persist control metadata, labels, selectors, properties, or option lists.

```json
{
  "schemaVersion": 1,
  "entries": {
    "a": {
      "rules": {
        "base": {
          "color": {
            "kind": "token",
            "family": "semantic",
            "name": "text"
          }
        }
      }
    }
  }
}
```

Every stored override is revalidated against the current source definition. Reset deletes overrides and reapplies Starter Defaults.

Context Import has the same authority as a runtime override: it may propose a `SelectedValue` only for an existing entry ID, rule ID, and property. It cannot introduce or change selectors, property names, controls, options, specimens, relationships, or other authored Treatment Definition structure. Structural changes require a reviewed source/schema change rather than document round-trip.

## CSS and AI output

Context Export omits editor-only labels and control metadata. For each eligible rule, it includes:

- element intent and applicable `when` guidance;
- exact selector and CSS property;
- stable token reference and resolved current variable;
- exact layered CSS;
- relevant semantic HTML and relationships.

```text
color: semantic.action → var(--semantic-action)
```

```css
@layer elements {
  :where(a[href]) {
    color: var(--semantic-action);
    text-decoration-line: underline;
  }
}
```

This gives AI the semantic reason, stable token intent, and exact implementation without exposing editor internals or duplicating friendly property aliases.

## Future extension

New token families, allowed CSS properties, states, and choice sets are additive schema changes. Font family, weight, line height, letter spacing, heading/body/accent roles, and broader design controls remain excluded until their own Primitive models are designed. The contract can then add those token families without changing existing declarations.
