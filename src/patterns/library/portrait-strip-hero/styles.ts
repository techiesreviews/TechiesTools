export const portraitStripHeroDefaultCss = `--portrait-strip-hero-space: var(--space-4xl);
--portrait-strip-hero-background: color-mix(in oklch, var(--semantic-action) 7%, var(--semantic-surface));
--portrait-strip-hero-color: var(--semantic-text);
display: grid;
gap: var(--portrait-strip-hero-space);
padding: clamp(var(--space-xl), 7%, var(--space-4xl)) var(--space-l) var(--space-l);
background: var(--portrait-strip-hero-background);
color: var(--portrait-strip-hero-color);
container: portrait-strip-hero / inline-size;
font-family: var(--font-body);
box-sizing: border-box;
inline-size: 100%;`;

export const portraitStripHeroNestedCss = `& * {
	box-sizing: border-box;
}

&[data-tone="quiet"] {
	--portrait-strip-hero-background: var(--semantic-surface);
}

& .portrait-strip-hero__intro {
	display: grid;
	grid-template-columns: minmax(0, 1.3fr) minmax(14rem, .7fr);
	gap: var(--space-xl);
	max-inline-size: 68rem;
	inline-size: 100%;
	justify-self: center;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h2 {
	grid-column: 1;
	margin: 0;
	max-inline-size: 13ch;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/ .92 var(--font-heading);
	letter-spacing: -.06em;
}

& .portrait-strip-hero__intro > div {
	display: grid;
	align-content: end;
	gap: var(--space-m);
}

& .portrait-strip-hero__action {
	--btn-radius: var(--radius-full);
	--btn-background: var(--semantic-text);
	--btn-border-color: var(--semantic-text);
	--btn-text-color: var(--semantic-surface);
	inline-size: max-content;
}

& .portrait-strip-hero__strip {
	display: flex;
	gap: var(--space-s);
	min-inline-size: 0;
	margin: 0;
	padding: var(--space-s) 0 var(--space-2xl);
	overflow: clip;
	list-style: none;
}

& .portrait-strip-hero__strip li {
	flex: 1 0 6rem;
	min-inline-size: 0;
	aspect-ratio: 3 / 4;
	overflow: hidden;
	border: 1px solid var(--semantic-border);
	border-radius: var(--radius-full);
	transition: translate .2s ease;
}

& .portrait-strip-hero__strip li:nth-child(even) {
	translate: 0 var(--space-l);
}

& .portrait-strip-hero__strip li:hover {
	translate: 0 calc(var(--space-s) * -1);
}

& img {
	display: block;
	inline-size: 100%;
	block-size: 100%;
	object-fit: cover;
}

@container portrait-strip-hero (max-width:40rem) {
	& .portrait-strip-hero__intro {
		grid-template-columns: 1fr;
	}
	& h2 {
		grid-column: auto;
	}
}

@media (prefers-reduced-motion:reduce) {
	& .portrait-strip-hero__strip li {
		transition: none;
	}
}`;

export const portraitStripHeroSupportCss = `@media (prefers-reduced-motion:no-preference) {
	.portrait-strip-hero .portrait-strip-hero__strip li {
		animation: portrait-strip-hero--enter .7s ease both;
	}
	.portrait-strip-hero .portrait-strip-hero__strip li:nth-child(even) {
		animation-delay: .1s;
	}
}

@keyframes portrait-strip-hero--enter {
	from {
		opacity: 0;
		translate: 0 var(--space-xl);
	}
}`;
