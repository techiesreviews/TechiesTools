export const listingCardDefaultCss = `--listing-card-background: var(--semantic-surface);
--listing-card-color: var(--semantic-text);
--listing-card-muted: color-mix(in oklch, var(--semantic-text) 68%, var(--semantic-surface));
--listing-card-border: color-mix(in oklch, var(--semantic-border) 64%, var(--semantic-surface));
--listing-card-accent: var(--semantic-action);
--listing-card-radius: var(--radius-xl);
--listing-card-padding: var(--space-m);
--listing-card-gap: var(--space-s);
--listing-card-media-ratio: 3/2;
gap: var(--listing-card-gap);
max-inline-size: 32rem;
overflow: clip;
border: 1px solid var(--listing-card-border);
border-radius: var(--listing-card-radius);
background: var(--listing-card-background);
color: var(--listing-card-color);
box-shadow: 0 var(--space-s) var(--space-xl) color-mix(in oklch, var(--semantic-text) 14%, transparent);
isolation: isolate;
container: listing-card_component/inline-size;`;

export const listingCardNestedCss = `:scope[data-tone="accent"] {
	--listing-card-background: color-mix(in oklch, var(--semantic-primary) 7%, var(--semantic-surface));
	--listing-card-border: color-mix(in oklch, var(--semantic-primary) 36%, var(--semantic-border));
	--listing-card-accent: var(--semantic-primary);
}

.media {
	position: relative;
	overflow: clip;
	aspect-ratio: var(--listing-card-media-ratio);
	background: color-mix(in oklch, var(--semantic-primary) 8%, var(--semantic-surface));
}

:scope:not([data-media]) .media,:scope[data-media="inset"] .media {
	margin: var(--listing-card-padding) var(--listing-card-padding) 0;
	border-radius: calc(var(--listing-card-radius)*.72);
}

.image {
	block-size: 100%;
	transition: scale 400ms ease;
}

:scope:hover .image:not(.image--blur) {
	scale: 1.025;
}

.image--blur {
	display: none;
}

.badge,.favorite {
	position: absolute;
	z-index: 3;
	inset-block-start: var(--space-s);
	border: 1px solid color-mix(in oklch, var(--semantic-surface) 35%, transparent);
	color: var(--semantic-surface);
	background: color-mix(in oklch, var(--semantic-text) 64%, transparent);
	backdrop-filter: blur(.55rem);
}

.badge {
	inset-inline-start: var(--space-s);
	padding: var(--space-3xs) var(--space-xs);
	border-radius: var(--radius-full);
	font: 700 var(--text-xs)/1 var(--font-body);
}

.favorite {
	inline-size: 2.75rem;
	aspect-ratio: 1;
	inset-inline-end: var(--space-s);
	border-radius: var(--radius-full);
	cursor: pointer;
	place-items: center;
	gap: 0;
}

.favorite svg {
	inline-size: 1.25rem;
	fill: transparent;
	stroke: currentColor;
	stroke-linecap: round;
	stroke-linejoin: round;
	stroke-width: 1.8;
}

.favorite:has(input:checked) {
	background: var(--listing-card-accent);
}

.favorite:has(input:checked) svg {
	fill: currentColor;
}

.favorite:has(input:focus-visible) {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 3px;
}

.content {
	position: relative;
	z-index: 2;
	gap: var(--space-s);
	padding: 0 var(--listing-card-padding) var(--listing-card-padding);
}

:scope[data-media="bleed"] {
	gap: 0;
}

:scope[data-media="bleed"] .content {
	padding-block-start: var(--listing-card-padding);
}

.header,.footer {
	align-items: center;
	justify-content: space-between;
}

.heading-style-h3 {
	font: 650 var(--text-l)/1.15 var(--font-heading);
	letter-spacing: -.025em;
}

.rating {
	flex: none;
	font: 700 var(--text-s)/1.2 var(--font-body);
}

.rating span {
	color: var(--semantic-action);
}

.meta {
	color: var(--listing-card-muted);
	font: 400 var(--text-s)/1.5 var(--font-body);
}

.footer {
	margin-block-start: var(--space-3xs);
}

.price {
	font: 400 var(--text-s)/1.2 var(--font-body);
}

.price strong {
	font-size: var(--text-m);
}

:scope[data-density="compact"] {
	--listing-card-padding: var(--space-s);
	--listing-card-gap: var(--space-xs);
	--listing-card-media-ratio: 16/10;
}

:scope[data-density="compact"] .meta {
	display: none;
}

:scope[data-media="cover"] {
	--listing-card-color: var(--semantic-surface);
	--listing-card-muted: color-mix(in oklch, var(--semantic-surface) 88%, transparent);
	min-block-size: 25rem;
	max-block-size: 31rem;
	aspect-ratio: 1;
	align-content: end;
	border: 0;
	background: var(--semantic-text);
}

:scope[data-media="cover"] .media {
	position: absolute;
	z-index: 0;
	inset: 0;
	aspect-ratio: auto;
}

:scope[data-media="cover"] .media::before {
	position: absolute;
	z-index: 2;
	inset: 38%0 0;
	background: linear-gradient(to bottom, transparent, color-mix(in oklch, var(--semantic-text) 94%, transparent));
	content: "";
	pointer-events: none;
}

:scope[data-media="cover"] .image--blur {
	position: absolute;
	z-index: 1;
	inset: 0;
	display: block;
	filter: blur(.85rem);
	scale: 1.045;
	-webkit-mask-image: linear-gradient(to bottom, transparent 28%, black 78%);
	mask-image: linear-gradient(to bottom, transparent 28%, black 78%);
	pointer-events: none;
}

:scope[data-media="cover"] .content {
	align-self: end;
	padding-block-start: var(--space-4xl);
	text-shadow: 0 .08rem .3rem color-mix(in oklch, var(--semantic-text) 50%, transparent);
}

@container listing-card_component (width<23rem) {
	.content {
		gap: var(--space-xs);
		padding-inline: var(--space-s);
		padding-block-end: var(--space-s);
	}
	.header,.footer {
		align-items: flex-start;
	}
	.footer {
		display: grid;
		justify-content: stretch;
	}
	.meta {
		display: none;
	}
}

@media (prefers-reduced-motion:reduce) {
	.image {
		transition: none;
	}
}`;

export const listingCardSupportCss = `@scope (.listing-card_component .button_component) to ([class*="_component"]) {
	:scope {
		--btn-background: var(--listing-card-accent);
		--btn-border-color: var(--listing-card-accent);
		--btn-text-color: var(--semantic-surface);
		--btn-radius: var(--radius-full);
		--btn-padding-inline: var(--space-l);
		--btn-font-size: var(--text-s);
		--btn-font-weight: 700;
	}
}

@scope (.listing-card_component[data-media="cover"] .button_component) to ([class*="_component"]) {
	:scope {
		--btn-text-color: var(--semantic-text);
		--btn-background: var(--semantic-surface);
		--btn-border-color: var(--semantic-surface);
		text-shadow: none;
	}
}

@scope (.listing-card_component[data-media="cover"][data-tone="accent"] .button_component) to ([class*="_component"]) {
	:scope {
		--btn-text-color: var(--semantic-surface);
		--btn-background: var(--semantic-action);
		--btn-border-color: var(--semantic-action);
	}
}

@scope (.listing-card_component .button_component) to ([class*="_component"]) {
	@container listing-card_component (width<23rem) {
		:scope {
			inline-size: 100%;
		}
	}
}`;
