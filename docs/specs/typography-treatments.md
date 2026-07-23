# Typography Element Treatments

Status: implemented  
Binding decisions: ADR 0015, ADR 0016  
Evidence date: 2026-07-23

## Derivation rubric

Each Typography inventory entry was checked against its linked MDN HTML reference and the Minimal Treatment rubric. Active means the Element owns a meaningful visual rule beyond an inheritance or user-agent restatement. Native means the browser behavior is already the correct Default Treatment.

All Active rules use low-specificity `:where(...)`, existing semantic/spacing/radius/type-size Tokens, the two reviewed typography family Tokens, and closed values. They preserve semantic HTML, text reflow at zoom, and native inline/block behavior.

## Headings

| Element | Disposition | Derivation |
| --- | --- | --- |
| `h1`–`h6` | Active `1.0.0` | A shared body family, deliberate hierarchy scale, line height, weight, and logical block rhythm are meaningful Element-owned defaults. Heading level remains structural, never a size selector. |

Evidence: [MDN Heading Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements). Tests verify strict selectors, descending size Tokens, wrapping-safe declarations, and no interactive behavior.

## Prose and inline semantics

| Element | Disposition | Derivation |
| --- | --- | --- |
| `p` | Active `1.0.0` | Body family, readable measure, line height, and logical rhythm form the prose baseline. |
| `strong` | Active `1.0.0` | Reviewed strong weight reinforces importance without changing semantics. |
| `em` | Active `1.0.0` | Reviewed italic treatment reinforces stress emphasis. |
| `small` | Active `1.0.0` | A bounded smaller type Token and readable line height are meaningful. |
| `mark` | Active `1.0.0` | Semantic colors, compact padding, radius, and explicit contrast metadata make relevance visible. |
| `abbr` | Active `1.0.0` | Dotted underline and offset visibly identify an available expansion without relying on hover. |
| `time` | Native `0.0.0` | No meaningful generic visual distinction exists; Context explains when machine-readable time is appropriate. |

Evidence: each entry's MDN `sourceUrl`. Mark contrast is measured app-side and export remains available with existing-token remedies.

## Quotations

| Element | Disposition | Derivation |
| --- | --- | --- |
| `blockquote` | Active `1.0.0` | Type scale, logical quote rule, padding, and rhythm distinguish extended quoted material. |
| `q` | Native `0.0.0` | Browser-generated language-aware quotation marks are the correct treatment; authored quote CSS risks duplicate punctuation. |
| `cite` | Active `1.0.0` | A bounded citation style and supporting size distinguish a work title without changing its meaning. |

Evidence: each entry's MDN `sourceUrl`. Tests ensure `q` emits no CSS and its Context guidance preserves native quotation behavior.

## Code and preformatted content

| Element | Disposition | Derivation |
| --- | --- | --- |
| `code` | Active `1.0.0` | The code-family Token and bounded size distinguish code fragments. |
| `pre` | Active `1.0.0` | Code family, preserved whitespace, local horizontal overflow, padding, surface, and contrast are meaningful and prevent page-wide overflow. |
| `kbd` | Active `1.0.0` | Code family, border, radius, and compact logical padding distinguish user input. |

Evidence: each entry's MDN `sourceUrl`. Tests require `white-space: pre`, `overflow-x: auto`, no clipping rule, and Google Fonts fallback Tokens.

## Thematic break

| Element | Disposition | Derivation |
| --- | --- | --- |
| `hr` | Active `1.0.0` | A logical block-start border and block rhythm style the semantic topic shift without decorative layout CSS. |

Evidence: [MDN hr](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr).

## Google Fonts integration

Google Fonts CSS2 is requested once from `tokens.css` with explicit body/code families, explicit weights, and `display=swap`. The request follows the [Google Fonts CSS2 API syntax](https://developers.google.com/fonts/docs/css2). Family Tokens always include generic local fallbacks.
