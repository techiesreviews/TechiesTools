# Issue tracker: markdown tickets in the repo

Issues, PRDs and wayfinder maps for this repo are markdown files committed on `develop`. New work does not go into GitHub Issues: the open Issues were copied into `docs/wayfinder/backlog/` by `scripts/agents/kit init --issues` on 2026-10-30, and closing them waits for Lex's OK.

## Conventions

- A map is a folder: `docs/wayfinder/<map>/` with `map.md` and one file per ticket in `tickets/NN-<slug>.md`, numbered from `01`. Never put several tickets in one file.
- Each ticket starts with frontmatter: `title`, `type` (`research (AFK)`, `prototype (HITL)`, `grilling (HITL)` or `task (AFK|HITL)`), `status` (a triage role from `triage-labels.md`, `open` or `closed`), `assignee`, `blocked_by: [NN-slug, …]`. A ticket copied from GitHub keeps its `issue: <url>` line.
- Comments and conversation append to the end of the file under `## Comments`. A change Lex asks for opens with "Lex (YYYY-MM-DD): …".
- Tickets land on `develop` through `scripts/agents/kit pr`, like every other change.
- `node "$(scripts/agents/kit --home)/tickets.mjs" check` validates every map; `node "$(scripts/agents/kit --home)/tickets.mjs" frontier [map]` lists the open, unblocked tickets.

## When a skill says "publish to the issue tracker"

Create the ticket file in the map it belongs to (a new map folder when none fits; `docs/wayfinder/backlog/` for loose work), then land it through `kit pr`.

## When a skill says "fetch the relevant ticket"

Read the file at the path you were given. An old GitHub Issue number is found by its `issue:` line: `grep -rl "issues/<number>$" docs/wayfinder`.

## Wayfinding operations

- **Map**: `docs/wayfinder/<map>/map.md`. Its frontmatter holds `label: wayfinder:map`, `title`, `charted` and `tracker`. Its body holds Destination, Notes, Decisions so far, Not yet specified and Out of scope.
- **Child ticket**: a file in the map's `tickets/` with the frontmatter above. Body: `## Question` (or the copied `## Issue`).
- **Blocking**: the `blocked_by` list. A ticket is unblocked when every ticket it lists has `status: closed`.
- **Frontier**: open, unblocked tickets with no `assignee`, lowest number first (`tickets.mjs frontier`).
- **Claim**: fill in `assignee:` and land that change before doing any work.
- **Resolve**: append `## Resolution (YYYY-MM-DD)`, set `status: closed`, then add one line to the map's Decisions so far: `- [<ticket title>](tickets/NN-<slug>.md): <gist>`.
- **Out of scope**: close the ticket and add one line under the map's Out of scope.

GitHub writes (Issues, labels, comments) still need Lex's request or confirmation.
