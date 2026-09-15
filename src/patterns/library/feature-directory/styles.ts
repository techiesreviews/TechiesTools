export const featureDirectoryDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--feature-directory-radius: var(--radius-l);
display: grid;
gap: var(--space-xl);
padding: clamp(var(--space-xl), 6%, var(--space-4xl));
background: var(--semantic-text);
color: var(--semantic-surface);
container: feature-directory / inline-size;
font-family: var(--font-body);`;

export const featureDirectoryNestedCss = `& * {
	box-sizing: border-box;
}

& h2 {
	margin: 0;
	max-inline-size: 18ch;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

& .feature-directory__layout {
	display: grid;
	grid-template-columns: 13rem minmax(0, 1fr);
	gap: var(--space-xl);
}

& legend {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	clip-path: inset(50%);
	overflow: hidden;
}

& input {
	position: absolute;
	opacity: 0;
}

& .feature-directory__filters {
	min-inline-size: 0;
	margin: 0;
	padding: 0;
	border: 0;
	display: grid;
	align-content: start;
	gap: var(--space-2xs);
}

& label {
	padding: var(--space-2xs) var(--space-s);
	border-radius: var(--radius-full);
	cursor: pointer;
	font: 400 var(--text-s)/1.2 var(--font-body);
}

& label:has(input:checked) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
}

& label:has(input:focus-visible) {
	outline: 3px solid var(--semantic-focus);
}

& .feature-directory__content {
	display: grid;
	gap: var(--space-m);
}

& article {
	padding: var(--space-xl);
	border-radius: var(--feature-directory-radius);
	background: color-mix(in oklch, var(--semantic-surface) 12%, transparent);
}

& article p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h3 {
	margin: var(--space-m) 0 var(--space-xl);
	font: 400 var(--text-2xl)/1 var(--font-heading);
}

& .btn {
	--btn-background: var(--semantic-surface);
	--btn-border-color: var(--semantic-surface);
	--btn-text-color: var(--semantic-text);
}

& ul {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: var(--space-s);
	margin: 0;
	padding: 0;
	list-style: none;
}

& li {
	display: grid;
	gap: var(--space-3xs);
	padding: var(--space-m);
	border: 1px solid color-mix(in oklch, var(--semantic-surface) 22%, transparent);
	border-radius: var(--feature-directory-radius);
}

& li span {
	color: color-mix(in oklch, var(--semantic-surface) 70%, transparent);
	font: 400 var(--text-s)/1.4 var(--font-body);
}

&:has(#feature-directory-plan:checked) [data-kind]:not([data-kind="plan"]), &:has(#feature-directory-build:checked) [data-kind]:not([data-kind="build"]), &:has(#feature-directory-share:checked) [data-kind]:not([data-kind="share"]) {
	display: none;
}

&[data-density="compact"] {
	gap: var(--space-m);
}

&[data-density="compact"] li {
	padding: var(--space-s);
}`;

export const featureDirectorySupportCss = `@container feature-directory (max-width:42rem) {
	.feature-directory .feature-directory__layout {
		grid-template-columns: 1fr;
	}
	.feature-directory .feature-directory__filters {
		display: flex;
		flex-wrap: wrap;
	}
}

@container feature-directory (max-width:25rem) {
	.feature-directory ul {
		grid-template-columns: 1fr;
	}
}

@media (prefers-reduced-motion:reduce) {
	.feature-directory * {
		transition: none;
	}
}`;
