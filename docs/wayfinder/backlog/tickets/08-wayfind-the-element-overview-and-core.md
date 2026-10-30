---
title: "Wayfind the Element Overview and core Element defaults"
type: task (AFK)
status: needs-triage
assignee:
blocked_by: []
issue: https://github.com/techiesreviews/TechiesTools/issues/72
---

## Issue

From GitHub Issue [techiesreviews/TechiesTools#72](https://github.com/techiesreviews/TechiesTools/issues/72), opened by techiesreviews on 2026-10-21.

Labels: none

#### Destination

A build-ready specification for the **Element Overview** that replaces the current Element Reference at `/framework/elements`, plus an answered checklist of Default Treatments for the core Elements and a plan for the Homepage Preview to show them in realistic use.

#### Notes

- Domain: Framework Elements, Treatment Definitions, Element Guidance, Previews. Read `CONTEXT.md`, `docs/framework/element-guidance.md`, `docs/framework/element-standards-audit.md`, and ADRs 0011, 0015, 0018 before resolving a ticket.
- Skills: `grilling` + `domain-modeling` for decisions; `prototype` for layout and style proposals; `research` for research tickets. Research may use the Mobbin MCP (`search_screens`, `search_sections`, `search_flows`) alongside primary design-system docs.
- Standing preferences (from the charting session):
  - Core set first (~30 Elements designed on most sites): headings, paragraph, links, lists, blockquote, figure + figcaption, img, table, buttons, text input, select, checkbox, radio, textarea, label/fieldset, details/summary, hr, code. More Elements are added later, based on what SaaS and marketing sites style by default.
  - The overview shows **both** single Elements and small combinations of them, grouped by family; each family shows its combination first, then its single Elements.
  - It updates live when Primitives change (spacing, typography, radius, colour), so the impact of a tweak is visible immediately.
  - The overview replaces the Element Reference page. Clicking an Element opens a side panel with its Element Guidance and a style panel that edits that Element's CSS (v1 reuses the existing Treatment editor).
  - Light/dark is a switch, not side-by-side.
  - Draft Elements (checkbox, radio, range…) appear with an "unfinished" label.
  - Colour: use the current Framework colours and Semantic Roles as they are.
  - Style decisions: the agent proposes each default based on research; the user approves or rejects it while looking at the overview.
  - The user is non-technical: put decisions to them as plain visual choices.

#### Decisions so far

#### Not yet specified

- Which Elements beyond the core set join the overview, once research shows what SaaS and marketing sites style by default.
- How the overview behaves on small screens.
- How Draft Elements get promoted once their defaults are approved.
- Whether "Element Reference" is renamed "Element Overview" in `CONTEXT.md` once the layout is settled.
- Asking AI from inside the app to set up or tweak the defaults (colours, typography, radius), with the overview as the visual check. The user wants this to work generically rather than by manual setup; the shape is unclear until the overview and style panel exist.

#### Out of scope

- A Figma-like pan/zoom canvas. A grid overview comes first; a canvas is a later, separate effort.
- A theme driven by one main colour (shadcn-style), six intent colours, and vibrancy controls. Deferred to a later effort; this map uses the current colour system.
- Building the overview. This map ends at decisions; implementation follows as separate work.

## Comments

None.
