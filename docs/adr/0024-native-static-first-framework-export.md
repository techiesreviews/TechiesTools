---
status: accepted
amends: ADR-0020
---

# Native, static-first Framework export

Everything the Framework exports — `tokens.css`, `elements.css`, `components.css`, Pattern markup, and any Component behaviour — is native HTML and CSS first. Core functionality works without JavaScript; JavaScript only enhances. This applies to the export, not to the techies.tools application, which may keep using Astro.

- **Root baseline.** `elements.css` styles bare Elements without classes, in the classless manner of Pico CSS. Every page and Component inherits that baseline.
- **Components override only.** A Component's `@scope` rules in `components.css` change only what differs from the root baseline. Anything a Component does not override keeps the Default Treatment, so a root change reaches every Component.
- **No shadow DOM.** Exported Components never attach a shadow root. Element rules do not cross a shadow boundary, so a walled Component would silently lose the root baseline and every later root change.
- **Built-in behaviour before scripts.** Interactive Components use native primitives where they exist: `popover` and `popovertarget` for menus and tooltips, `<details>` (with `name` for exclusive accordions) for disclosure, `<dialog>` opened by invoker commands, scroll snap for carousels, and constraint validation for forms. Where no primitive exists, the HTML-only state must remain usable — for example, tab panels render stacked with their headings.
- **Enhancement scripts are light-DOM custom elements.** When a script adds behaviour, it upgrades markup that is already present in the page. It does not render the Component's content.
- **No Astro in the export.** Structure is authored once inside techies.tools and written out as plain HTML. Exported output has no build-tool or framework runtime dependency.

## Considered options

- **Shadow DOM with a shared copy of the root styles adopted into every Component.** This keeps style isolation, but each Component must remember to load the baseline, and one omission silently drops back to browser defaults. Rejected: isolation is already provided by `@scope` boundaries without blocking inheritance of the baseline.
- **Script-rendered light-DOM Components.** These give "change once, updated everywhere" at runtime, but content is absent without JavaScript. Rejected as the default: reuse belongs to authoring inside techies.tools, not to the visitor's browser.
- **A build-tool Component format such as Astro.** This offers static output, slots, and reuse, but ties exported work to one toolchain. Rejected for the export; acceptable inside the application.

## Consequences

- The Element Overview and every Preview must show Components inheriting the root baseline, so a Primitive change visibly reaches all of them.
- Component Guidance that needs JavaScript must document its HTML-only state.
- Component structure changes are repeated across exported pages by re-exporting from techies.tools, not by a runtime.
