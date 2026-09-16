export const TestimonialRailDefaultCss = `--testimonial-rail-radius: var(--radius-l);
padding: clamp(var(--space-xl), 6%, var(--space-4xl));
background: color-mix(in oklch, var(--semantic-action) 56%, var(--semantic-text));
color: var(--semantic-surface);
container: testimonial-rail_component/inline-size;`;

export const TestimonialRailNestedCss = `.byline {
	align-items: center;
}

.image {
	inline-size: 2.5rem;
	block-size: 2.5rem;
	border-radius: var(--radius-full);
}

.track:focus-visible,nav a:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 4px;
}

header {
	max-inline-size: 42rem;
}

p {
	margin: 0;
	font: 400 var(--text-s)/1.4 var(--font-body);
}

.heading-style-h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

nav a {
	color: inherit;
	font: 600 var(--text-s)/1 var(--font-body);
}

.track {
	grid-template-columns: none;
	grid-auto-flow: column;
	grid-auto-columns: minmax(min(17rem, 100%), 42%);
	gap: var(--space-s);
	overflow-x: auto;
	scroll-snap-type: inline mandatory;
	padding-block: var(--space-s);
	outline-offset: var(--space-s);
}

article {
	align-content: space-between;
	min-block-size: 18rem;
	padding: var(--space-l);
	scroll-snap-align: start;
	background: color-mix(in oklch, var(--semantic-surface) 86%, var(--semantic-action));
	border-radius: var(--testimonial-rail-radius);
	color: var(--semantic-text);
}

.heading-style-h3 {
	font: 400 var(--text-xl)/1.1 var(--font-heading);
}

span {
	font: 400 var(--text-s)/1.4 var(--font-body);
}

@media (prefers-reduced-motion:reduce) {
	.track {
		grid-template-columns: none;
		scroll-behavior: auto;
	}
}`;

export const TestimonialRailSupportCss = ``;
