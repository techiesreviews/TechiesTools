import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const readJson = (file) =>
  JSON.parse(readFileSync(join(process.cwd(), file), "utf8"));
const lock = readJson("package-lock.json");
const manifest = readJson("package.json");

// astro <=7.3.2 is critical; 7.3.3 is the first fixed release:
// https://github.com/advisories/GHSA-26w7-cxv4-gfx2
// https://github.com/advisories/GHSA-376h-93r7-7g6f
// https://github.com/advisories/GHSA-98hj-9722-w3j8
// https://github.com/advisories/GHSA-mpr7-6m5w-76rw
const firstPatched = [7, 3, 3];

// Semver order on release numbers; a pre-release sorts before its release, so
// 7.3.3-beta.1 is still affected.
const atLeast = (version, minimum) => {
  const [release, preRelease] = version.split(/-(.*)/);
  const parts = release.split(".").map(Number);
  for (let i = 0; i < minimum.length; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  return preRelease === undefined;
};

test("the version comparison follows semver order", () => {
  assert.equal(atLeast("7.3.2", firstPatched), false);
  assert.equal(atLeast("7.3.3-beta.1", firstPatched), false);
  assert.equal(atLeast("7.3.3", firstPatched), true);
  assert.equal(atLeast("7.3.10", firstPatched), true);
  assert.equal(atLeast("7.10.0", firstPatched), true);
  assert.equal(atLeast("8.0.0-alpha.1", firstPatched), true);
});

// Only a single version with an optional ^ or ~ has a plain floor; anything
// else (alternatives, >=, x ranges) must be checked by hand.
const rangeFloor = (range) =>
  /^[\^~]?\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(range)
    ? range.replace(/^[\^~]/, "")
    : undefined;

test("only a single caret or tilde version has a floor", () => {
  assert.equal(rangeFloor("^7.3.3"), "7.3.3");
  assert.equal(rangeFloor("~7.3.3"), "7.3.3");
  assert.equal(rangeFloor("7.3.3"), "7.3.3");
  assert.equal(rangeFloor("^8.0.0 || ^7.0.0"), undefined);
  assert.equal(rangeFloor(">=7.3.3"), undefined);
});

test("every locked copy of Astro is past the critical advisories", () => {
  const copies = Object.entries(lock.packages).filter(([packagePath]) =>
    /(?:^|\/)node_modules\/astro$/.test(packagePath),
  );

  assert.ok(copies.length > 0, "expected astro in the lockfile");
  for (const [packagePath, { version }] of copies) {
    assert.ok(
      atLeast(version, firstPatched),
      `${packagePath} is ${version}; it must be ${firstPatched.join(".")} or later`,
    );
  }
});

test("the declared Astro range cannot fall back below the fix", () => {
  for (const [where, range] of [
    ["package.json", manifest.dependencies.astro],
    ["package-lock.json root", lock.packages[""].dependencies.astro],
  ]) {
    const floor = rangeFloor(range);
    assert.ok(
      floor !== undefined,
      `${where} asks for astro ${range}; use a single ^ or ~ version so this guard can read its floor`,
    );
    assert.ok(
      atLeast(floor, firstPatched),
      `${where} asks for astro ${range}; its floor must be ${firstPatched.join(".")} or later`,
    );
  }
});
