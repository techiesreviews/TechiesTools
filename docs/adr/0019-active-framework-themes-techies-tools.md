---
status: accepted
amends: ADR-0012
---

# Active Framework themes techies.tools

The compiled Primitives of the Active Framework theme every techies.tools route. The compiler publishes its validated Token registry to a small persisted site-theme bridge. That bridge keeps configured variable names available and also maps stable Primitive IDs to the canonical application aliases for Semantic Roles, typography, spacing, and radius. A naming-convention change therefore never disconnects the application from the Active Framework.

Only compiled Primitives cross this boundary. Active Element Treatment selectors remain scoped to Framework Preview content; they do not restyle Main-menu, Settings-bar, or tool controls.

Reset is a recovery control, not a design specimen. It remains in the non-scrolling Settings-bar header and uses a protected system font, neutral palette, visible focus ring, and bounded touch target. Reset clears the persisted site theme before restoring Starter Defaults, so extreme or inaccessible Framework choices cannot hide the recovery path.
