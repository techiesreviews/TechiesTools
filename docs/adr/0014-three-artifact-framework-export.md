---
status: accepted
supersedes: ADR-0009 export-format decision
amends: ADR-0007, ADR-0012
---

# Three-artifact Framework export

Framework export has exactly three text artifacts: `tokens.css`, `elements.css`, and `context.md`. `tokens.css` contains only the Token layer. `elements.css` contains only Active Element Treatments and requires `tokens.css` first. When no Treatment is Active, it records Native Fallback without emitting an empty Element layer. `context.md` carries the portable guidance, a three-file manifest and load order, provenance, and exact copies of both CSS artifacts.

The optional `framework.zip` download contains those same three files at its root with deterministic bytes and metadata. The compiler owns every artifact and package byte; the interface only copies or downloads compiler results.

DTCG JSON is removed from the product contract. Configurable variable namespaces continue to affect CSS custom-property names, but no parallel token serialization exists.
