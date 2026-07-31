import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildSemanticColorOptions,
  reconcileSemanticColorSelection,
  refreshSemanticColorRoles,
} from "../src/framework/colors/semantic-options.ts";
import { compileFramework } from "../src/framework/compiler/index.ts";

const emptyCatalog = Object.freeze({
  elements: Object.freeze([]),
  get: () => undefined,
  rule: () => undefined,
  group: () => Object.freeze([]),
});
const scale = Object.freeze([
  "oklch(98% 0.01 260)",
  "oklch(94% 0.03 260)",
  "oklch(86% 0.08 260)",
  "oklch(62% 0.2 260)",
  "oklch(48% 0.2 260)",
  "oklch(36% 0.16 260)",
  "oklch(24% 0.1 260)",
]);
const palette = (id, name, variable) => ({
  id,
  name,
  variable,
  value: scale[3],
  scale,
});
const available = (channel) => {
  assert.equal(channel.available, true, JSON.stringify(channel.diagnostics));
  return channel.value;
};

test("Framework settings delegates semantic refresh to the tested palette transaction", () => {
  const source = readFileSync("src/components/dashboard/FrameworkSettingsBar.astro", "utf8");
  const publishColors = source.match(/const publishColors = \(deferCompilation = false\) => \{([\s\S]*?)\r?\n  \};\r?\n\r?\n  const publishType/)?.[1];
  assert.ok(publishColors);

  assert.match(source, /buildSemanticColorOptions/);
  assert.match(source, /refreshSemanticColorRoles\(\{ colors, roles, defaults \}\)/);
  assert.match(source, /const ensureColorId = \(row: HTMLElement\)/);
  assert.match(source, /return \{ id:ensureColorId\(row\), name, value, scale, variable:/);
  assert.match(source, /option\.dataset\.colorId=item\.colorId/);
  assert.match(source, /option\.dataset\.shade=item\.shade/);
  assert.match(source, /colorId:selectedOption\.dataset\.colorId/);
  assert.match(source, /shade:selectedOption\.dataset\.shade as SemanticShade/);
  assert.match(source, /value:preserved\.reference,options:refreshedOptions\.map/);
  assert.match(source, /semantics: Object\.fromEntries[\s\S]*select\.value/);
  assert.match(publishColors, /const semantics=collectSemantics\(\)/);
  assert.match(publishColors, /detail:\s*\{\s*primary:[^,]+,\s*colors,\s*semantics,/);
  assert.match(publishColors, /deferCompilation/);
  assert.doesNotMatch(publishColors, /publishSemantics\(\)/);
});

test("palette rename atomically updates UI, persistence, Preview, and exports without changing shade", () => {
  const before = buildSemanticColorOptions([
    palette("palette-1", "Primary", "--color-primary"),
    palette("palette-2", "Accent", "--color-accent"),
  ]);
  const selectedBefore = before.find((option) => option.reference === "--color-accent-darker");
  assert.ok(selectedBefore);

  const renamedColors = [
    palette("palette-1", "Primary", "--color-primary"),
    palette("palette-2", "Brand", "--color-brand"),
  ];
  let applied;
  refreshSemanticColorRoles({
    colors: renamedColors,
    defaults: { action: "--color-primary" },
    roles: [{
      role: "action",
      requestedReference: selectedBefore.reference,
      requestedLabel: selectedBefore.label,
      previousOption: selectedBefore,
      apply: (options, selected) => {
        applied = {
          nativeOptions: options.map((option) => ({
            value: option.reference,
            label: option.label,
            colorId: option.colorId,
            shade: option.shade,
          })),
          combobox: { value: selected.reference, label: selected.label, meta: selected.reference },
          selected,
        };
      },
    }],
  });

  assert.ok(applied);
  assert.deepEqual(applied.combobox, {
    value: "--color-brand-darker",
    label: "Brand / Darker",
    meta: "--color-brand-darker",
  });
  assert.deepEqual(
    applied.nativeOptions.find((option) => option.value === "--color-brand-darker"),
    { value: "--color-brand-darker", label: "Brand / Darker", colorId: "palette-2", shade: "darker" },
  );
  assert.equal(applied.selected.value, scale[5]);

  const persisted = JSON.parse(JSON.stringify({
    colors: renamedColors.map(({ name, value }) => ({ name, value })),
    semantics: { action: applied.selected.reference },
  }));
  assert.deepEqual(persisted.colors[1], { name: "Brand", value: scale[3] });
  assert.equal(persisted.semantics.action, "--color-brand-darker");

  const compilation = compileFramework({
    catalog: emptyCatalog,
    primitiveSnapshot: {
      colors: renamedColors,
      semantics: {
        action: {
          role: "action",
          reference: applied.selected.reference,
          value: applied.selected.value,
          variable: "--semantic-action",
        },
      },
    },
    identity: { id: "techies", name: "Techies Framework" },
    sourceRevision: "test",
  });

  const semantic = compilation.resolved.primitives.find((token) => token.id === "semantic.action");
  assert.equal(semantic?.value, "var(--color-brand-darker)");
  assert.equal(semantic?.resolvedValue, scale[5]);

  const preview = available(compilation.preview).css;
  const tokens = available(compilation.artifacts.tokens).value;
  const elements = available(compilation.artifacts.elements).value;
  const context = available(compilation.artifacts.context).value;
  for (const output of [preview, tokens, context]) {
    assert.match(output, /--color-brand-darker:/);
    assert.match(output, /--semantic-action: var\(--color-brand-darker\);/);
  }
  for (const output of [preview, tokens, elements, context]) {
    assert.doesNotMatch(output, /--color-accent-darker/);
  }
});

test("semantic reconciliation preserves literal selections while palette options change", () => {
  const afterRemoval = buildSemanticColorOptions([
    palette("palette-1", "Primary", "--color-primary"),
  ]);

  const literal = reconcileSemanticColorSelection({
    options: afterRemoval,
    requestedReference: "oklch(0% 0 0)",
    fallbackReference: "--color-primary",
  });
  assert.equal(literal.label, "Black");
});
