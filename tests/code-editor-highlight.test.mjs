import assert from "node:assert/strict";
import test from "node:test";

import { highlightCode } from "../src/code-editor/highlight.ts";

const occurrences = (source, value) => source.split(value).length - 1;

test("HTML highlighting tokenizes every nested tag and keeps text undecorated", () => {
  const highlighted = highlightCode('<p class="price"><strong>$250</strong> night</p>', "html");

  assert.equal(occurrences(highlighted, 'code-token--tag'), 4);
  assert.match(highlighted, /code-token--attribute[^>]*>class<\/span>/);
  assert.match(highlighted, /code-token--string[^>]*>&quot;price&quot;<\/span>/);
  assert.match(highlighted, /<\/span>\$250/);
  assert.match(highlighted, /<\/span> night/);
});

test("HTML highlighting carries tag state across wrapped attribute lines", () => {
  const highlighted = highlightCode('<span\n  aria-label="Rated 4.8"\n  aria-hidden="true"\n>★</span>', "html");

  assert.equal(occurrences(highlighted, 'code-token--attribute'), 2);
  assert.equal(occurrences(highlighted, 'code-token--string'), 2);
  assert.equal(occurrences(highlighted, 'code-editor-source-line'), 4);
  assert.match(highlighted, /code-token--tag[^>]*>span<\/span>/);
});

test("CSS highlighting recognizes multiline selectors and value primitives", () => {
  const highlighted = highlightCode('.card__header,\n.card__footer {\n  gap: var(--space-s);\n  opacity: .8;\n}', "css");

  assert.equal(occurrences(highlighted, 'code-token--selector'), 2);
  assert.equal(occurrences(highlighted, 'code-token--property'), 2);
  assert.match(highlighted, /code-token--function[^>]*>var<\/span>/);
  assert.match(highlighted, /code-token--variable[^>]*>--space-s<\/span>/);
  assert.match(highlighted, /code-token--number[^>]*>\.8<\/span>/);
});

test("CSS highlighting keeps declarations visible in compact one-line rules", () => {
  const highlighted = highlightCode(".card { color: red; opacity: .8; }", "css");

  assert.equal(occurrences(highlighted, 'code-token--property'), 2);
  assert.match(highlighted, /code-token--keyword[^>]*>red<\/span>/);
  assert.match(highlighted, /code-token--number[^>]*>\.8<\/span>/);
});

test("CSS highlighting recognizes declaration-only shared editor source", () => {
  const highlighted = highlightCode("/* component override */\ncolor: red;\ngap: var(--space-s);", "css");

  assert.equal(occurrences(highlighted, 'code-token--property'), 2);
  assert.equal(occurrences(highlighted, 'code-token--selector'), 0);
  assert.equal(occurrences(highlighted, 'code-token--comment'), 1);
  assert.match(highlighted, /code-token--function[^>]*>var<\/span>/);
});

test("CSS highlighting carries rule context through nested conditional blocks", () => {
  const highlighted = highlightCode("@container card (width < 20rem) {\n  .card {\n    display: grid;\n  }\n}", "css");

  assert.match(highlighted, /code-token--keyword[^>]*>@container card/);
  assert.match(highlighted, /code-token--selector[^>]*>\.card<\/span>/);
  assert.match(highlighted, /code-token--property[^>]*>display<\/span>/);
});

test("syntax highlighting always escapes authored markup", () => {
  const highlighted = highlightCode('<script>alert("x")</script>', "html");

  assert.doesNotMatch(highlighted, /<script>/);
  assert.match(highlighted, /code-token--tag[^>]*>script<\/span>/);
});
