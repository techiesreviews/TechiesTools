# techies.tools Framework application

techies.tools edits and visualizes one Active Framework. It is separate from exported Context Documents, which continue working independently when supplied to an AI.

## Version-one boundary

- One Active Framework.
- Techies Starter Defaults load for a new person.
- The Framework name and stable identifier are user-editable.
- Settings persist locally across screens and sessions.
- Reset restores Starter Defaults.
- Compiled Primitives from the Active Framework theme every techies.tools route through stable application aliases.
- `tokens.css`, `elements.css`, and `context.md` provide portability as separate deterministic artifacts.
- Context Import may propose reviewed changes from a contract-valid Context Document.
- Multiple saved Frameworks, account synchronization, collaboration, and cloud libraries are deferred.

## Interface structure

The persistent Main menu chooses the active tool. The attached Framework settings bar contains contextual settings grouped into accordions with compact current-value summaries. Export and direct-copy actions remain anchored at the bottom of the Framework settings bar.

The main preview surface uses an address-like control for internal reference views:

- `techies.local/framework/design-system` — Primitives, Semantic Roles, accessibility evidence, and generated values.
- `techies.local/framework/homepage` — realistic homepage Preview proving that Framework values compose into coherent reusable sections.
- `techies.local/framework/elements` — searchable Element Reference generated from typed Markdown guidance and current Treatment evidence.

The address control is the production navigation mechanism for these views. Prototype switchers appear only during explicit Explorations and are removed after Promotion.

## State and portability

Current settings persist in browser-local storage. Export remains the portability boundary: local persistence is convenience, not durable cross-device ownership. Context Documents do not maintain a live connection to techies.tools.

The application also persists the latest validated Primitive theme for its own routes. Configured variable names remain available, while stable Primitive IDs bridge Semantic Roles, typography, spacing, and radius to application aliases. Active Element Treatment CSS remains Preview-scoped. Reset is a protected recovery control outside the live theme and clears the persisted site theme before restoring Starter Defaults.

## Preview responsibility

Previews must render current Framework values, not duplicate independent style constants. Configured Semantic Role namespaces are bridged to stable internal role aliases with the same values so existing Preview components remain consumers of the role contract. Previews provide evidence that preferences work together but do not become the Framework source of truth.
