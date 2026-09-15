export const layeredProductHeroDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--layered-product-hero-radius: var(--radius-xl);
display: grid;
gap: var(--space-3xl);
padding: clamp(var(--space-2xl), 7%, var(--space-4xl)) var(--space-l);
background: var(--semantic-surface);
color: var(--semantic-text);
container: layered-product-hero / inline-size;
font-family: var(--font-body);`;

export const layeredProductHeroNestedCss = `& * {
	box-sizing: border-box;
}

& .layered-product-hero__intro {
	display: grid;
	justify-items: center;
	gap: var(--space-m);
	max-inline-size: 44rem;
	margin: auto;
	text-align: center;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.5 var(--font-body);
}

& h2 {
	margin: 0;
	max-inline-size: 14ch;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

& .btn {
	--btn-radius: var(--radius-full);
}

& .layered-product-hero__secondary {
	--btn-background: var(--semantic-surface);
	--btn-border-color: var(--semantic-border);
	--btn-text-color: var(--semantic-text);
}

& .layered-product-hero__stage {
	position: relative;
	isolation: isolate;
	inline-size: min(100%, 58rem);
	min-block-size: clamp(29rem, 52cqi, 34rem);
	margin: auto;
	border-radius: var(--layered-product-hero-radius);
	background: color-mix(in oklch, var(--semantic-text) 6%, var(--semantic-surface));
}

& .layered-product-hero__sheet {
	position: absolute;
	z-index: -1;
	inset: 6% 6% -3% auto;
	clip-path: polygon(0 15%, 70% 15%, 70% 0, 100% 0, 100% 85%, 30% 85%, 30% 100%, 0 100%);
	inline-size: 84%;
	border-radius: inherit;
	background: var(--semantic-text);
}

& .layered-product-hero__app {
	position: absolute;
	inset: 12% 10% 0 4%;
	display: grid;
	grid-template-columns: 10rem minmax(0, 1fr);
	grid-template-rows: auto 1fr;
	overflow: hidden;
	border: 1px solid var(--semantic-border);
	border-radius: inherit;
	background: var(--semantic-surface);
	box-shadow: 0 var(--space-l) var(--space-3xl) color-mix(in oklch, var(--semantic-text) 14%, transparent);
}

& header {
	grid-column: 1 / -1;
	display: flex;
	justify-content: space-between;
	padding: var(--space-s) var(--space-m);
	border-bottom: 1px solid var(--semantic-border);
	font: 600 var(--text-s)/1 var(--font-body);
}

& header span {
	color: var(--semantic-action);
}

& aside {
	padding: var(--space-m);
	border-right: 1px solid var(--semantic-border);
	font: 400 var(--text-s)/2 var(--font-body);
}

& .layered-product-hero__main {
	min-inline-size: 0;
	padding: clamp(var(--space-m), 3cqi, var(--space-xl));
}

& .layered-product-hero__main p {
	color: color-mix(in oklch, var(--semantic-text) 60%, var(--semantic-surface));
}

& .layered-product-hero__main strong {
	font: 400 var(--text-4xl)/1 var(--font-heading);
}

& ul {
	display: grid;
	gap: var(--space-s);
	padding: 0;
	list-style: none;
}

& li {
	margin: 0;
	padding: var(--space-s);
	border: 1px solid var(--semantic-border);
	border-radius: var(--radius-m);
	font: 400 var(--text-s)/1.4 var(--font-body);
}

& li::before {
	content: "✓";
	margin-inline-end: var(--space-s);
	color: var(--semantic-action);
}

&[data-layout="offset"] .layered-product-hero__intro {
	justify-items: start;
	margin-inline: 0 auto;
	text-align: start;
}

@container layered-product-hero (max-width:34rem) {
	& .layered-product-hero__app {
		grid-template-columns: 1fr;
	}
	& aside {
		display: none;
	}
}`;

export const layeredProductHeroSupportCss = `@media (prefers-reduced-motion:no-preference) {
	.layered-product-hero__sheet {
		animation: layered-product-hero--sheet .7s both;
	}
	.layered-product-hero__app {
		animation: layered-product-hero--app .7s .1s both;
	}
}

@keyframes layered-product-hero--sheet {
	from {
		opacity: 0;
		translate: var(--space-xl) var(--space-xl);
	}
}

@keyframes layered-product-hero--app {
	from {
		opacity: 0;
		translate: 0 var(--space-xl);
		scale: .96;
	}
}`;
