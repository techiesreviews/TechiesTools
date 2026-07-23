# Export dialog prototype

Question: which focused interaction best supports individual copy/download of `tokens.css`, `elements.css`, and `context.md`, one ZIP download, dependency order, diagnostics, self-contained Context behavior, and provenance?

Three throwaway variants mount inside the existing Framework export dialog:

- `?variant=A` — Artifact checklist with file/code focus.
- `?variant=B` — Bundle-first overview with direct file actions.
- `?variant=C` — Guided sequence with advisory handling in context.

Run from this worktree:

```sh
npm run dev
```

Open `/framework/design-system?variant=A`, open Export, then use floating switcher or Left/Right arrow keys.
