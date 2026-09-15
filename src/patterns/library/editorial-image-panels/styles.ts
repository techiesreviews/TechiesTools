export const EditorialImagePanelsDefaultCss = `box-sizing: border-box;
inline-size: 100%;
--editorial-image-panels-radius: var(--radius-l);
position: relative;
display: grid;
gap: 0;
background: var(--semantic-text);
color: var(--semantic-surface);
container: editorial-image-panels / inline-size;
font-family: var(--font-body);
inline-size: 100%;`;

export const EditorialImagePanelsNestedCss = `& * {
	box-sizing: border-box;
}

& header {
	position: absolute;
	inset-block-start: 0;
	z-index: 2;
	padding: clamp(var(--space-l), 4cqi, var(--space-3xl));
	pointer-events: none;
}

& header p {
	margin: 0;
	font: 400 var(--text-s)/1.4 var(--font-body);
}

& h2 {
	margin: var(--space-s) 0;
	max-inline-size: 14ch;
	font: 400 var(--text-2xl)/.95 var(--font-heading);
	letter-spacing: -.04em;
}

& article {
	position: relative;
	block-size: clamp(36rem, 100svh, 64rem);
	overflow: clip;
	border-radius: var(--editorial-image-panels-radius);
	isolation: isolate;
}

&[data-density="compact"] article {
	block-size: clamp(30rem, 75svh, 48rem);
}

& img {
	position: absolute;
	inset: 0;
	inline-size: 100%;
	block-size: 100%;
	object-fit: cover;
	object-position: 50% 65%;
}

& article::after {
	position: absolute;
	inset: 0;
	z-index: 0;
	content: "";
	background: linear-gradient(180deg, color-mix(in oklch, var(--semantic-text) 68%, transparent), color-mix(in oklch, var(--semantic-text) 30%, transparent) 48%, color-mix(in oklch, var(--semantic-text) 75%, transparent));
}

& article p, & h3 {
	position: absolute;
	z-index: 1;
	margin: 0;
}

& article p {
	inset: 55% auto auto 50%;
	translate: -50% -50%;
	color: var(--semantic-surface);
	font: 400 clamp(var(--text-4xl), 15cqi, 12rem)/.85 var(--font-heading);
	letter-spacing: -.07em;
}

& article p::before, & article p::after {
	position: absolute;
	inset-inline: 0;
	text-align: center;
	color: transparent;
	-webkit-text-stroke: 1px var(--semantic-surface);
	opacity: .55;
}

& article p::before {
	content: attr(data-previous);
	inset-block-end: 125%;
}

& article p::after {
	content: attr(data-next);
	inset-block-start: 125%;
}

& h3 {
	inset: auto var(--space-xl) var(--space-xl);
	font: 400 var(--text-xl)/1 var(--font-heading);
}`;

export const EditorialImagePanelsSupportCss = `@supports (animation-timeline:view()) {
	@media (prefers-reduced-motion:no-preference) {
		.editorial-image-panels img {
			animation: editorial-image-panels--drift linear both;
			animation-timeline: view();
		}
		.editorial-image-panels article p {
			animation: editorial-image-panels--ink linear both;
			animation-timeline: view();
		}
	}
}

@keyframes editorial-image-panels--drift {
	from {
		transform: scale(1.12) translateY(4%);
	}
	to {
		transform: scale(1.12) translateY(-4%);
	}
}

@keyframes editorial-image-panels--ink {
	0%,100% {
		color: transparent;
		-webkit-text-stroke: 1px var(--semantic-surface);
	}
	35%,65% {
		color: var(--semantic-surface);
		-webkit-text-stroke: 1px var(--semantic-surface);
	}
}`;
