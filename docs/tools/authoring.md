# Tool authoring contract

Use this contract when adding a first-class generator under `/tools/*`. It captures the shared interaction model, architecture, and verification evidence expected for every tool.

## 1. Preflight before code

Write these four short artifacts in the issue, plan, or tool-specific test:

1. **Control inventory** — every user-editable control, its type, range/options, default, section, and whether it is basic or advanced.
2. **State-output mapping** — map each control to the state field, preview effect, persisted value, and export artifact it changes. A control is not complete when one surface is missing.
3. **Preview contract** — canonical route, minimum/maximum viewport, direct-manipulation geometry, keyboard equivalent, and loading/empty/error states.
4. **Output contract** — sanitized state is the only input to Preview, copy, download, and generated artifacts.

Resolve unknown ranges, labels, defaults, and output semantics before choosing components. Do not infer them while styling.

## 2. Shared-first component selection

Use a **built-in/shared first** hierarchy:

1. Existing TechiesTools component with the correct contract.
2. Small extension to that shared component.
3. New reusable primitive with a tool-independent API.
4. Tool-local control only when its interaction is genuinely domain-specific.

Current shared primitives:

- `src/components/settings/SettingsBar.astro` — pinned tool header, scrolling content, pinned footer.
- `src/components/settings/SettingsAccordion.astro` — contextual single-open disclosure section and compact summary.
- `src/components/settings/SettingsColorField.astro` — synchronized native picker and hexadecimal field, with optional sanitized Framework Colors shortcuts. Each authored Framework color exposes its complete generated variable scale (`lightest`, `lighter`, `light`, base, `dark`, `darker`, `darkest`); choosing one still writes a plain hexadecimal value so tool state and exports remain portable.
- `src/components/settings/SettingsExportActions.astro` — canonical pinned-footer Export and direct-copy actions.
- `src/components/settings/SettingsExportDialog.astro` — canonical native export dialog, backdrop, surface, header, close control, and live feedback.
- `src/components/settings/SettingsExportDialogBody.astro` — responsive Framework-derived sidebar and Preview split.
- `src/components/settings/SettingsExportChoice.astro` — canonical selectable export artifact card and action-row presentation.
- `src/components/settings/SettingsExportChoiceSet.astro` — complete canonical sidebar set: selectable artifact cards, per-artifact Copy and Save actions, and final Download all action. Tools configure data hooks and artifact copy; they do not reproduce this markup or styling.
- `src/components/settings/SettingsExportCodePreview.astro` — bounded, internally scrolling code Preview shared by export dialogs.
- `src/components/settings/SettingsRangeField.astro` — labeled range with canonical value output.
- `src/components/settings/SettingsSegmentedControl.astro` — compact mutually exclusive choices.
- `src/components/preview/PreviewBrowser.astro` — mandatory address, responsive presets, pixel width, zoom readout, and viewport slider.

Do not recreate these controls, their controller behavior, or their styles inside a tool.

## 3. Settings bar structure

- Keep persistent tool controls in the Settings bar, not in ad-hoc Preview toolbars.
- Use a short, headerless setup block only when it applies globally.
- Group related controls in contextual accordions. Aim for two to seven visible controls per section.
- Open the first task-critical section by default. Keep one section open at a time.
- Summaries must expose the current high-signal values without opening the section.
- Put advanced controls next to the basic control they refine; disclose them only when the basic path remains useful.
- Keep reset in the Settings header. Keep copy/download/export actions in the pinned footer.

## 4. Preview contract

Every first-class tool uses `PreviewBrowser.astro`. The component owns browser chrome and viewport behavior:

- current page/address;
- desktop, tablet, and mobile presets;
- current pixel width;
- zoom readout;
- continuous viewport slider;
- a default Fit view that follows the available Preview width without horizontal overflow;
- optional route suggestions;
- `preview-browser:resize` and `preview-browser:set-bounds` integration events.

The tool supplies only its rendered canvas. Tool-specific controls belong in the Settings bar unless they are direct manipulation on the result itself. Direct manipulation must use local coordinates, Pointer Events with capture, clamped state, and a keyboard-equivalent path.

## 5. State and output architecture

Use four explicit layers:

1. **Model** — typed defaults, limits, and sanitization.
2. **Compiler** — pure deterministic transformation from sanitized state to CSS/HTML/other artifacts.
3. **Preferences** — versioned parsing and serialization under a tool-specific storage key.
4. **Browser controller** — binds shared controls, direct manipulation, persistence, Preview, copy, and downloads.

Preview and every export compile from the same sanitized state. Never maintain a second export-only state or hand-build CSS in the controller.

## 6. React decision record

React is allowed per tool, not required globally. Record the choice before adding its runtime:

Use React when the tool has a dense interaction graph, reusable stateful widgets that materially reduce complexity, or an ecosystem integration that cannot be expressed cleanly with Astro and focused browser modules.

Keep Astro plus TypeScript when controls are mostly form inputs, the compiler is pure, progressive enhancement matters, or React would duplicate the shared Settings/Preview shell. Do not add React only to render static markup or ordinary range/color controls.

A React tool must still use the shared Settings and Preview contracts, keep the compiler framework-agnostic, isolate hydration to the smallest island, and justify bundle/runtime cost in its PR.

## 7. Verification gate

Before review:

- Test defaults, sanitization boundaries, deterministic compiler output, persistence migration/fallback, and every state-output mapping.
- Test that the route uses shared Settings and Preview primitives.
- Exercise mouse, touch/Pointer Events, and keyboard equivalents.
- Verify at the Preview presets and at breakpoint boundaries, not just three fixed screenshots.
- Verify Settings scrolling and pinned footer at short viewport heights.
- Run `npm run test`, `npm run check`, and `npm run build`.
- Perform a real-browser pass on the final build and inspect console errors.

## Source inspiration

The control-inventory discipline, control-selection hierarchy, panel grouping heuristics, and Preview/canvas separation were informed by [pixel-point/toolcraft](https://github.com/pixel-point/toolcraft), reviewed at commit `682a159`. This document is a project-specific synthesis; no Toolcraft source code was copied. Toolcraft is MIT-licensed; copying or distributing substantial portions would require preserving its copyright and permission notice.

Discrete range step markers follow the geometry principle demonstrated by Toolcraft's [`SliderMarkers`](https://github.com/pixel-point/toolcraft/blob/682a159/src/toolcraft/ui/components/primitives/slider/slider-parts.tsx): markers belong to the track, omit redundant endpoints, and derive position from the value span instead of guessed thumb padding. TechiesTools retains its native range input, shared Settings styling, and framework-free controller contract; no Toolcraft source code is copied.
