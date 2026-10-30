---
title: "Remove unused fluid viewport declarations from CSS export"
type: task (AFK)
status: needs-triage
assignee:
blocked_by: []
issue: https://github.com/techiesreviews/TechiesTools/issues/38
---

## Issue

From GitHub Issue [techiesreviews/TechiesTools#38](https://github.com/techiesreviews/TechiesTools/issues/38), opened by techiesreviews on 2026-07-17.

Labels: none

#### What happened

CSS export includes fluid viewport custom properties even though the generated clamp values already contain the viewport calculation and do not consume those properties.

#### What I expected

CSS export contains only variables used by the exported CSS contract. DTCG provenance can remain a separate explicit decision.

#### Steps to reproduce

1. Open Framework.
2. Open Export variables.
3. Select CSS.
4. Inspect the Fluid viewport declarations and search the remaining output for consumers.

#### Additional context

The editable shared viewport still drives generation. This issue concerns dead declarations in the final CSS output, not removal of the Framework controls.

## Comments

None.
