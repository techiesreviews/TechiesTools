export const ProcessAccordionDefaultCss = `--process-accordion-radius: var(--radius-l);
padding: clamp(var(--space-xl), 7%, var(--space-4xl));
background: var(--semantic-text);
color: var(--semantic-surface);
font-family: var(--font-body);
container: process-accordion / inline-size;
box-sizing: border-box;
inline-size: 100%;`;

export const ProcessAccordionNestedCss = `& * {
	box-sizing: border-box;
}

& .process-accordion__layout {
	display: grid;
	grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr);
	gap: var(--space-3xl);
}

& header {
	align-self: start;
	position: sticky;
	inset-block-start: var(--space-l);
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.94 var(--font-heading);
	letter-spacing: -.05em;
}

& .process-accordion__steps {
	display: grid;
	gap: var(--space-s);
	min-inline-size: 0;
}

& details {
	padding: var(--space-l);
	border-radius: var(--process-accordion-radius);
	background: var(--semantic-surface);
	color: var(--semantic-text);
}

& details:nth-child(1) {
	background: color-mix(in oklch, var(--semantic-action) 26%, var(--semantic-surface));
}

& details:nth-child(2) {
	background: color-mix(in oklch, var(--semantic-focus) 12%, var(--semantic-surface));
}

& details:nth-child(4) {
	background: color-mix(in oklch, var(--semantic-action) 38%, var(--semantic-surface));
}

& summary {
	display: flex;
	align-items: center;
	gap: var(--space-m);
	cursor: pointer;
	font: 400 var(--text-xl)/1.15 var(--font-heading);
}

& summary::after {
	content: "+";
	margin-inline-start: auto;
	font: 300 var(--text-xl)/1 var(--font-body);
}

& details[open] summary::after {
	content: "−";
}

& summary:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 6px;
}

& summary b {
	font: 400 var(--text-xs)/1 var(--font-code);
}

& details p {
	border-block-start: 1px solid color-mix(in oklch, var(--semantic-text) 25%, transparent);
	padding-block-start: var(--space-s);
	max-inline-size: 42ch;
}

& .process-accordion__drawing {
	position: relative;
	block-size: 6rem;
	margin-block: var(--space-l);
}

& i {
	position: absolute;
	inset-block-start: var(--space-m);
	inline-size: 3.5rem;
	block-size: 3.5rem;
	border: 1px solid currentColor;
	border-radius: 50%;
	opacity: .6;
}

& i:nth-child(2) {
	translate: 1.8rem 0;
}

& i:nth-child(3) {
	translate: .9rem 1.5rem;
}

& details:nth-child(2) i {
	inline-size: 2.5rem;
	block-size: 2.5rem;
}

& details:nth-child(2) i:nth-child(2) {
	translate: 0 1rem;
}

& details:nth-child(2) i:nth-child(3) {
	translate: 0 2rem;
}

& details:nth-child(3) i {
	border-radius: 0;
	rotate: 45deg;
	scale: .75;
}

& details:nth-child(3) i:nth-child(2) {
	translate: 0 .8rem;
}

& details:nth-child(3) i:nth-child(3) {
	translate: 0 1.6rem;
}

& details:nth-child(4) i {
	border-radius: 0;
	inline-size: 4rem;
	block-size: 1.6rem;
	transform: skewY(-24deg);
}`;

export const ProcessAccordionSupportCss = `@container process-accordion (max-width:40rem) {
	.process-accordion .process-accordion__layout {
		grid-template-columns: 1fr;
		gap: var(--space-xl);
	}
	.process-accordion header {
		position: static;
	}
}

@media (prefers-reduced-motion:no-preference) {
	.process-accordion details[open] .process-accordion__drawing {
		animation: process-accordion--draw .35s ease both;
	}
}

@keyframes process-accordion--draw {
	from {
		opacity: 0;
		translate: 0 .5rem;
	}
}`;
