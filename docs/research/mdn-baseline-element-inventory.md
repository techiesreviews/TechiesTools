# MDN Baseline audit for the Element inventory

Checked: 2026-07-16

## Question

Which entries in `src/content/elements/*.md`, including every `input` type subentry, does MDN currently classify as Baseline Widely available, Baseline Newly available, or Limited availability?

This report records browser compatibility only. It must not change or imply a change to Element Guidance `status`. A `draft` entry remains draft until Promotion, even when its Baseline status is `widely-available`.

## Method

The audit checked the current rendered Baseline badge on the official MDN page already named by each entry's `sourceUrl`. MDN defines:

- **Widely available**: consistent support in every Baseline browser for at least 2.5 years.
- **Newly available**: works in at least the latest stable version of every Baseline browser, but may fail on older browsers and devices.
- **Limited availability**: not yet available in every Baseline browser.

MDN also warns that Baseline summarizes browser support; it does not replace accessibility, usability, performance, security, assistive-technology, or other testing. See [MDN's Baseline compatibility definition](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility). MDN compatibility tables and badges are backed by its Browser Compatibility Data workflow; see [MDN's BCD documentation](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Page_structures/Compatibility_tables).

Classification rules used here:

1. Copy the badge displayed by the entry's own MDN page.
2. Do not infer a child feature's status from a parent page. This is especially important for `input` types: the [`input` parent page](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) is Widely available but explicitly notes that some parts vary in support.
3. When the entry's own MDN page displays no Baseline badge, record `unknown/not-applicable`. Absence of a badge is not evidence of Limited availability or Wide availability.
4. A badge marked with `*` still maps to its displayed headline status. The asterisk means some parts may have different support and must be checked before relying on those parts.

## Result

| Status | Entries | Meaning for this project |
| --- | ---: | --- |
| `widely-available` | 87 | Eligible for consideration for global CSS, but only after an explicit Treatment Definition and Promotion. |
| `newly-available` | 0 | None in the current inventory at this check date. |
| `limited-availability` | 3 | Keep compatibility constraints explicit; do not treat the native control as uniformly available. |
| `unknown/not-applicable` | 2 | No Baseline badge appeared on the entry's own MDN page; require manual recheck before compatibility-dependent Promotion. |

The three Limited availability entries are [`datalist`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist), [`input[type="month"]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month), and [`input[type="week"]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week).

The two entries without an MDN Baseline badge are [`input[type="checkbox"]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox) and [`input[type="color"]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color). Both pages cover compatibility-sensitive subfeatures, so this audit deliberately does not infer Wide availability from the parent `input` page.

## Full inventory

### Structure

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `address` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/address) | `widely-available` |
| `article` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article) | `widely-available` |
| `aside` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/aside) | `widely-available` |
| `footer` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/footer) | `widely-available` |
| `header` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header) | `widely-available` |
| `main` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/main) | `widely-available` |
| `nav` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/nav) | `widely-available` |
| `search` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search) | `widely-available` |
| `section` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/section) | `widely-available` |

### Typography

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `abbr` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/abbr) | `widely-available` |
| `blockquote` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/blockquote) | `widely-available` |
| `cite` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/cite) | `widely-available` |
| `code` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/code) | `widely-available` |
| `em` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/em) | `widely-available` |
| `h1` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `h2` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `h3` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `h4` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `h5` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `h6` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements) | `widely-available` |
| `hr` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr) | `widely-available` |
| `kbd` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/kbd) | `widely-available` |
| `mark` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/mark) | `widely-available` |
| `p` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p) | `widely-available` |
| `pre` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre) | `widely-available` |
| `q` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/q) | `widely-available` |
| `small` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/small) | `widely-available` |
| `strong` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/strong) | `widely-available` |
| `time` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/time) | `widely-available` |

### Lists

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `dd` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dd) | `widely-available` |
| `dl` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dl) | `widely-available` |
| `dt` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dt) | `widely-available` |
| `li` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/li) | `widely-available` |
| `ol` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol) | `widely-available` |
| `ul` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ul) | `widely-available` |

### Actions

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `a` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a) | `widely-available` |
| `button` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) | `widely-available` |

### Media

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `audio` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio) | `widely-available` |
| `figcaption` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption) | `widely-available` |
| `figure` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure) | `widely-available` |
| `img` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img) | `widely-available` |
| `picture` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture) | `widely-available` |
| `source` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source) | `widely-available` |
| `track` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track) | `widely-available` |
| `video` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) | `widely-available` |

### Data

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `caption` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/caption) | `widely-available` |
| `data` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/data) | `widely-available` |
| `meter` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meter) | `widely-available` |
| `progress` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress) | `widely-available` |
| `table` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table) | `widely-available` |
| `tbody` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tbody) | `widely-available` |
| `td` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/td) | `widely-available` |
| `tfoot` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tfoot) | `widely-available` |
| `th` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th) | `widely-available` |
| `thead` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/thead) | `widely-available` |
| `tr` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/tr) | `widely-available` |

### Forms: parent and non-input entries

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `datalist` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/datalist) | `limited-availability` |
| `fieldset` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/fieldset) | `widely-available` |
| `form` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form) | `widely-available` |
| `input` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input) | `widely-available` |
| `label` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label) | `widely-available` |
| `legend` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/legend) | `widely-available` |
| `optgroup` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/optgroup) | `widely-available` |
| `option` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option) | `widely-available` |
| `output` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output) | `widely-available` |
| `select` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select) | `widely-available` |
| `textarea` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea) | `widely-available` |

### Forms: input type subentries

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `input[type="button"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/button) | `widely-available` |
| `input[type="checkbox"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox) | `unknown/not-applicable` |
| `input[type="color"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color) | `unknown/not-applicable` |
| `input[type="date"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date) | `widely-available` |
| `input[type="datetime-local"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/datetime-local) | `widely-available` |
| `input[type="email"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/email) | `widely-available` |
| `input[type="file"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) | `widely-available` |
| `input[type="hidden"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/hidden) | `widely-available` |
| `input[type="image"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/image) | `widely-available` |
| `input[type="month"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/month) | `limited-availability` |
| `input[type="number"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number) | `widely-available` |
| `input[type="password"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/password) | `widely-available` |
| `input[type="radio"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/radio) | `widely-available` |
| `input[type="range"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/range) | `widely-available` |
| `input[type="reset"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/reset) | `widely-available` |
| `input[type="search"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search) | `widely-available` |
| `input[type="submit"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/submit) | `widely-available` |
| `input[type="tel"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel) | `widely-available` |
| `input[type="text"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/text) | `widely-available` |
| `input[type="time"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/time) | `widely-available` |
| `input[type="url"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/url) | `widely-available` |
| `input[type="week"]` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/week) | `limited-availability` |

### Disclosure and dialogs

| Entry | MDN evidence | Baseline status |
| --- | --- | --- |
| `details` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details) | `widely-available` |
| `dialog` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) | `widely-available` |
| `summary` | [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary) | `widely-available` |

## Proposed typed frontmatter

Add an independent `baseline` object. Do not reuse or mutate the existing Element Guidance `status` field.

```yaml
baseline:
  status: "widely-available"
  source: "mdn"
  sourceUrl: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header"
  checkedAt: "2026-07-16"
  note: "Optional; required when status is unknown/not-applicable."
```

Suggested Astro content schema:

```ts
const baselineSchema = z
  .object({
    status: z.enum([
      "widely-available",
      "newly-available",
      "limited-availability",
      "unknown/not-applicable",
    ]),
    source: z.literal("mdn"),
    sourceUrl: z.string().url(),
    checkedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    note: z.string().min(1).optional(),
  })
  .superRefine((baseline, context) => {
    if (baseline.status === "unknown/not-applicable" && !baseline.note) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Unknown Baseline status requires an explanation.",
      });
    }
  });
```

Rationale:

- The nested object prevents compatibility metadata from being confused with guidance maturity.
- `sourceUrl` preserves per-entry evidence, including input type pages rather than only the parent `input` page.
- `checkedAt` makes time-sensitive data auditable.
- `note` records missing badges, asterisks, or a deliberate `not-applicable` decision without weakening the typed status.
- `source: "mdn"` enforces the project's MDN-only decision and leaves no room for silently mixing another compatibility authority into this field.

The existing top-level `sourceUrl` may remain the semantic guidance source. Duplicating the URL inside `baseline` is intentional: future guidance research and compatibility evidence may no longer share exactly the same page.

## Refresh policy

1. **Promotion gate:** recheck the entry's own MDN page immediately before promoting a Treatment Definition or enabling its global CSS.
2. **Quarterly inventory refresh:** recheck all entries every three months. Baseline classifications can change over time, including automatic movement from Newly to Widely available after the 2.5-year support window.
3. **Focused refresh:** recheck when MDN changes the entry page, when an implementation relies on a compatibility-sensitive attribute/state, or when browser testing contradicts the stored status.
4. **Unknown policy:** never inherit the parent element's badge. Keep `unknown/not-applicable` until the child page gains a badge or a separate, explicitly reviewed MDN evidence path is recorded.
5. **Asterisk policy:** retain the headline status, but recheck every subfeature used by the proposed Treatment Definition. A Widely available element does not make every attribute, method, pseudo-class, or interaction state Widely available.
6. **No automatic Promotion:** a refresh may update only the `baseline` object. It must never change Element Guidance `status`, activate a Treatment Definition, or add CSS to ordinary export without the existing human Promotion decision.

## Implementation consequence

MDN Baseline answers whether a feature is broadly available; it does not define the Framework's taste. Therefore:

- `widely-available` is a compatibility eligibility signal, not a Default Treatment.
- Only entries with an explicit, reviewed Treatment Definition may produce global CSS.
- `draft` and Native entries remain excluded from ordinary export regardless of Baseline status.
- Limited or unknown entries require an explicit compatibility strategy and browser/assistive-technology verification before Promotion.
