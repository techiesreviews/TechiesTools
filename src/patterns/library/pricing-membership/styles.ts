export const PricingMembershipDefaultCss = `--pricing-membership-radius: var(--radius-l);
display: grid;
justify-items: center;
gap: var(--space-xl);
padding: clamp(var(--space-2xl), 7%, var(--space-4xl)) var(--space-l);
background: var(--semantic-text);
color: var(--semantic-surface);
box-sizing: border-box;
inline-size: 100%;
container: pricing-membership/inline-size;
font-family: var(--font-body);`;

export const PricingMembershipNestedCss = `& * {
	box-sizing: border-box;
}

&[data-density="compact"] .pricing-membership__tiers {
	gap: var(--space-2xs);
}

& header {
	max-inline-size: 38rem;
	text-align: center;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.94 var(--font-heading);
}

& fieldset {
	display: flex;
	gap: var(--space-xs);
	border: 0;
}

& legend {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	overflow: hidden;
	clip-path: inset(50%);
}

& label {
	padding: var(--space-2xs) var(--space-s);
	border: 1px solid var(--semantic-border);
	border-radius: var(--radius-full);
	cursor: pointer;
}

& label:has(input:checked) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
}

& label:has(input:focus-visible) {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 4px;
}

& input {
	position: absolute;
	opacity: 0;
}

& .pricing-membership__tiers {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: var(--space-s);
	inline-size: min(100%, 56rem);
}

& article {
	min-inline-size: 0;
	box-sizing: border-box;
	display: grid;
	gap: var(--space-l);
	padding: var(--space-l);
	border: 1px solid color-mix(in oklch, var(--semantic-surface) 24%, transparent);
	border-radius: var(--pricing-membership-radius);
}

& article:nth-child(2) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
	scale: 1.04;
}

& strong {
	display: grid;
}

& b {
	font: 400 var(--text-4xl)/.9 var(--font-heading);
}

& [data-year] {
	display: none;
}

&:has(#pricing-membership-yearly:checked) [data-month] {
	display: none;
}

&:has(#pricing-membership-yearly:checked) [data-year] {
	display: inline;
}

&:has(#pricing-membership-yearly:checked) .pricing-membership__period {
	font-size: 0;
}

&:has(#pricing-membership-yearly:checked) .pricing-membership__period::after {
	content: "/ year";
	font-size: var(--text-s);
}

& ul {
	margin: 0;
	padding-inline-start: var(--space-m);
	font: 400 var(--text-s)/1.8 var(--font-body);
}

& .btn {
	align-self: end;
	--btn-font-size: var(--text-s);
	--btn-padding-inline: var(--space-s);
	min-inline-size: 0;
	white-space: normal;
	text-align: center;
}

& article:nth-child(2) .btn {
	--btn-background: var(--semantic-text);
	--btn-border-color: var(--semantic-text);
}`;

export const PricingMembershipSupportCss = `@container pricing-membership (max-width:40rem) {
	.pricing-membership .pricing-membership__tiers {
		grid-template-columns: 1fr;
	}
	.pricing-membership article:nth-child(2) {
		scale: 1;
	}
}

@media (prefers-reduced-motion:reduce) {
	.pricing-membership article {
		scale: 1;
	}
}`;
