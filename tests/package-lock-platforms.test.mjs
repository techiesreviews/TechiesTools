import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const lock = JSON.parse(
  readFileSync(join(process.cwd(), "package-lock.json"), "utf8"),
);

const expectedLibc = (packagePath) => {
  if (/linuxmusl|linux-[^/]+-musl$/.test(packagePath)) return "musl";
  if (
    /linux-(?:arm64|x64|ppc64|s390x)-gnu$/.test(packagePath) ||
    /node_modules\/@img\/sharp(?:-libvips)?-linux-/.test(packagePath)
  ) {
    return "glibc";
  }
  return null;
};

test("Linux native packages retain their libc selectors in the lockfile", () => {
  const nativePackages = Object.entries(lock.packages).flatMap(
    ([packagePath, metadata]) => {
      const libc = expectedLibc(packagePath);
      return libc ? [{ packagePath, metadata, libc }] : [];
    },
  );

  assert.ok(nativePackages.length > 0, "expected Linux native packages");
  for (const { packagePath, metadata, libc } of nativePackages) {
    assert.deepEqual(
      metadata.libc,
      [libc],
      `${packagePath} must remain restricted to ${libc}`,
    );
  }
});
