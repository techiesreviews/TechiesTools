# Generative UI Framework

The Generative UI Framework captures a person's design preferences as reusable guidance so AI-generated interfaces remain recognizable, coherent, and appropriate across pages.

## Language

**Main menu**:
The persistent starting rail for moving between resources and tools. It can resize or collapse into an icon rail while keeping the selected workflow available.
_Avoid_: Sidebar, app sidebar, primary sidebar

**Framework sidebar**:
The contextual panel attached to the **Main menu** when the **Framework** tool is active. It contains the controls for editing Framework preferences and Primitives.
_Avoid_: Settings bar, secondary sidebar, settings sidebar

**Accordion section**:
A collapsible group in the **Framework sidebar** with the section name on the left, a compact preview on the right, and a chevron that opens or closes the content.
_Avoid_: Dropdown, settings row

**Framework**:
The complete preference system that guides how an AI composes and presents generative interfaces. It contains **Primitives** and progressively adds guidance for elements, components, sections, and pages.
_Avoid_: Token generator, theme

**Primitive**:
A foundational design choice from which higher-level interface decisions are derived, such as color, typography, spacing, or radius.
_Avoid_: Style, component

**Semantic Role**:
A purpose-based alias that connects Primitives to interface meaning without binding guidance to a specific palette value. The initial canonical color roles are Primary, Action, Surface, Text, Border, and Focus.
_Avoid_: Color swatch, component color

**Generative UI**:
An interface composed by AI from the Framework's established preferences and guidance rather than designed as an isolated page.
_Avoid_: Random UI, template

**Element Guidance**:
The Framework's preferred meaning, usage, presentation, constraints, and accessibility expectations for a semantic HTML element.
_Avoid_: Element demo, CSS reset catalogue

Each Element Guidance entry contains its purpose, Default Treatment, allowed variants, content constraints, accessibility behavior, positive and negative guidance, a live example, and a semantic HTML example.

**Component Guidance**:
The Framework's preferred composition, presentation, variants, states, and reuse rules for a styled interface pattern that may be built from one or more semantic elements.
_Avoid_: Element Guidance, page section

**Supported Element**:
A semantic HTML element for which the Framework provides explicit Element Guidance and a Default Treatment.
_Avoid_: Styled tag

**Native Fallback**:
The browser's default presentation and behavior for a valid HTML element that has no explicit Element Guidance. Native Fallback prevents missing guidance from becoming invented preference.
_Avoid_: Unsupported element, broken style

**Element Reference**:
The searchable, deep-linkable Preview that presents Supported Elements by intent and shows their current Element Guidance.
_Avoid_: Component library, HTML dump

**Context Document**:
The portable, framework-agnostic document an AI receives before generating an interface. It combines the person's Framework preferences, guidance, constraints, and examples without requiring the visualization app or a specific rendering technology.
_Avoid_: CSS export, design-system webpage, implementation spec

**Context Export**:
The generated downloadable form of the Context Document, assembled from modular Framework sources for use with React, Astro, native HTML/CSS, page builders, or other UI harnesses.
_Avoid_: Source archive, website export

**Context Import**:
An optional, validated proposal to apply changes from an externally used Context Document back into the Framework. Import succeeds only when required Framework Definitions remain intact and never mutates the Framework without review.
_Avoid_: File upload, automatic synchronization

**Framework Definition**:
A required structural or semantic contract that makes Framework guidance unambiguous and round-trippable, including identity, versions, stable entry identifiers, and defined guidance fields.
_Avoid_: Visual preference, prose convention

**Import Diagnostic**:
A structured explanation of a Context Import problem that identifies what failed, why safe mapping is impossible, and how a person or AI can repair it.
_Avoid_: Validation error, import failed

**Accessibility Check**:
A contextual evaluation of a rendered subject against the relevant background, adjacent color, state, or interaction requirement. It reports evidence and repair guidance without claiming whole-page conformance.
_Avoid_: Accessibility score, compliance badge

**Repair Prompt**:
A copyable, narrowly scoped instruction generated from an Import Diagnostic that asks an AI to restore the violated Framework Definition without changing unrelated preferences.
_Avoid_: Automatic fix, rewrite prompt

**Implementation Reference**:
Portable CSS variables, component CSS, and semantic markup included in the Context Document to demonstrate a concrete realization of the Framework's intent. It informs translation but does not replace semantic guidance.
_Avoid_: Required framework code, generated application

**Standards Reference**:
An external, current source used by an AI to validate web semantics, implementation, compatibility, accessibility, and technical quality. Standards References govern correctness; the Framework governs personal design preference.
_Avoid_: Inspiration source, taste override

**Framework Version**:
The version of the preference content represented by a Context Export. It changes independently from the Context Document schema and identifies whether two exports express the same guidance.
_Avoid_: App version, schema version

**Framework Identity**:
The stable user-editable name and identifier shared by versions of the same Framework. New Frameworks default to the display name `Techies Framework` and identifier `techies`.
_Avoid_: Repository name, export filename

**Starter Default**:
An intentional, usable initial Framework preference supplied to a new person and included in Context Export until changed. It differs from a Placeholder, which exists only to keep unfinished UI renderable and must not be presented as preference.
_Avoid_: Demo value, sample data

**Active Framework**:
The single Framework currently edited, previewed, persisted, and exported by techies.tools. Version one does not manage a library of multiple saved Frameworks.
_Avoid_: Selected project, workspace

**Default Treatment**:
The prescriptive presentation and behavior an AI must use for an element unless the person explicitly requests an exploration or override.
_Avoid_: Suggestion, example style

**Exploration**:
An explicitly requested departure from one or more Default Treatments used to compare alternative design intentions. Exploration is not implicit in ordinary generation.
_Avoid_: Variation, randomization

**Prototype**:
A temporary, isolated implementation used by an Exploration to answer one explicit design or behavior question. It is evidence for a decision, not production-ready output.
_Avoid_: Draft feature, alternate production page

**Promotion**:
The explicit decision to incorporate a validated Prototype outcome into the Framework as production guidance. Promotion identifies what becomes a Default Treatment and what remains temporary.
_Avoid_: Merge everything, automatic learning

**Preview**:
A representative interface used to evaluate whether the Framework produces coherent results. A Preview validates the Framework; it is not itself the generated deliverable.
_Avoid_: Final website, template

## Example dialogue

**Designer**: "The paragraph feels too prominent in this Generative UI."

**Developer**: "The typography Primitive is correct, so I will check the paragraph's Element Guidance before changing the Framework."

**Designer**: "Good. The Preview should demonstrate that normal paragraphs use the preferred body treatment while introductory text uses a deliberate variant."

**Developer**: "Should that variant become the new Default Treatment?"

**Designer**: "No. This is an Exploration until I explicitly promote it into the Framework."

**Developer**: "After Promotion, I will retain the decision and its rationale, then remove the Prototype machinery and losing alternatives from the production branch."

**Designer**: "What happens when generated content needs an element outside the Supported Element set?"

**Developer**: "It keeps its Native Fallback until you define a Default Treatment for it."

**Designer**: "Is the Element Reference what the AI consumes?"

**Developer**: "No. It visualizes the same guidance assembled into the Context Export, which remains portable across implementation technologies."

**Designer**: "Does techies.tools stay connected while an AI uses the export?"

**Developer**: "No. The Context Document works independently. It returns through Context Import only when its Framework Definitions remain valid."
