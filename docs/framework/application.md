# techies.tools Framework application

techies.tools edits and visualizes one Active Framework. It is separate from exported Context Documents, which continue working independently when supplied to an AI.

## Version-one boundary

- One Active Framework.
- Techies Starter Defaults load for a new person.
- The Framework name and stable identifier are user-editable.
- Settings persist locally across screens and sessions.
- Reset restores Starter Defaults.
- CSS, DTCG JSON, and Markdown Context Export provide portability.
- Context Import may propose reviewed changes from a contract-valid Context Document.
- Multiple saved Frameworks, account synchronization, collaboration, and cloud libraries are deferred.

## Interface structure

The persistent Main menu chooses the active tool. The attached Framework sidebar contains contextual settings. Settings are grouped into accordions with compact current-value summaries. Export and direct-copy actions remain anchored at the bottom of the settings sidebar.

The main preview surface uses an address-like control for internal reference views:

- `techies.local/design-system` — Primitives, Semantic Roles, accessibility evidence, and generated values.
- `techies.local/website` — realistic homepage Preview proving that Framework values compose into coherent reusable sections.
- `techies.local/elements` — planned read-only Element Reference generated from typed Markdown guidance.

The address control is the production navigation mechanism for these views. Prototype switchers appear only during explicit Explorations and are removed after Promotion.

## State and portability

Current settings persist in browser-local storage. Export remains the portability boundary: local persistence is convenience, not durable cross-device ownership. Context Documents do not maintain a live connection to techies.tools.

## Preview responsibility

Previews must render current Framework values, not duplicate independent style constants. They provide evidence that preferences work together but do not become the Framework source of truth.
