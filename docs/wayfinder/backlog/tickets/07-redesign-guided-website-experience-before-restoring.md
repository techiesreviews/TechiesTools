---
title: "Redesign Guided Website experience before restoring Main navigation"
type: task (AFK)
status: needs-triage
assignee:
blocked_by: []
issue: https://github.com/techiesreviews/TechiesTools/issues/71
---

## Issue

From GitHub Issue [techiesreviews/TechiesTools#71](https://github.com/techiesreviews/TechiesTools/issues/71), opened by LexAIagent on 2026-07-31.

Labels: none

#### Goal

Create a Guided Website workflow that earns persistent Main-navigation placement by being polished, visually clear, on-brand, and genuinely useful for capturing taste and producing a portable first-draft direction.

#### Current problem

The current implementation proves the workflow architecture, but its visual design does not meet the product quality bar. The control surface feels dense and unfinished, and the whole-page choices do not yet feel compelling enough to support confident taste decisions. Exposing it in Main navigation would imply readiness it has not earned.

#### Desired outcome

- A focused guided experience that asks few questions and communicates progress without a conventional horizontal step row.
- A control panel that feels native to the Framework settings experience while remaining appropriate for client-guided decisions.
- Whole-page HTML/CSS alternatives with unmistakably different composition, hierarchy, density, surfaces, typography, imagery, and emphasis.
- Controlled comparison evidence: project content stays stable when a single visual dimension changes.
- Research translated from varied live website families into transferable design mechanics without copying brands, assets, or complete compositions.
- Earlier answers visibly shape later previews and the final combined direction.
- A portable, vendor-neutral context download containing project facts, approved evidence, Active Framework context, and provenance.

#### Acceptance criteria

- [ ] Lex approves the redesigned visual direction before the Main-menu entry is restored.
- [ ] The Guided Website entry remains hidden from persistent Main navigation until that approval.
- [ ] Whole-page alternatives are polished, clearly distinct, and remain dimension-controlled.
- [ ] Vertical or otherwise non-horizontal journey navigation is clear, keyboard-accessible, and evidence-gated.
- [ ] The settings-style control panel has strong hierarchy, readable density, and responsive behavior.
- [ ] Main navigation remains usable on mobile; the guided route has no horizontal overflow at supported breakpoints.
- [ ] Persistence, restored-state validation, skip/neither/default outcomes, focus handoff, and portable download remain intact.
- [ ] Permanent browser coverage verifies the critical workflow rather than relying only on source assertions or temporary CDP scripts.
- [ ] Final test, Astro check, build, responsive geometry, visual QA, and independent fail-closed review pass.

#### Scope guard

Keep the canonical route available for direct review and continued development, but do not expose it as a ready product. Arbitrary whole-site generation remains out of scope; begin with a constrained homepage recipe and reusable Framework-based direction.

## Comments

**LexAIagent, 2026-07-31:**

#### Progress so far

Work exists in the isolated `feat/guided-website-workflow` worktree and remains uncommitted/unmerged.

### Implemented

- Added the canonical direct-review route: `/framework/guided-website`.
- Built a typed Guided Website draft model with project facts, four visual decisions, explicit skip/default outcomes, evidence-gated reachability, progress, persistence validation, and compiled brief output.
- Added a portable `guided-website-context.md` download that includes project direction, approved evidence, exact Active Framework context, and Framework provenance.
- Built whole-page visual comparison stages for composition, density, surface, and voice, followed by a combined review page.
- Replaced the horizontal step row with a vertical Journey navigator.
- Reused the canonical Settings bar shell and its design tokens for the guided control panel.
- Researched transferable mechanics from Linear, Stripe Press, Apple, The Verge, Mailchimp, and GOV.UK; translated them into product-led/editorial-led, campaign-paced/editorial-scan, quiet/layered, and utility/expressive archetypes without copying source branding or compositions.
- Preserved project content when density changes and preserved composition/geometry when surface treatment changes. Runtime invariants verify identical text/DOM for both dimensions and identical section rectangles for surface alternatives.
- Added responsive behavior and checked 390, 901, 1101, 1200, and 1440-class widths without retained horizontal overflow.
- Added model and UI regression coverage.

### Quality feedback and visibility decision

The current visual result does **not** meet the intended product/design quality bar. The Guided Website Main-menu entry has therefore been removed and will remain hidden until Lex explicitly approves a redesigned direction. The route stays directly reachable for continued iteration and review.

### Current verification

- Focused Guided Website UI tests: pass.
- Full suite: **140/140 passed**.
- Astro check: **0 errors, 0 warnings, 8 existing hints**.
- Production build: passed.
- `git diff --check`: passed.
- Server-rendered Main-menu check: Guided Website label and route are absent.
- Portable download and responsive CDP checks passed at the current implementation snapshot.

### Next work

Treat the existing implementation as architecture/evidence, not an approved design. Revisit information density, hierarchy, visual polish, comparison composition, and the overall guided interaction before restoring product navigation. Add permanent browser coverage for the critical workflow before promotion.

**LexAIagent, 2026-07-31:**

#### Branch and workspace cleanup

- Renamed the dedicated implementation branch to `feat/71-guided-website-redesign`.
- Guided Website remains in `\Projects\TechiesTools-guided-website`.
- Glass Card remains independently isolated in `\TechiesTools-glass-card` on `feat/glass-card-tool`; it was not modified.
- Both feature branches currently share the same clean `develop` base commit, so the Guided Website work is not stacked on Glass Card.
- Stopped the Guided Website prototype server, review server, and temporary headless Edge/CDP process.
- Retained both worktrees and all uncommitted Guided Website files; no unique prototype or implementation work was deleted.

**LexAIagent, 2026-07-31:**

#### Branch published

The current Guided Website implementation is now committed and available on GitHub:

- Branch: [`feat/71-guided-website-redesign`](https://github.com/techiesreviews/TechiesTools/tree/feat/71-guided-website-redesign)
- Commit: [`46a93ca`](https://github.com/techiesreviews/TechiesTools/commit/46a93cafc6d2c1d11968af71d847f55d89591020) — `feat: add guided website workflow foundation`
- Local and remote SHAs were verified identical.
- Working tree is clean.
- The Guided Website Main-menu entry remains intentionally absent pending redesign approval.
