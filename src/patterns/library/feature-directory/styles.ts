export const featureDirectoryDefaultCss = `--feature-directory-radius: var(--radius-l);
padding: clamp(var(--space-xl), 6%, var(--space-4xl));
background: var(--semantic-text);
color: var(--semantic-surface);
container: feature-directory_component/inline-size;`;

export const featureDirectoryNestedCss = `.heading-style-h2 {
	max-inline-size: 18ch;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

.layout {
	grid-template-columns: 13rem minmax(0, 1fr);
}

input {
	position: absolute;
	opacity: 0;
}

.filters {
	margin: 0;
	padding: 0;
	border: 0;
	align-content: start;
	gap: var(--space-2xs);
}

label {
	padding: var(--space-2xs) var(--space-s);
	border-radius: var(--radius-full);
	cursor: pointer;
	font: 400 var(--text-s)/1.2 var(--font-body);
}

label:has(input:checked) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
}

label:has(input:focus-visible) {
	outline: 3px solid var(--semantic-focus);
}

.results {
	gap: var(--space-m);
}

article {
	padding: var(--space-xl);
	border-radius: var(--feature-directory-radius);
	background: color-mix(in oklch, var(--semantic-surface) 12%, transparent);
}

.heading-style-h3 {
	margin: var(--space-m) 0 var(--space-xl);
	font: 400 var(--text-2xl)/1 var(--font-heading);
}

ul {
	--_columns: 2;
	gap: var(--space-s);
}

li {
	gap: var(--space-3xs);
	padding: var(--space-m);
	border: 1px solid color-mix(in oklch, var(--semantic-surface) 22%, transparent);
	border-radius: var(--feature-directory-radius);
}

li span {
	color: color-mix(in oklch, var(--semantic-surface) 70%, transparent);
	font: 400 var(--text-s)/1.4 var(--font-body);
}

:scope:has(#feature-directory-plan:checked) [data-kind]:not([data-kind="plan"]),:scope:has(#feature-directory-build:checked) [data-kind]:not([data-kind="build"]),:scope:has(#feature-directory-share:checked) [data-kind]:not([data-kind="share"]) {
	display: none;
}

:scope[data-density="compact"] {
	gap: var(--space-m);
}

:scope[data-density="compact"] li {
	padding: var(--space-s);
}

@container feature-directory_component (max-width:42rem) {
	.layout {
		grid-template-columns: minmax(0, 1fr);
	}
	.filters {
		display: flex;
		flex-wrap: wrap;
	}
}

@container feature-directory_component (max-width:25rem) {
	ul {
		--_columns: 1;
	}
}

@media (prefers-reduced-motion:reduce) {
	* {
		transition: none;
	}
}`;

export const featureDirectorySupportCss = `@scope (.feature-directory_component .button_component) to ([class*="_component"]) {
	:scope {
		--btn-background: var(--semantic-surface);
		--btn-border-color: var(--semantic-surface);
		--btn-text-color: var(--semantic-text);
	}
}`;
