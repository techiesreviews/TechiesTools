---
status: accepted
supersedes: ADR-0014 export-artifact count
amends: ADR-0007, ADR-0012, ADR-0015, ADR-0016, ADR-0017
---

# Component layer Framework export

Framework export has four ordered text artifacts: `tokens.css`, `elements.css`, `components.css`, and `context.md`. `components.css` contains only Active Component Guidance, requires `tokens.css` and `elements.css`, and is loaded after both. The optional `framework.zip` contains those exact four files with deterministic bytes and metadata.

Component Guidance owns reusable class-based treatments such as `.btn`. Patterns declare Component dependencies and limit their own CSS to composition, context, and owned descendants. A dependent Pattern Preview loads the shared Component treatment within its isolated Preview scope. Pattern CSS may set documented component custom-property hooks, but must not copy the component's shape, spacing, typography, or interaction treatment.

A Pattern that is explicitly marked as the authoring surface for that same Component is the exception: its non-permanent working copy starts from the canonical Component catalog declarations and nested rules so the editor truthfully shows every rule in use. It does not declare itself as a dependency or create a second hand-authored source.

Native CSS nesting is the preferred authored form when rules share a clear Pattern or Component owner. Nested selectors use `&` explicitly. Pattern validation continues to reject sibling escape and unrelated top-level selectors.

Colors remain role-driven. Components consume Semantic Role variables and contextual component hooks. `light-dark()` belongs at the Semantic Role boundary only when the Framework stores an explicit, validated light/dark pair; components and Patterns do not invent an opposite mode from a single stored color.
