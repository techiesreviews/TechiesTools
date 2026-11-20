import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const lock = JSON.parse(
  readFileSync(join(process.cwd(), "package-lock.json"), "utf8"),
);

// The packages npm audit marked high on 2026-11-20 (TOOLS-113). Each range is
// one affected release line, from its first affected version up to the first
// version that clears every listed advisory on that line, as the GitHub
// advisories give them. A package can have several affected lines.
const affected = [
  {
    name: "devalue",
    ranges: [{ from: [0, 0, 0], fixed: [5, 9, 3] }],
    advisories: ["GHSA-mcm9-63f2-9j32", "GHSA-r9w8-h9r3-54w4", "GHSA-j22f-vq7h-c4qm", "GHSA-x5rw-q4pp-hg5g"],
  },
  {
    name: "fast-uri",
    ranges: [
      { from: [0, 0, 0], fixed: [2, 4, 6] },
      { from: [3, 0, 0], fixed: [3, 1, 7] },
      { from: [4, 0, 0], fixed: [4, 1, 4] },
    ],
    advisories: ["GHSA-7p8r-x3mc-p8w7", "GHSA-f65p-4m7j-42xc", "GHSA-jqff-g426-hqxp", "GHSA-qw65-cvwx-89v3", "GHSA-fph4-wmhf-6fwf", "GHSA-5jgf-p345-68v8"],
  },
  {
    name: "js-yaml",
    ranges: [
      { from: [3, 0, 0], fixed: [3, 15, 2] },
      { from: [4, 0, 0], fixed: [4, 3, 2] },
    ],
    advisories: ["GHSA-5p4m-2wfm-xmqj", "GHSA-2883-xcg3-v3hh"],
  },
  {
    name: "nanoid",
    ranges: [
      { from: [0, 0, 0], fixed: [3, 3, 18] },
      { from: [4, 0, 0], fixed: [5, 1, 6] },
    ],
    advisories: ["GHSA-2v37-7h3g-55p8"],
  },
  {
    name: "sharp",
    ranges: [{ from: [0, 0, 0], fixed: [0, 35, 5] }],
    advisories: ["GHSA-rgj7-g3m4-5g8c", "GHSA-wq5f-xc86-pv6w"],
  },
  {
    name: "smol-toml",
    ranges: [{ from: [0, 0, 0], fixed: [1, 7, 1] }],
    advisories: ["GHSA-7w5x-hrqm-74c2"],
  },
  {
    name: "source-map-js",
    ranges: [{ from: [1, 0, 0], fixed: [1, 2, 2] }],
    advisories: ["GHSA-68fv-2mgg-jv7q"],
  },
  {
    name: "svgo",
    ranges: [
      { from: [1, 0, 0], fixed: [2, 8, 4] },
      { from: [3, 0, 0], fixed: [3, 3, 5] },
      { from: [4, 0, 0], fixed: [4, 1, 0] },
    ],
    advisories: ["GHSA-w27v-7q3p-w38r"],
  },
  {
    name: "undici",
    ranges: [
      { from: [4, 0, 0], fixed: [6, 29, 1] },
      { from: [7, 0, 0], fixed: [7, 30, 1] },
      { from: [8, 0, 0], fixed: [8, 12, 2] },
    ],
    advisories: ["GHSA-4cwx-7wf7-3272", "GHSA-rfgv-xxqx-mfg5", "GHSA-2m5v-pch6-74hx", "GHSA-4w7w-5xrc-9h26", "GHSA-qrxm-fqhp-jwvm", "GHSA-xjj6-f33q-929c", "GHSA-w293-vg96-wgc3"],
  },
  {
    name: "vite",
    ranges: [
      { from: [0, 0, 0], fixed: [6, 4, 4] },
      { from: [7, 0, 0], fixed: [7, 3, 7] },
      { from: [8, 0, 0], fixed: [8, 1, 6] },
      { from: [8, 2, 0], fixed: [8, 2, 4] },
      { from: [8, 3, 0], fixed: [8, 3, 3] },
    ],
    advisories: ["GHSA-587h-7wmj-h5pm"],
  },
];

// Semver order on release numbers; a pre-release sorts before its release.
const atLeast = (version, minimum) => {
  const [release, preRelease] = version.split(/-(.*)/);
  const parts = release.split(".").map(Number);
  for (let i = 0; i < minimum.length; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  return preRelease === undefined;
};

// The affected range the version falls in, or undefined when it is clear.
const affectedRange = (version, { ranges }) =>
  ranges.find(
    ({ from, fixed }) => atLeast(version, from) && !atLeast(version, fixed),
  );

const isAffected = (version, item) => affectedRange(version, item) !== undefined;

const entry = (name) => affected.find((candidate) => candidate.name === name);

test("the affected check covers every affected release line", () => {
  const undici = entry("undici");
  assert.equal(isAffected("6.21.0", undici), true);
  assert.equal(isAffected("6.29.1", undici), false);
  assert.equal(isAffected("7.28.0", undici), true);
  assert.equal(isAffected("7.30.1-rc.1", undici), true);
  assert.equal(isAffected("7.30.1", undici), false);
  assert.equal(isAffected("8.12.1", undici), true);
  assert.equal(isAffected("8.12.2", undici), false);
  assert.equal(isAffected("3.9.0", undici), false);
  assert.equal(isAffected("2.4.5", entry("fast-uri")), true);
  assert.equal(isAffected("2.4.6", entry("fast-uri")), false);
  assert.equal(isAffected("3.15.1", entry("js-yaml")), true);
  assert.equal(isAffected("3.15.2", entry("js-yaml")), false);
  assert.equal(isAffected("2.8.3", entry("svgo")), true);
  assert.equal(isAffected("3.3.5", entry("svgo")), false);
});

test("each package's ranges are in order and do not overlap", () => {
  for (const { name, ranges } of affected) {
    let previousFixed;
    for (const { from, fixed } of ranges) {
      assert.ok(!atLeast(from.join("."), fixed), `${name}: ${from} is not below ${fixed}`);
      if (previousFixed) {
        assert.ok(atLeast(from.join("."), previousFixed), `${name}: ${from} overlaps the line before`);
      }
      previousFixed = fixed;
    }
  }
});

test("the affected check catches later vite and nanoid lines", () => {
  const vite = entry("vite");
  assert.equal(isAffected("8.1.6", vite), false);
  assert.equal(isAffected("8.2.3", vite), true);
  assert.equal(isAffected("8.2.4", vite), false);
  assert.equal(isAffected("8.3.2", vite), true);
  assert.equal(isAffected("8.3.3", vite), false);
  const nanoid = entry("nanoid");
  assert.equal(isAffected("3.3.18", nanoid), false);
  assert.equal(isAffected("5.1.5", nanoid), true);
  assert.equal(isAffected("5.1.6", nanoid), false);
});

for (const item of affected) {
  test(`no locked copy of ${item.name} is in a high advisory range`, () => {
    const copies = Object.entries(lock.packages).filter(([packagePath]) =>
      packagePath.endsWith(`node_modules/${item.name}`),
    );

    assert.ok(copies.length > 0, `expected ${item.name} in the lockfile`);
    for (const [packagePath, { version }] of copies) {
      const range = affectedRange(version, item);
      assert.ok(
        range === undefined,
        `${packagePath} is ${version}; on this line it must be ${range?.fixed.join(".")} or later (${item.advisories.join(", ")})`,
      );
    }
  });
}
