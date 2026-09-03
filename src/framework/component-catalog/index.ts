export type ComponentId = "button";

export interface ComponentDefinition {
	id: ComponentId;
	title: string;
	selector: `.${string}`;
	lifecycle: "Active" | "Draft";
	declarations: string;
	nestedCss: string;
	css: string;
	purpose: string;
	defaultTreatment: string;
	composition: string;
	variants: string;
	states: string;
	contentConstraints: string;
	accessibility: string;
	do: string;
	avoid: string;
	liveExample: string;
	semanticHtml: string;
}

const buttonBaseDeclarations = `display: inline-flex;
align-items: center;
justify-content: center;
gap: var(--space-3xs);
min-block-size: var(--btn-min-block-size, 2.75rem);
border-width: 1px;
border-style: solid;
border-color: var(--btn-border-color, var(--btn-background, var(--semantic-action)));
border-radius: var(--btn-radius, var(--radius-m));
padding: var(--btn-padding-block, var(--space-3xs)) var(--btn-padding-inline, var(--space-s));
background: var(--btn-background, var(--semantic-action));
color: var(--btn-text-color, var(--semantic-surface));
font-weight: var(--btn-font-weight, 650);
font-size: var(--btn-font-size, var(--text-m));
line-height: 1.2;
font-family: var(--font-body);
text-decoration: none;
cursor: pointer;
transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease;`;

const buttonNestedCss = `&:hover {
	background: color-mix(in oklch, var(--btn-background, var(--semantic-action)) 88%, var(--semantic-text));
	transform: translateY(-.1rem);
}

&:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 2px;
}

&[data-variant="secondary"] {
	--btn-background: var(--semantic-surface);
	--btn-border-color: var(--semantic-border);
	--btn-text-color: var(--semantic-text);
}

&[data-variant="ghost"] {
	--btn-background: transparent;
	--btn-border-color: transparent;
	--btn-text-color: var(--semantic-action);
}

&[data-size="small"] {
	--btn-min-block-size: 2.25rem;
	--btn-padding-block: var(--space-4xs);
	--btn-padding-inline: var(--space-xs);
	--btn-font-size: var(--text-s);
}

&[data-size="large"] {
	--btn-min-block-size: 3.25rem;
	--btn-padding-block: var(--space-xs);
	--btn-padding-inline: var(--space-m);
	--btn-font-size: var(--text-l);
}

@media (prefers-reduced-motion: reduce) {
	& {
		transition: none;
	}
}`;

const indent = (source: string) => source.split("\n").map((line) => `\t${line}`).join("\n");

export const buttonComponentCss = `.btn {
${indent(buttonBaseDeclarations)}

${indent(buttonNestedCss)}
}`;

export const componentDefinitions: readonly ComponentDefinition[] = Object.freeze([
	Object.freeze({
		id: "button",
		title: "Button",
		selector: ".btn",
		lifecycle: "Active",
		declarations: buttonBaseDeclarations,
		nestedCss: buttonNestedCss,
		css: buttonComponentCss,
		purpose: "Present a consistent primary action treatment on button and link semantics.",
		defaultTreatment: "Primary semantic action color, medium Framework spacing and type, medium radius, and visible hover and focus treatments.",
		composition: "Apply .btn to one semantic <button> or action <a>. Compositions may set documented --btn-* hooks without reproducing the treatment.",
		variants: "Primary is the default. Use data-variant=\"secondary\" or data-variant=\"ghost\"; use data-size=\"small\" or data-size=\"large\".",
		states: "Hover changes the contextual background and lifts slightly. Focus-visible uses the Framework focus role. Reduced motion removes transitions.",
		contentConstraints: "Use a short action label. Keep icons supplementary and preserve an accessible name.",
		accessibility: "Use <button type=\"button\"> for in-page actions and <a href> for navigation. Do not remove the focus-visible treatment.",
		do: "Use one clear primary action per local context; select explicit variants for hierarchy.",
		avoid: "Do not copy shape, spacing, typography, or interaction declarations into a Pattern.",
		liveExample: '<button class="btn" type="button">Continue</button>',
		semanticHtml: '<button class="btn" type="button">Continue</button>',
	}),
]);

export const activeComponentDefinitions = componentDefinitions.filter((component) => component.lifecycle === "Active");

export const getComponentDefinition = (id: ComponentId) => activeComponentDefinitions.find((component) => component.id === id);
