export const FeatureJourneyDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--feature-journey-radius: var(--radius-l);
display: grid;
gap: var(--space-3xl);
padding: clamp(var(--space-xl), 6%, var(--space-4xl));
background: color-mix(in oklch, var(--semantic-action) 6%, var(--semantic-surface));
color: var(--semantic-text);
container: feature-journey/inline-size;
font-family: var(--font-body);`;

export const FeatureJourneyNestedCss = `& * {
	box-sizing: border-box;
}

& .feature-journey__diagram {
	position: relative;
	display: flex;
	align-items: center;
	gap: var(--space-xs);
	block-size: 6rem;
	margin-block: var(--space-m);
	color: var(--semantic-action);
}

& i {
	display: block;
	inline-size: 2.25rem;
	block-size: 2.25rem;
	border: 1px solid currentColor;
	border-radius: 50%;
	background: color-mix(in oklch, var(--semantic-action) 8%, var(--semantic-surface));
	transition: transform .3s ease;
}

& i:nth-child(2) {
	transform: translateY(-.6rem);
}

& li:nth-child(2) i {
	border-radius: var(--radius-s);
	rotate: 45deg;
}

& li:nth-child(3) i {
	margin-inline-end: -1.1rem;
	border-radius: var(--feature-journey-radius);
	transform: rotate(-10deg);
}

& li:nth-child(3) i:nth-child(2) {
	transform: rotate(6deg) translateY(-.5rem);
}

& li:hover i, & li:focus-within i {
	transform: translateY(-.4rem) rotate(12deg);
}

& summary:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 4px;
}

&[data-density="compact"] ol {
	gap: var(--space-xs);
}

& header {
	max-inline-size: 42rem;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.94 var(--font-heading);
	letter-spacing: -.06em;
}

& ol {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-m);
	margin: 0;
	padding: 0;
	list-style: none;
	border-block: 1px solid var(--semantic-border);
}

& li {
	min-block-size: 17rem;
	padding: var(--space-l) var(--space-s);
	border-inline-start: 1px solid var(--semantic-border);
}

& li:first-child {
	border: 0;
}

& h3 {
	margin: var(--space-l) 0;
	font: 400 var(--text-xl)/1 var(--font-heading);
}

& summary {
	cursor: pointer;
	font: 600 var(--text-s)/1.4 var(--font-body);
}

& details p {
	margin-block: var(--space-s);
}

& aside {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: var(--space-m);
	align-items: end;
	padding: var(--space-xl);
	background: var(--semantic-surface);
	border: 1px solid var(--semantic-border);
	border-radius: var(--feature-journey-radius);
}

& aside > p { grid-column: 1 / -1; }
& aside h3 {
	margin: 0;
}`;

export const FeatureJourneySupportCss = `@container feature-journey (max-width:42rem) {
	.feature-journey ol {
		grid-template-columns: 1fr;
	}
	.feature-journey li {
		min-block-size: auto;
		border-block-start: 1px solid var(--semantic-border);
		border-inline: 0;
	}
	.feature-journey aside {
		grid-template-columns: 1fr;
	}
}

@media (prefers-reduced-motion:reduce) {
	.feature-journey .feature-journey__diagram i {
		transition: none;
	}
}`;
