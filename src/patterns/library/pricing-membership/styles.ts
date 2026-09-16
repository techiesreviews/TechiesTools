export const PricingMembershipDefaultCss = `--pricing-membership-radius: var(--radius-l);
justify-items: center;
padding: clamp(var(--space-2xl), 7%, var(--space-4xl)) var(--space-l);
background: var(--semantic-text);
color: var(--semantic-surface);
container: pricing-membership_component/inline-size;`;

export const PricingMembershipNestedCss = `:scope[data-density="compact"] .tiers {
	gap: var(--space-2xs);
}

header {
	max-inline-size: 38rem;
	text-align: center;
}

.heading-style-h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 5cqi, var(--text-4xl))/.94 var(--font-heading);
}

fieldset {
	gap: var(--space-xs);
	border: 0;
}

label {
	padding: var(--space-2xs) var(--space-s);
	border: 1px solid var(--semantic-border);
	border-radius: var(--radius-full);
	cursor: pointer;
}

label:has(input:checked) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
}

label:has(input:focus-visible) {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 4px;
}

input {
	position: absolute;
	opacity: 0;
}

.tiers {
	--_columns: 3;
	gap: var(--space-s);
	inline-size: min(100%, 56rem);
}

article {
	gap: var(--space-l);
	padding: var(--space-l);
	border: 1px solid color-mix(in oklch, var(--semantic-surface) 24%, transparent);
	border-radius: var(--pricing-membership-radius);
}

article:nth-child(2) {
	background: var(--semantic-surface);
	color: var(--semantic-text);
	scale: 1.04;
}

strong {
	gap: 0;
}

b {
	font: 400 var(--text-4xl)/.9 var(--font-heading);
}

[data-year] {
	display: none;
}

:scope:has(#pricing-membership-yearly:checked) [data-month] {
	display: none;
}

:scope:has(#pricing-membership-yearly:checked) [data-year] {
	display: inline;
}

ul {
	margin: 0;
	padding-inline-start: var(--space-m);
	font: 400 var(--text-s)/1.8 var(--font-body);
}

@container pricing-membership_component (max-width:40rem) {
	.tiers {
		--_columns: 1;
	}
	article:nth-child(2) {
		scale: 1;
	}
}

@media (prefers-reduced-motion:reduce) {
	article {
		scale: 1;
	}
}`;

export const PricingMembershipSupportCss = `@scope (.pricing-membership_component .button_component) to ([class*="_component"]) {
	:scope {
		align-self: end;
		--btn-font-size: var(--text-s);
		--btn-padding-inline: var(--space-s);
		white-space: normal;
		text-align: center;
	}
}

@scope (.pricing-membership_component article:nth-child(2) .button_component) to ([class*="_component"]) {
	:scope {
		--btn-background: var(--semantic-text);
		--btn-border-color: var(--semantic-text);
	}
}`;
