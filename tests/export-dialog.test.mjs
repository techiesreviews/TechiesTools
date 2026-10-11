import assert from "node:assert/strict";
import test from "node:test";
import { createExportActions, exportDialogAttributes } from "../src/settings/export-dialog.ts";

const fakeIo = ({ copyFails, saveFails } = {}) => {
  const copied = [];
  const saved = [];
  return {
    copied,
    saved,
    async copy(value) {
      if (copyFails) return { success: false, message: copyFails };
      copied.push(value);
      return { success: true };
    },
    save(file) {
      if (saveFails) return { success: false, message: saveFails };
      saved.push(file);
      return { success: true };
    },
  };
};
const files = {
  css: { name: "card.css", mimeType: "text/css", value: ".card {}" },
  html: { name: "card.html", mimeType: "text/html", value: "<div></div>" },
};
const setup = (overrides = {}) => {
  const reports = [];
  const io = overrides.io ?? fakeIo();
  const actions = createExportActions({
    artifact: (id) => files[id],
    packageAll: () => ({ name: "card.zip", mimeType: "application/zip", value: new Uint8Array([1, 2]) }),
    packageName: () => "card.zip",
    report: (message, failed) => reports.push({ message, failed }),
    io,
    ...overrides,
  });
  return { actions, reports, io };
};

test("copy and save report one consistent outcome per action", async () => {
  const { actions, reports, io } = setup();
  assert.deepEqual(await actions.copy("css"), { success: true });
  assert.deepEqual(actions.save("html"), { success: true });
  assert.deepEqual(actions.saveAll(), { success: true });
  assert.deepEqual(io.copied, [".card {}"]);
  assert.deepEqual(io.saved.map(({ name }) => name), ["card.html", "card.zip"]);
  assert.deepEqual(reports, [
    { message: "Copied card.css", failed: false },
    { message: "Download started for card.html", failed: false },
    { message: "Download started for card.zip", failed: false },
  ]);
});

test("blocked clipboard and downloads are reported as failures", async () => {
  const { actions, reports } = setup({ io: fakeIo({ copyFails: "Denied.", saveFails: "Blocked." }) });
  assert.equal((await actions.copy("css")).success, false);
  assert.equal(actions.save("css").success, false);
  assert.deepEqual(reports, [
    { message: "Could not copy card.css. Denied.", failed: true },
    { message: "Could not start download for card.css. Blocked.", failed: true },
  ]);
});

test("packaging errors are reported instead of thrown", () => {
  const { actions, reports, io } = setup({ packageAll: () => { throw new Error("Too large."); } });
  assert.deepEqual(actions.saveAll(), { success: false, message: "Too large." });
  assert.deepEqual(io.saved, []);
  assert.deepEqual(reports, [{ message: "Could not start download for card.zip. Too large.", failed: true }]);
});

test("unavailable artifacts do nothing and asynchronous packages arrive through deliver", async () => {
  const { actions, reports, io } = setup({ artifact: () => undefined, packageAll: () => undefined });
  assert.equal((await actions.copy("css")).success, false);
  assert.equal(actions.save("css").success, false);
  assert.equal(actions.saveAll(), undefined);
  assert.deepEqual(reports, []);
  actions.deliver({ name: "framework.zip", mimeType: "application/zip", value: new Uint8Array([1]) });
  assert.deepEqual(io.saved.map(({ name }) => name), ["framework.zip"]);
  assert.deepEqual(reports, [{ message: "Download started for framework.zip", failed: false }]);
});

test("attribute names derive from one prefix with explicit overrides", () => {
  const attributes = exportDialogAttributes("data-glass-export", { directCopy: "data-glass-copy-css" });
  assert.equal(attributes.dialog, "data-glass-export-dialog");
  assert.equal(attributes.previewName, "data-glass-export-preview-name");
  assert.equal(attributes.directCopy, "data-glass-copy-css");
});
