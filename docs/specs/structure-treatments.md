# Structure Element Treatments

## Decision

Promote `address` to Active `1.0.0`. Keep `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, and `search` Native `0.0.0`.

Structure primarily communicates document hierarchy and landmark purpose. Global visual rules for regions would force layout without knowing the owning page, section, or component. The eight Native entries therefore emit no CSS. Their Context guidance records the semantic decision, owner relationship, and accessibility constraints that help a generator choose them correctly.

`address` owns a meaningful portable preference: body-family contact text, normal rather than user-agent italic style, readable line height, and token-backed logical block rhythm. Its exact `:where(address)` base rule uses the same locked CSS-box contract as every other Active Element. It does not own links, page placement, layout, boundaries, colors, or generated content.

## Evidence

Checked 2026-07-23. MDN marks all nine Structure Elements Baseline Widely available:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search>

MDN records `search` as widely available since October 2023. Its Native decision avoids adding redundant `role="search"` and keeps result content outside the search container.

Automated coverage verifies lifecycle parity, the locked Address CSS box, forbidden layout properties, Context inclusion, semantic HTML, and zero CSS for every Native landmark.
