import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const lock = JSON.parse(
  readFileSync(join(process.cwd(), "package-lock.json"), "utf8"),
);

// astro <=7.3.2 is critical (GHSA-26w7-cxv4-gfx2, GHSA-376h-93r7-7g6f,
// GHSA-98hj-9722-w3j8, GHSA-mpr7-6m5w-76rw); 7.3.3 is the first fixed release.
const firstPatched = [7, 3, 3];

const atLeast = (version, minimum) => {
  const parts = version.split("-")[0].split(".").map(Number);
  for (let i = 0; i < minimum.length; i++) {
    if (parts[i] !== minimum[i]) return parts[i] > minimum[i];
  }
  return true;
};

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
