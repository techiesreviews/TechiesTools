export const TestimonialRailDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--testimonial-rail-radius: var(--radius-l);
display: grid;
gap: var(--space-xl);
padding: clamp(var(--space-xl), 6%, var(--space-4xl));
background: color-mix(in oklch, var(--semantic-action) 56%, var(--semantic-text));
color: var(--semantic-surface);
font-family: var(--font-body);
container: testimonial-rail/inline-size;`;

export const TestimonialRailNestedCss = `& * {
	box-sizing: border-box;
}

& .testimonial-rail__byline {
	display: flex;
	gap: var(--space-s);
	align-items: center;
}

& img {
	inline-size: 2.5rem;
	block-size: 2.5rem;
	object-fit: cover;
	border-radius: var(--radius-full);
}

& .testimonial-rail__track:focus-visible, & nav a:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 4px;
}

& header {
	max-inline-size: 42rem;
}

& p {
	margin: 0;
	font: 400 var(--text-s)/1.4 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0;
	font: 400 clamp(var(--text-2xl), 6cqi, var(--text-4xl))/.92 var(--font-heading);
	letter-spacing: -.06em;
}

& nav {
	display: flex;
	gap: var(--space-s);
}

& nav a {
	color: inherit;
	font: 600 var(--text-s)/1 var(--font-body);
}

& .testimonial-rail__track {
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: minmax(min(17rem, 100%), 42%);
	gap: var(--space-s);
	overflow-x: auto;
	scroll-snap-type: inline mandatory;
	padding-block: var(--space-s);
	outline-offset: var(--space-s);
}

& article {
	display: grid;
	align-content: space-between;
	gap: var(--space-xl);
	min-block-size: 18rem;
	padding: var(--space-l);
	scroll-snap-align: start;
	background: color-mix(in oklch, var(--semantic-surface) 86%, var(--semantic-action));
	border-radius: var(--testimonial-rail-radius);
	color: var(--semantic-text);
}

& h3 {
	margin: 0;
	font: 400 var(--text-xl)/1.1 var(--font-heading);
}

& span {
	font: 400 var(--text-s)/1.4 var(--font-body);
}`;

export const TestimonialRailSupportCss = `@media (prefers-reduced-motion:reduce) {
	.testimonial-rail__track {
		scroll-behavior: auto;
	}
}`;
