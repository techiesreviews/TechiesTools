export const PortraitTestimonialsDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--portrait-testimonials-radius: var(--radius-l);
display: grid;
place-items: center;
min-block-size: clamp(32rem, 75svh, 52rem);
padding: var(--space-2xl) var(--space-l);
background: var(--semantic-surface);
color: var(--semantic-text);
font-family: var(--font-body);
container: portrait-testimonials/inline-size;`;

export const PortraitTestimonialsNestedCss = `& * {
	box-sizing: border-box;
}

& > h2 {
	position: absolute;
	inline-size: 1px;
	block-size: 1px;
	overflow: hidden;
	clip-path: inset(50%);
}

& .portrait-testimonials__quotes {
	display: grid;
	justify-items: center;
	max-inline-size: 54rem;
	text-align: center;
}

& input {
	position: absolute;
	opacity: 0;
}

& blockquote {
	display: none;
	margin: 0;
	font: 400 clamp(var(--text-xl), 4cqi, var(--text-3xl))/1.15 var(--font-heading);
}

& cite {
	display: block;
	margin-block-start: var(--space-m);
	font: 400 var(--text-s)/1.4 var(--font-body);
}

&:has(#portrait-testimonials-one:checked) [data-quote="one"], &:has(#portrait-testimonials-two:checked) [data-quote="two"], &:has(#portrait-testimonials-three:checked) [data-quote="three"] {
	display: block;
}

& .portrait-testimonials__quotes > div {
	display: flex;
	gap: var(--space-s);
	margin-block-start: var(--space-xl);
}

& label {
	display: block;
	inline-size: 3rem;
	block-size: 3rem;
	overflow: hidden;
	border-radius: var(--portrait-testimonials-radius);
	cursor: pointer;
	transition: translate .2s ease;
}

&:has(#portrait-testimonials-one:focus-visible) label[for="portrait-testimonials-one"], &:has(#portrait-testimonials-two:focus-visible) label[for="portrait-testimonials-two"], &:has(#portrait-testimonials-three:focus-visible) label[for="portrait-testimonials-three"] {
	outline: 3px solid var(--semantic-focus);
}

& img {
	inline-size: 100%;
	block-size: 100%;
	object-fit: cover;
}

&:has(#portrait-testimonials-one:checked) div label:nth-child(1), &:has(#portrait-testimonials-two:checked) div label:nth-child(2), &:has(#portrait-testimonials-three:checked) div label:nth-child(3) {
	translate: 0 calc(var(--space-s) * -1);
	outline: 2px solid var(--semantic-focus);
}`;

export const PortraitTestimonialsSupportCss = `@media (prefers-reduced-motion:reduce) {
	.portrait-testimonials label {
		transition: none;
	}
}`;
