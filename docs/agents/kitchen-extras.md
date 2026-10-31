# Kitchen extras: TechiesTools

`scripts/agents/kit rulebook` prints the shared rulebook, then this file. Where they differ, this
file wins.

## Branches, checks and the shared file

- **Landing branch `dev`, release branch `main`** (`branches` in `scripts/agents/kit.json`). Every
  change lands on `dev` through `scripts/agents/kit pr`; `main` only takes `dev`, through
  `scripts/agents/kit pr --release`. The push guard refuses agents' raw pushes to both.
- **Checks:** `npm run check` (Astro check) and `npm test` (Node's test runner over
  `tests/*.test.mjs`), both on every change; there is no lint command. GitHub Actions runs the same
  two plus a build on every pull request into `dev` or `main` (`.github/workflows/deploy.yml`).
- **Own check commands:** none (`scripts/agents/project.d/` is empty).
- **Shared file:** none.
- **Docs the shared rulebook names:** issue tracker `docs/agents/issue-tracker.md` (GitHub Issues,
  including the wayfinder maps), triage labels `docs/agents/triage-labels.md`, domain docs
  `docs/agents/domain.md`, multi-agent work `docs/agents/adaptive-orchestration.md`. There is no
  runner guide, UX rulebook or routine.

## Visible changes

- **Feature list:** none.
- **Screenshots:** run `npm run dev` and shoot the changed pages; the merged change is on
  `https://preview.techies.tools`.

## After a merge

- A push to `dev` deploys the preview (`https://preview.techies.tools`) through GitHub Actions;
  check that run. Lex tries a change there.

## Release

- After `kit pr --release` merges `dev` into `main`, GitHub Actions checks, builds and deploys
  production (`https://techies.tools`); the run's log and `npx wrangler deployments list` record the
  live version. First-hour check: the home page and a changed page answer 200 on techies.tools.
- **Local escape hatch:** `npm run deploy:production` starts with `scripts/agents/kit release-check`
  (nothing unsaved, HEAD exactly `origin/main`) and is only for when GitHub Actions is unavailable
  (`docs/operations/deployment.md`).

## Other

- Wayfinder maps are GitHub Issues here (`docs/agents/issue-tracker.md`), so `kit.json` names no
  `maps` folder.
