# Kitchen extras: TechiesTools

`scripts/agents/kit rulebook` prints the shared kitchen rulebook, then this file. Where they differ,
this file wins, with one exception (Lex, 2026-10-30): on routing and review (which model builds or
reviews, the second look) the shared rulebook wins over this file, `AGENTS.md` and
[adaptive-orchestration.md](adaptive-orchestration.md).

## Branches, checks and the shared file

- **Landing branch `develop`, release branch `main`** (`branches` in `scripts/agents/kit.json`);
  CI runs on pull requests into both (`.github/workflows/deploy.yml`).
- **Checks:** `checks.check` is `npm run check` (`astro check`), `checks.test` is `npm test`
  (`node --experimental-strip-types --test tests/*.test.mjs`); there is no lint. `kit pr` runs both
  for every change; `kit unit` runs the same test files (`unit` in the settings). CI also builds the
  site (`npm run build -- --mode preview`, or `production` into `main`).
- **Own check commands:** none (`scripts/agents/project.d/` is empty).
- **Shared file:** none.
- **Docs the shared rulebook names:** issue tracker guide [issue-tracker.md](issue-tracker.md)
  (markdown tickets in `docs/wayfinder/`); no runner guide, UX rulebook or routines of its own: the
  shared rulebook's stations apply. Framework work follows `CONTEXT.md`, `docs/framework/`, the
  accepted ADRs in `docs/adr/` ([domain.md](domain.md)) and, for components and Patterns,
  `docs/framework/component-authoring.md` (`standards` in the settings, with `AGENTS.md`).

## Visible changes

- **Feature list:** none; no `kit ux` check.
- **Screenshots:** run the site with `npm run dev` (Astro on 127.0.0.1) and use the T3 `preview_*`
  tools; compare against <https://preview.techies.tools> for today's screens.

## After a merge

- Every push to `develop` runs the "Verify and deploy" workflow: check, tests, build in preview mode,
  then deploys the `techies-tools-preview` Worker to <https://preview.techies.tools>. There is no
  local after-merge step; the lead checks that run is green. Lex tries a change on the preview.

## Release

- After Lex's "ship it": `kit pr --release` (`develop` into `main`). The push to `main` runs the same
  workflow in production mode and deploys the `techies-tools` Worker to <https://techies.tools>.
  First-hour check: the run is green and <https://techies.tools> serves the change. The live version
  is the `main` commit that run names.

## Other

- **Worktrees:** `.claude/worktrees/` (ignored by git) and sibling folders such as
  `../TechiesTools-<name>` keep working; Lex's main checkout is never a build folder.
- **Skills:** none in the repo (Lex, 2026-10-30): the `mattpocock/skills` set that was vendored in
  `.agents/skills/` (with `skills-lock.json`) was removed; agents use the copies installed on Lex's
  computer.
- **Issues:** the 19 GitHub Issues open on 2026-10-30 are tickets in `docs/wayfinder/backlog/`;
  they stay open on GitHub until Lex OKs closing them (`kit init --issues --close`).

## Agent rules

These were `AGENTS.md`'s own rules before the shared kit (moved 2026-10-30). Two lines changed:
"Multi-agent handoffs" names where review runs, and "Prototype lifecycle" no longer calls the
`prototype` skill the repository's.

### Communication modes

- User-facing chat always uses the `caveman` skill: terse fragments, no filler, full technical accuracy.
- Subagent-facing messages always combine caveman compression with `wenyan-ultra` classical-Chinese style. Keep technical terms, paths, commands, APIs, and errors unchanged.
- If a harness lacks either skill, reproduce the behavior directly from this rule instead of silently reverting to normal prose.
- Security warnings, irreversible-action confirmations, and ambiguity-sensitive instructions may temporarily use clear standard English.
- File content remains exempt. Documentation and code follow repository style, not chat compression.

### Constructive dissent

Do not automatically agree with proposed product, design, workflow, or architecture decisions. Treat meaningful proposals as hypotheses to evaluate.

Before implementation, briefly provide:

1. The strongest practical objection or hidden cost.
2. One credible alternative that could produce a better result.
3. A clear recommendation, including when the original approach is still preferable.

Challenge assumptions with concrete reasoning, not reflexive disagreement. Do not manufacture objections for routine edits, explicit bug fixes, or low-risk implementation details.

Once the user chooses a direction, implement it faithfully unless new evidence reveals a material risk. If that happens, surface the evidence and recommendation before changing course.

### Multi-agent handoffs

- Prefer one production-code owner at a time.
- Use other agents for bounded exploration, critique, research, or isolated prototypes. Code review and the second look run through `scripts/agents/kit review` and `kit pr` with the shared rulebook's pins.
- Record long-lived or cross-session handoffs in repository files rather than relying only on chat context. Same-task background delegation may use an injected prompt when no later session must recover it.
- Prototype output is evidence and design input, not automatically production-ready code.
- The implementation owner remains responsible for integration, accessibility, testing, and consistency with existing components and tokens.

### Prototype lifecycle

- Use the `prototype` skill for explicit visual or behavioral explorations.
- State the question the prototype must answer before creating variants.
- Keep prototype code isolated and clearly marked as throwaway.
- Do not let prototype decisions mutate the Framework automatically.
- Promotion requires an explicit user decision and a production-quality implementation of the selected outcome.
- After Promotion, record the winning decision and rationale, remove switchers, losing variants, temporary routes, and prototype-only state from the production branch, and retain the full experiment only in the throwaway branch described by the prototype skill.
