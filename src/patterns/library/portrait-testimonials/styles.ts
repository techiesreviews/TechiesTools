export const PortraitTestimonialsDefaultCss = `--portrait-testimonials-radius: var(--radius-l);
place-items: center;
min-block-size: clamp(32rem, 75svh, 52rem);
padding: var(--space-2xl) var(--space-l);
background: var(--semantic-surface);
color: var(--semantic-text);
container: portrait-testimonials_component/inline-size;
gap: 0;`;

export const PortraitTestimonialsNestedCss = `.quotes {
	justify-items: center;
	max-inline-size: 54rem;
	text-align: center;
	gap: 0;
}

input {
	position: absolute;
	opacity: 0;
}

blockquote {
	display: none;
	margin: 0;
	font: 400 clamp(var(--text-xl), 4cqi, var(--text-3xl))/1.15 var(--font-heading);
}

cite {
	display: block;
	margin-block-start: var(--space-m);
	font: 400 var(--text-s)/1.4 var(--font-body);
}

:scope:has(#portrait-testimonials-one:checked) [data-quote="one"],:scope:has(#portrait-testimonials-two:checked) [data-quote="two"],:scope:has(#portrait-testimonials-three:checked) [data-quote="three"] {
	display: block;
}

.quotes>div {
	margin-block-start: var(--space-xl);
}

label {
	display: block;
	inline-size: 3rem;
	block-size: 3rem;
	overflow: hidden;
	border-radius: var(--portrait-testimonials-radius);
	cursor: pointer;
	transition: translate .2s ease;
}

:scope:has(#portrait-testimonials-one:focus-visible) label[for="portrait-testimonials-one"],:scope:has(#portrait-testimonials-two:focus-visible) label[for="portrait-testimonials-two"],:scope:has(#portrait-testimonials-three:focus-visible) label[for="portrait-testimonials-three"] {
	outline: 3px solid var(--semantic-focus);
}

.image {
	inline-size: 100%;
	block-size: 100%;
}

:scope:has(#portrait-testimonials-one:checked) div label:nth-child(1),:scope:has(#portrait-testimonials-two:checked) div label:nth-child(2),:scope:has(#portrait-testimonials-three:checked) div label:nth-child(3) {
	translate: 0 calc(var(--space-s)*-1);
	outline: 2px solid var(--semantic-focus);
}

@media (prefers-reduced-motion:reduce) {
	label {
		transition: none;
	}
}`;

export const PortraitTestimonialsSupportCss = ``;
