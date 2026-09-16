export const portraitStripHeroDefaultCss = `--portrait-strip-hero-space: var(--space-4xl);
--portrait-strip-hero-background: color-mix(in oklch, var(--semantic-action) 7%, var(--semantic-surface));
--portrait-strip-hero-color: var(--semantic-text);
gap: var(--portrait-strip-hero-space);
padding: clamp(var(--space-xl), 7%, var(--space-4xl)) var(--space-l) var(--space-l);
background: var(--portrait-strip-hero-background);
color: var(--portrait-strip-hero-color);
container: portrait-strip-hero_component/inline-size;`;

export const portraitStripHeroNestedCss = `:scope[data-tone="quiet"] {
	--portrait-strip-hero-background: var(--semantic-surface);
}

.intro {
	grid-template-columns: minmax(0, 1.3fr) minmax(14rem, .7fr);
	justify-self: center;
}

.heading-style-h2 {
	grid-column: 1;
	max-inline-size: 13ch;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

.intro>div {
	align-content: end;
	gap: var(--space-m);
}

.strip {
	padding: var(--space-s) 0 var(--space-2xl);
	overflow: clip;
}

.strip li {
	flex: 1 0 6rem;
	aspect-ratio: 3/4;
	overflow: hidden;
	border: 1px solid var(--semantic-border);
	border-radius: var(--radius-full);
	transition: translate .2s ease;
}

.strip li:nth-child(even) {
	translate: 0 var(--space-l);
}

.strip li:hover {
	translate: 0 calc(var(--space-s)*-1);
}

.image {
	block-size: 100%;
}

@container portrait-strip-hero_component (max-width:40rem) {
	.intro {
		grid-template-columns: minmax(0, 1fr);
	}
	.heading-style-h2 {
		grid-column: auto;
	}
}

@media (prefers-reduced-motion:reduce) {
	.strip li {
		transition: none;
	}
}

@media (prefers-reduced-motion:no-preference) {
	.strip li {
		animation: portrait-strip-hero_component--enter .7s ease both;
	}
	.strip li:nth-child(even) {
		animation-delay: .1s;
	}
}

@keyframes portrait-strip-hero_component--enter {
	from {
		opacity: 0;
		translate: 0 var(--space-xl);
	}
}`;

export const portraitStripHeroSupportCss = `@scope (.portrait-strip-hero_component .button_component) to ([class*="_component"]) {
	:scope {
		--btn-radius: var(--radius-full);
		--btn-background: var(--semantic-text);
		--btn-border-color: var(--semantic-text);
		--btn-text-color: var(--semantic-surface);
		inline-size: max-content;
	}
}`;
