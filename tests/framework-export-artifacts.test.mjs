import assert from "node:assert/strict";
import test from "node:test";
import { compileFramework, packageArtifacts } from "../src/framework/compiler/index.ts";

const input = () => ({
  definitions: [],
  primitiveDefaults: {
    "semantic.action": "#2563eb",
    "semantic.surface": "#ffffff",
  },
  identity: { id: "techies", name: "Techies Framework" },
  sourceRevision: "test",
  contextSchemaVersion: "2",
});

const available = (channel) => {
  assert.equal(channel.available, true, JSON.stringify(channel.diagnostics));
  return channel.value;
};
const zipEntries = (bytes) => {
  const entries = new Map();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const decoder = new TextDecoder();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04034b50) {
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const contentStart = nameStart + nameLength + extraLength;
    const name = decoder.decode(bytes.subarray(nameStart, nameStart + nameLength));
    entries.set(name, bytes.slice(contentStart, contentStart + size));
    offset = contentStart + size;
  }
  return entries;
};

test("compileFramework exposes the fixed three-artifact contract without DTCG", () => {
  const compilation = compileFramework(input());
  assert.deepEqual(Object.keys(compilation.artifacts), ["tokens", "elements", "context"]);
  assert.equal("dtcg" in compilation, false);
  assert.equal("dtcg" in compilation.artifacts, false);

  const tokens = available(compilation.artifacts.tokens);
  const elements = available(compilation.artifacts.elements);
  const context = available(compilation.artifacts.context);

  assert.deepEqual(
    [tokens.name, elements.name, context.name],
    ["tokens.css", "elements.css", "context.md"],
  );
  assert.deepEqual(
    [tokens.mimeType, elements.mimeType, context.mimeType],
    ["text/css", "text/css", "text/markdown"],
  );
  for (const artifact of [tokens, elements, context]) {
    assert.match(artifact.value, /https:\/\/techies\.tools/);
    assert.match(artifact.value, new RegExp(compilation.identity.frameworkVersion.replaceAll(".", "\\.")));
    assert.match(artifact.value, new RegExp(compilation.identity.contentHash));
    assert.equal(artifact.value.endsWith("\n"), true);
    assert.equal(artifact.value.endsWith("\n\n"), false);
    assert.doesNotMatch(artifact.value, /\r/);
  }

  assert.match(tokens.value, /@layer tokens, elements, components;/);
  assert.match(tokens.value, /@layer tokens \{/);
  assert.doesNotMatch(tokens.value, /@layer elements \{/);
  assert.doesNotMatch(tokens.value, /@import/);

  assert.match(elements.value, /Requires tokens\.css loaded first/);
  assert.match(elements.value, /@layer tokens, elements, components;/);
  assert.match(elements.value, /@layer elements \{/);
  assert.doesNotMatch(elements.value, /@layer tokens \{/);
  assert.doesNotMatch(elements.value, /@import/);

  assert.match(context.value, /schemaVersion: 2/);
  assert.match(context.value, /tokens\.css/);
  assert.match(context.value, /elements\.css/);
  assert.match(context.value, new RegExp(tokens.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(context.value, new RegExp(elements.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("packageArtifacts creates a deterministic flat ZIP from exact cached artifacts", () => {
  const artifacts = compileFramework(input()).artifacts;
  const first = packageArtifacts(artifacts);
  const second = packageArtifacts(artifacts);
  assert.equal(first.name, "framework.zip");
  assert.equal(first.mimeType, "application/zip");
  assert.deepEqual(first.value, second.value);

  const entries = zipEntries(first.value);
  assert.deepEqual([...entries.keys()], ["tokens.css", "elements.css", "context.md"]);
  const decoder = new TextDecoder();
  assert.equal(decoder.decode(entries.get("tokens.css")), available(artifacts.tokens).value);
  assert.equal(decoder.decode(entries.get("elements.css")), available(artifacts.elements).value);
  assert.equal(decoder.decode(entries.get("context.md")), available(artifacts.context).value);
});

test("primitive errors block every artifact while element errors preserve tokens.css", () => {
  const badPrimitive = compileFramework({ ...input(), primitiveValid: false });
  assert.equal(badPrimitive.artifacts.tokens.available, false);
  assert.equal(badPrimitive.artifacts.elements.available, false);
  assert.equal(badPrimitive.artifacts.context.available, false);
});
