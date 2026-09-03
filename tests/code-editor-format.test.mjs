import assert from "node:assert/strict";
import test from "node:test";

import { formatCss, formatHtml } from "../src/code-editor/format.ts";

test("HTML formatting uses tabs without splitting inline phrasing content", () => {
  const source = `<article class="card">
    <header>
      <h3>House <strong>$250</strong></h3>
    </header>
  </article>`;

  assert.equal(formatHtml(source), `<article class="card">
	<header>
		<h3>House <strong>$250</strong></h3>
	</header>
</article>`);
});

test("HTML formatting indents multiline attributes with tabs", () => {
  const source = `<article>
  <img
    src="house.jpg"
    alt="House"
  >
</article>`;

  assert.equal(formatHtml(source), `<article>
	<img
		src="house.jpg"
		alt="House"
	>
</article>`);
});

test("HTML formatting expands compact nested blocks without splitting phrasing content", () => {
  const source = `<article><div><p>House <strong>$250</strong></p></div></article>`;

  assert.equal(formatHtml(source), `<article>
	<div>
		<p>House <strong>$250</strong></p>
	</div>
</article>`);
});

test("HTML formatting expands compact definition and table structures", () => {
  assert.equal(formatHtml(`<dl><dt>Term</dt><dd>Definition</dd></dl>`), `<dl>
	<dt>Term</dt>
	<dd>Definition</dd>
</dl>`);
  assert.equal(formatHtml(`<table><caption>Data</caption><colgroup><col></colgroup><tbody><tr><td>One</td></tr></tbody></table>`), `<table>
	<caption>Data</caption>
	<colgroup><col></colgroup>
	<tbody>
		<tr>
			<td>One</td>
		</tr>
	</tbody>
</table>`);
});

test("HTML formatting preserves whitespace-sensitive element content", () => {
  const source = `<article><pre>  first
    second
</pre><textarea>  authored
 value</textarea></article>`;
  const formatted = formatHtml(source);

  assert.match(formatted, /<pre>  first\n    second\n<\/pre>/);
  assert.match(formatted, /<textarea>  authored\n value<\/textarea>/);
});

test("HTML formatting restores nested protected content without placeholder collisions", () => {
  const source = `<article><x-code-raw-0></x-code-raw-0><pre><!-- literal -->
  value</pre></article>`;
  const formatted = formatHtml(source);

  assert.match(formatted, /<x-code-raw-0><\/x-code-raw-0>/);
  assert.match(formatted, /<pre><!-- literal -->\n  value<\/pre>/);
  assert.doesNotMatch(formatted, /x-code-raw-safe/);
});

test("HTML formatting indents raw-element attributes while preserving inner bytes", () => {
  const source = `<article><pre
    class="code"
  >  exact
 value</pre><section>After</section></article>`;
  const formatted = formatHtml(source);

  assert.match(formatted, /\n\t<pre\n\t\tclass="code"\n\t>  exact\n value<\/pre>/);
  assert.match(formatted, /\n\t<section>After<\/section>\n<\/article>$/);
});

test("HTML formatting treats multiline comments as opaque content", () => {
  const formatted = formatHtml(`<article><!-- note
<div>not markup</div>
--><section>Content</section></article>`);

  assert.match(formatted, /<!-- note\n<div>not markup<\/div>\n-->/);
  assert.match(formatted, /\n\t<section>Content<\/section>\n<\/article>$/);
});

test("CSS formatting expands compact rules and indents nested rules with tabs", () => {
  const source = `/* component */ .card { color:red; padding:var(--space-xs)var(--space-s); background:color-mix(in oklch,var(--ink)68%,transparent); }
@media (width < 30rem) { .card { display:grid; gap:var(--space-s); } }`;

  assert.equal(formatCss(source), `/* component */
.card {
	color: red;
	padding: var(--space-xs) var(--space-s);
	background: color-mix(in oklch, var(--ink) 68%, transparent);
}

@media (width < 30rem) {
	.card {
		display: grid;
		gap: var(--space-s);
	}
}`);
});

test("CSS formatting preserves balanced custom-property values", () => {
  const source = `.card { --theme:{ color:red; gap:1rem; }; color:var(--theme); }`;

  assert.equal(formatCss(source), `.card {
	--theme: { color:red; gap:1rem; };
	color: var(--theme);
}`);
});

test("CSS formatting preserves escaped structural selector characters", () => {
  const source = String.raw`.card\{wide { color:red; } .card\;compact { display:grid; }`;

  assert.equal(formatCss(source), String.raw`.card\{wide {
	color: red;
}

.card\;compact {
	display: grid;
}`);
});
