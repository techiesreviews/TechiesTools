import assert from "node:assert/strict";
import test from "node:test";
import {
  applyGuidedWebsiteAction,
  compileGuidedWebsiteBrief,
  compileGuidedWebsiteGenerationContext,
  createGuidedWebsiteDraft,
  guidedWebsiteLastAvailableStep,
  guidedWebsiteProgress,
  parseGuidedWebsiteDraft,
} from "../src/guided-website/model.ts";

test("Guided Website starts with Framework-owned defaults and unanswered project evidence", () => {
  const draft = createGuidedWebsiteDraft();

  assert.equal(draft.schemaVersion, 1);
  assert.equal(draft.currentStep, "project");
  assert.deepEqual(draft.project, {
    organization: "",
    offer: "",
    audience: "",
    primaryAction: "",
  });
  assert.deepEqual(draft.decisions, {
    composition: { status: "unanswered" },
    density: { status: "unanswered" },
    surface: { status: "unanswered" },
    voice: { status: "unanswered" },
  });
  assert.deepEqual(guidedWebsiteProgress(draft), {
    resolvedDecisions: 0,
    totalDecisions: 4,
    completedProjectFields: 0,
    totalProjectFields: 4,
    readyForFirstDraft: false,
  });
});

test("Guided Website records selections and explicit skips without mutating prior evidence", () => {
  const initial = createGuidedWebsiteDraft();
  const selected = applyGuidedWebsiteAction(initial, {
    type: "choose",
    decision: "composition",
    value: "editorial",
  });
  const skipped = applyGuidedWebsiteAction(selected, {
    type: "skip",
    decision: "density",
  });

  assert.deepEqual(initial.decisions.composition, { status: "unanswered" });
  assert.deepEqual(selected.decisions.composition, { status: "selected", value: "editorial" });
  assert.deepEqual(skipped.decisions.density, { status: "skipped" });
  assert.equal(guidedWebsiteProgress(skipped).resolvedDecisions, 2);
});

test("Guided Website is ready only after project facts and every visual question are resolved", () => {
  let draft = createGuidedWebsiteDraft();
  draft = applyGuidedWebsiteAction(draft, {
    type: "set-project",
    project: {
      organization: "Northstar",
      offer: "Strategy and design for ambitious teams",
      audience: "Founders and product leaders",
      primaryAction: "Start a project",
    },
  });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "composition", value: "structured" });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "density", value: "airy" });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "surface", value: "quiet" });

  assert.equal(guidedWebsiteProgress(draft).readyForFirstDraft, false);

  draft = applyGuidedWebsiteAction(draft, { type: "skip", decision: "voice" });

  assert.deepEqual(guidedWebsiteProgress(draft), {
    resolvedDecisions: 4,
    totalDecisions: 4,
    completedProjectFields: 4,
    totalProjectFields: 4,
    readyForFirstDraft: true,
  });
  assert.equal(guidedWebsiteLastAvailableStep(draft), "review");
});

test("Guided Website unlocks only the next unanswered step", () => {
  let draft = createGuidedWebsiteDraft();
  assert.equal(guidedWebsiteLastAvailableStep(draft), "project");
  draft = applyGuidedWebsiteAction(draft, {
    type: "set-project",
    project: {
      organization: "Northstar",
      offer: "Strategy and design",
      audience: "Product leaders",
      primaryAction: "Start a project",
    },
  });
  assert.equal(guidedWebsiteLastAvailableStep(draft), "composition");
  draft = applyGuidedWebsiteAction(draft, { type: "skip", decision: "composition" });
  assert.equal(guidedWebsiteLastAvailableStep(draft), "density");
});

test("Guided Website compiler separates project facts, selected direction, and Framework defaults", () => {
  let draft = createGuidedWebsiteDraft();
  draft = applyGuidedWebsiteAction(draft, {
    type: "set-project",
    project: {
      organization: "Northstar",
      offer: "Strategy and design",
      audience: "Thoughtful technology teams",
      primaryAction: "View selected work",
    },
  });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "composition", value: "editorial" });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "density", value: "airy" });
  draft = applyGuidedWebsiteAction(draft, { type: "choose", decision: "surface", value: "layered" });
  draft = applyGuidedWebsiteAction(draft, { type: "skip", decision: "voice" });

  const brief = compileGuidedWebsiteBrief(draft);

  assert.match(brief, /^# Guided Website Brief/m);
  assert.match(brief, /Organization: Northstar/);
  assert.match(brief, /Primary action: View selected work/);
  assert.match(brief, /Composition: Editorial-led/);
  assert.match(brief, /Density: Campaign pace/);
  assert.match(brief, /Surface: Layered workspace/);
  assert.match(brief, /Voice: No additional preference; follow the active Framework and supplied copy/);
  assert.match(brief, /Approved voice example: No approved example/);
  assert.match(brief, /Do not mutate the Active Framework automatically/);
});

test("Guided Website generation context embeds the exact active Framework context and provenance", () => {
  const exactContext = "\n# Exact Framework Context\n\nUse the exact active Element Treatments.\n\n";
  const output = compileGuidedWebsiteGenerationContext(createGuidedWebsiteDraft(), {
    markdown: exactContext,
    frameworkVersion: "0.3.0",
    sourceRevision: "abc123",
    contextSchemaVersion: "1",
    contentHash: "deadbeef",
  });

  assert.match(output, /^# Guided Website Brief/m);
  assert.match(output, /## Active Framework provenance/);
  assert.match(output, /Framework version: 0\.3\.0/);
  assert.match(output, /Content hash \(semantic; not an exact artifact digest\): deadbeef/);
  assert.match(output, /# Exact Framework Context/);
  assert.match(output, /Use the exact active Element Treatments\./);
  assert.equal(output.endsWith(exactContext), true);
});

test("Guided Website parser rejects malformed persisted evidence and accepts valid drafts", () => {
  const draft = createGuidedWebsiteDraft();

  assert.deepEqual(parseGuidedWebsiteDraft(draft), draft);
  assert.equal(parseGuidedWebsiteDraft({ ...draft, schemaVersion: 2 }), null);
  assert.equal(parseGuidedWebsiteDraft({ ...draft, decisions: { composition: { status: "selected", value: "random" } } }), null);
});
