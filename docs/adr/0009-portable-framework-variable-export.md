---
status: accepted
supersedes: ADR-0002
amended-by: ADR-0012, ADR-0014
---

# Portable Framework Variable Export

Framework export uses portable, descriptive variables rather than CoreFramework-specific shorthand. Primitive colors use `--color-{name}` with named relative steps (`lightest`, `lighter`, `light`, base, `dark`, `darker`, `darkest`); role aliases use `--semantic-*`; typography, radius, and spacing retain their own named fluid scales. ADR 0014 retains this CSS naming contract while replacing the earlier parallel token-format decision with the three-artifact Framework export.
