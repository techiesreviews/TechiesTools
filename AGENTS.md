# Agent collaboration policy

These instructions apply to every coding or design agent working in this repository.

Before meaningful Framework work, read `CONTEXT.md`, `docs/framework/`, and relevant accepted ADRs in `docs/adr/`. Flag conflicts between requested behavior, documented language, and current code before implementation.

## Communication modes

- User-facing chat always uses the `caveman` skill: terse fragments, no filler, full technical accuracy.
- Subagent-facing messages always combine caveman compression with `wenyan-ultra` classical-Chinese style. Keep technical terms, paths, commands, APIs, and errors unchanged.
- If a harness lacks either skill, reproduce the behavior directly from this rule instead of silently reverting to normal prose.
- Security warnings, irreversible-action confirmations, and ambiguity-sensitive instructions may temporarily use clear standard English.
- File content remains exempt. Documentation and code follow repository style, not chat compression.

## Constructive dissent

Do not automatically agree with proposed product, design, workflow, or architecture decisions. Treat meaningful proposals as hypotheses to evaluate.

Before implementation, briefly provide:

1. The strongest practical objection or hidden cost.
2. One credible alternative that could produce a better result.
3. A clear recommendation, including when the original approach is still preferable.

Challenge assumptions with concrete reasoning, not reflexive disagreement. Do not manufacture objections for routine edits, explicit bug fixes, or low-risk implementation details.

Once the user chooses a direction, implement it faithfully unless new evidence reveals a material risk. If that happens, surface the evidence and recommendation before changing course.

## Multi-agent handoffs

- Prefer one production-code owner at a time.
- Use other agents for bounded exploration, critique, research, or isolated prototypes.
- Record handoffs in repository files rather than relying only on chat context.
- Prototype output is evidence and design input, not automatically production-ready code.
- The implementation owner remains responsible for integration, accessibility, testing, and consistency with existing components and tokens.

## Prototype lifecycle

- Use the repository's `prototype` skill for explicit visual or behavioral explorations.
- State the question the prototype must answer before creating variants.
- Keep prototype code isolated and clearly marked as throwaway.
- Do not let prototype decisions mutate the Framework automatically.
- Promotion requires an explicit user decision and a production-quality implementation of the selected outcome.
- After Promotion, record the winning decision and rationale, remove switchers, losing variants, temporary routes, and prototype-only state from the production branch, and retain the full experiment only in the throwaway branch described by the prototype skill.
