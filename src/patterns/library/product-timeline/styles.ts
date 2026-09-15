export const ProductTimelineDefaultCss = `--product-timeline-radius: var(--radius-l);
display: grid;
gap: var(--space-3xl);
padding: clamp(var(--space-xl), 6%, var(--space-4xl)) var(--space-l);
background: color-mix(in oklch, var(--semantic-action) 5%, var(--semantic-surface));
color: var(--semantic-text);
container: product-timeline / inline-size;
font-family: var(--font-body);
box-sizing: border-box;
inline-size: 100%;`;

export const ProductTimelineNestedCss = `& * {
	box-sizing: border-box;
}

& header {
	max-inline-size: 42rem;
	margin-inline: auto;
	text-align: center;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.4 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0 0;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.94 var(--font-heading);
	letter-spacing: -.06em;
}

& ol {
	display: grid;
	gap: var(--space-2xl);
	inline-size: min(100%, 56rem);
	margin: auto;
	padding: var(--space-2xl) 0;
	list-style: none;
}

&[data-density="compact"] ol {
	gap: var(--space-m);
}

& li {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(10rem, 15rem) minmax(0, 1fr);
	gap: var(--space-xl);
	align-items: center;
}

& li > p {
	text-align: end;
	font-family: var(--font-code);
}

& img {
	display: block;
	inline-size: 100%;
	block-size: 15rem;
	object-fit: cover;
	border-radius: var(--product-timeline-radius);
}

& li > div {
	display: grid;
	gap: var(--space-s);
	min-inline-size: 0;
}

& h3 {
	margin: 0;
	font: 400 var(--text-xl)/1.05 var(--font-heading);
}

& span {
	font: 400 var(--text-s)/1.5 var(--font-body);
}`;

export const ProductTimelineSupportCss = `@supports (animation-timeline:view()) {
	@media (prefers-reduced-motion:no-preference) {
		.product-timeline img {
			animation: product-timeline--bend linear both;
			animation-timeline: view();
			animation-range: entry 0% exit 100%;
		}
	}
}

@keyframes product-timeline--bend {
	0% {
		transform: perspective(600px) rotateX(-38deg) scale(.86);
	}
	35%,65% {
		transform: perspective(600px) rotateX(0deg) scale(1);
	}
	100% {
		transform: perspective(600px) rotateX(38deg) scale(.86);
	}
}

@container product-timeline (max-width:36rem) {
	.product-timeline li {
		grid-template-columns: 1fr;
		gap: var(--space-s);
	}
	.product-timeline li > p {
		text-align: start;
	}
	.product-timeline img {
		block-size: 17rem;
		animation: none;
	}
}`;
