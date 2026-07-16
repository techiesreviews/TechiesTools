# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`.
- **Read an issue**: `gh issue view <number> --comments`, including labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments` with appropriate label and state filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`.
- **Apply or remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.

Infer the repo from `git remote -v`; `gh` does this automatically inside the clone.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub shares one number space across issues and PRs. Resolve an ambiguous number with `gh pr view <number>` and fall back to `gh issue view <number>`.

## Skill operations

- When a skill says **publish to the issue tracker**, create a GitHub issue.
- When a skill says **fetch the relevant ticket**, run `gh issue view <number> --comments`.

## Wayfinding operations

- **Map**: one issue labelled `wayfinder:map`, containing Destination, Notes, Decisions so far, Not yet specified, and Out of scope.
- **Child ticket**: a GitHub sub-issue of the map. If sub-issues are unavailable, add it to a map task list and put `Part of #<map>` at the start of its body. Apply one label: `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, or `wayfinder:task`.
- **Blocking**: use GitHub native issue dependencies. POST to `repos/techiesreviews/TechiesTools/issues/<child>/dependencies/blocked_by` with the blocker's numeric database `issue_id`. If dependencies are unavailable, use `Blocked by: #<n>` in the child body.
- **Frontier**: open, unblocked, unassigned children in map order.
- **Claim**: `gh issue edit <number> --add-assignee @me` before work.
- **Resolve**: comment with the answer, close the issue, then append a linked gist to the map's Decisions so far.

External tracker writes require the user's request or confirmation; configuration alone does not authorize unrelated issue, label, PR, or tracker mutations.
