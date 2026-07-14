---
status: accepted
supersedes: ADR-0002
---

# Portable Framework Variable Export

Framework export now uses portable, descriptive variables rather than CoreFramework-specific shorthand. Primitive colors use `--color-{name}` with named relative steps (`lightest`, `lighter`, `light`, base, `dark`, `darker`, `darkest`); role aliases use `--semantic-*`; typography, radius, and spacing retain their own named fluid scales. CSS and DTCG JSON remain implementation references, while the broader Markdown Context Export carries framework-agnostic intent and guidance.
