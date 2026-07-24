# Primitives

Primitives are the current foundation of the Framework. They provide stable values and relationships consumed by Element Guidance, future components, Previews, `tokens.css`, Element treatments, and the Context Document.

Current color, shared fluid viewport, typography scale, spacing scale, radius scale, typography families, and initial Semantic Role mappings are intentional Techies Starter Defaults. They are included in Context Export and remain user-editable.

## Shared fluid viewport

Typography, spacing, and border-radius scales share one minimum and maximum viewport. The editor accepts designer-friendly pixel values; portable output converts them to `rem` using a 16px root basis.

The same viewport also defines minimum and maximum section-size variables. Separate per-system viewports are deliberately avoided so generated scales respond as one system.

## Color

People select and enter colors as hexadecimal values. Framework output converts colors to OKLCH and generates a seven-step named relationship:

1. `lightest`
2. `lighter`
3. `light`
4. base
5. `dark`
6. `darker`
7. `darkest`

Portable CSS defaults to `--color-{name}` and named suffixes. People may change the `color` namespace through the color Naming convention control. The base has no `base` suffix. Multiple colors retain independent scales and appear in the sidebar summary and Design System Preview.

## Semantic color roles

The initial canonical roles are:

- **Primary** — primary brand emphasis.
- **Action** — interactive actions and links.
- **Surface** — default supported surface.
- **Text** — readable content on supported surfaces.
- **Border** — meaningful boundaries and separators.
- **Focus** — keyboard focus indication.

Roles are configurable aliases to palette tokens. Their identifiers form the stable contract consumed by higher-level guidance; their variable namespace defaults to `semantic` and is user-editable. Namespace values become portable slugs. Cross-system collisions receive a visible diagnostic and safe generated suffix rather than overwriting another token. This is an initial set, not a claim that the final Framework taxonomy is complete.

## Typography

Typography supports Automatic and Manual modes with tokens `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, and `4xl`. `m` is the default anchor.

Automatic mode derives minimum and maximum token values from base sizes and independent modular ratios at each end of the shared viewport. Manual mode accepts explicit pixel values in the editor and converts them to `rem` output. Every exported typography token uses `clamp()`, including tokens whose endpoints are equal.

Body, heading, and code families are independent string Tokens selected through searchable Google Fonts comboboxes. Inter is the Starter Default for body and headings; Roboto Mono is the code default. The live catalog combines popular and recently added families from the official Google Fonts Developer API when `GOOGLE_FONTS_API_KEY` is configured. A bundled catalog keeps authoring available without a key or network response.

Each role lists only families that supply its exported weights, either as static variants or through a compatible variable `wght` axis. Discovery metadata remains application-only. `tokens.css` contains the selected family Tokens, generic fallback stacks, and one precise CSS2 request when Google Fonts loading is enabled.

## Spacing

Spacing supports Automatic and Manual modes with tokens `4xs`, `3xs`, `2xs`, `xs`, `s`, `m`, `l`, `xl`, `2xl`, `3xl`, and `4xl`. `m` is the default anchor.

Automatic mode derives the scale from endpoint base sizes and ratios. Manual mode accepts explicit pixel values. Every exported spacing token uses `clamp()` so the output remains structurally fluid even when a token currently has equal endpoints.

## Border radius

Border radius supports Automatic and Manual modes with tokens `xs`, `s`, `m`, `l`, and `xl`, plus optional `full`. `m` is the default anchor. `full` is a stable pill value rather than part of the generated ratio scale.

Radius values use fluid `clamp()` output when endpoints differ. Equal endpoints may remain a static `rem` value because no interpolation occurs.

## Units

- Editor input: pixels for designer familiarity.
- CSS artifacts and Context Implementation Reference: `rem` and `clamp()`.
- Colors: hexadecimal input, OKLCH output.

## Accessibility relationship

Primitives alone do not prove accessibility. The app evaluates configured Semantic Role pairs in relevant Previews. WCAG 2.2 AA is the required floor; applicable AAA text contrast is preferred and reported separately.
