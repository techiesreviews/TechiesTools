---
status: accepted
amends: ADR-0009
---

# Configurable Framework Variable Namespaces

Framework variable namespaces are user-editable naming conventions. Primitive colors default to `--color-*` and Semantic Roles default to `--semantic-*`, preserving ADR-0009 output for Starter Defaults, while allowing exported CSS and DTCG groups to match an existing codebase's vocabulary.

Semantic Role identifiers remain the stable contract: Primary, Action, Surface, Text, Border, and Focus do not change when their namespace changes. Naming values are normalized to portable slugs. A Semantic Role namespace that collides with the color namespace receives a visible validation diagnostic and a safe `-semantic` suffix in generated output. A color namespace that would collide with a generated typography, radius, or spacing token receives the same treatment with a safe `-color` suffix. DTCG group collisions are deterministically disambiguated so an editable namespace cannot overwrite another token group.

The Preview displays configured variable names. Internally, it bridges configured Semantic Role variables to stable application aliases so existing Preview components continue consuming the same role contract without duplicating independent values.
