import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const lock = JSON.parse(
  readFileSync(join(process.cwd(), "package-lock.json"), "utf8"),
);

// The packages npm audit marked high on 2026-11-20 (TOOLS-113). Each entry is
// the affected release line, from its first affected version up to the first
// version that clears every high advisory npm audit listed for that package.
// Copies of the package on another release line are not affected.
const affected = [
  {
    name: "devalue",
    from: [0, 0, 0],
    fixed: [5, 9, 3],
    advisories: ["GHSA-mcm9-63f2-9j32", "GHSA-r9w8-h9r3-54w4", "GHSA-j22f-vq7h-c4qm", "GHSA-x5rw-q4pp-hg5g"],
  },
  {
    name: "fast-uri",
    from: [3, 0, 0],
    fixed: [3, 1, 7],
    advisories: ["GHSA-7p8r-x3mc-p8w7", "GHSA-f65p-4m7j-42xc", "GHSA-jqff-g426-hqxp", "GHSA-qw65-cvwx-89v3", "GHSA-fph4-wmhf-6fwf", "GHSA-5jgf-p345-68v8"],
  },
  {
    name: "js-yaml",
    from: [4, 0, 0],
    fixed: [4, 3, 2],
    advisories: ["GHSA-5p4m-2wfm-xmqj", "GHSA-2883-xcg3-v3hh"],
  },
  {
    name: "nanoid",
    from: [0, 0, 0],
    fixed: [3, 3, 18],
    advisories: ["GHSA-2v37-7h3g-55p8"],
  },
  {
    name: "sharp",
    from: [0, 0, 0],
    fixed: [0, 35, 5],
    advisories: ["GHSA-rgj7-g3m4-5g8c", "GHSA-wq5f-xc86-pv6w"],
  },
  {
    name: "smol-toml",
    from: [0, 0, 0],
    fixed: [1, 7, 1],
    advisories: ["GHSA-7w5x-hrqm-74c2"],
  },
  {
    name: "source-map-js",
    from: [1, 0, 0],
    fixed: [1, 2, 2],
    advisories: ["GHSA-68fv-2mgg-jv7q"],
  },
  {
    name: "svgo",
    from: [4, 0, 0],
    fixed: [4, 1, 0],
    advisories: ["GHSA-w27v-7q3p-w38r"],
  },
  {
    name: "undici",
    from: [7, 0, 0],
    fixed: [7, 30, 1],
    advisories: ["GHSA-4cwx-7wf7-3272", "GHSA-rfgv-xxqx-mfg5", "GHSA-2m5v-pch6-74hx", "GHSA-4w7w-5xrc-9h26", "GHSA-qrxm-fqhp-jwvm", "GHSA-xjj6-f33q-929c", "GHSA-w293-vg96-wgc3"],
  },
  {
    name: "vite",
    from: [8, 0, 0],
    fixed: [8, 1, 6],
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

const isAffected = (version, { from, fixed }) =>
  atLeast(version, from) && !atLeast(version, fixed);

test("the affected check covers only the affected release line", () => {
  const undici = affected.find(({ name }) => name === "undici");
  assert.equal(isAffected("7.28.0", undici), true);
  assert.equal(isAffected("7.30.1-rc.1", undici), true);
  assert.equal(isAffected("7.30.1", undici), false);
  assert.equal(isAffected("8.12.3", undici), false);
  assert.equal(isAffected("6.21.0", undici), false);
});

for (const entry of affected) {
  test(`no locked copy of ${entry.name} is in a high advisory range`, () => {
    const copies = Object.entries(lock.packages).filter(([packagePath]) =>
      packagePath.endsWith(`node_modules/${entry.name}`),
    );

    assert.ok(copies.length > 0, `expected ${entry.name} in the lockfile`);
    for (const [packagePath, { version }] of copies) {
      assert.ok(
        !isAffected(version, entry),
        `${packagePath} is ${version}; it must be ${entry.fixed.join(".")} or later (${entry.advisories.join(", ")})`,
      );
    }
  });
}
