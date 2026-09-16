export const ProductTimelineDefaultCss = `--product-timeline-radius: var(--radius-l);
gap: var(--space-3xl);
padding: clamp(var(--space-xl), 6%, var(--space-4xl)) var(--space-l);
background: color-mix(in oklch, var(--semantic-action) 5%, var(--semantic-surface));
color: var(--semantic-text);
container: product-timeline_component/inline-size;`;

export const ProductTimelineNestedCss = `header {
	max-inline-size: 42rem;
	margin-inline: auto;
	text-align: center;
}

p {
	margin: 0;
	font: 400 var(--text-s)/1.4 var(--font-body);
}

.heading-style-h2 {
	margin: var(--space-s) 0 0;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.94 var(--font-heading);
	letter-spacing: -.06em;
}

ol {
	gap: var(--space-2xl);
	inline-size: min(100%, 56rem);
	margin: auto;
	padding: var(--space-2xl) 0;
}

:scope[data-density="compact"] ol {
	gap: var(--space-m);
}

li {
	grid-template-columns: minmax(0, 1fr) minmax(10rem, 15rem) minmax(0, 1fr);
	align-items: center;
}

li>p {
	text-align: end;
	font-family: var(--font-code);
}

.image {
	block-size: 15rem;
	border-radius: var(--product-timeline-radius);
}

li>div {
	gap: var(--space-s);
}

.heading-style-h3 {
	font: 400 var(--text-xl)/1.05 var(--font-heading);
}

span {
	font: 400 var(--text-s)/1.5 var(--font-body);
}

@supports (animation-timeline:view()) {
	@media (prefers-reduced-motion:no-preference) {
		.image {
			animation: product-timeline_component--bend linear both;
			animation-timeline: view();
			animation-range: entry 0%exit 100%;
		}
	}
}

@keyframes product-timeline_component--bend {
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

@container product-timeline_component (max-width:36rem) {
	li {
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-s);
	}
	li>p {
		text-align: start;
	}
	.image {
		block-size: 17rem;
		animation: none;
	}
}`;

export const ProductTimelineSupportCss = ``;
