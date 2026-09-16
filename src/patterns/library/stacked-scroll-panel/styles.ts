export const stackedScrollPanelDefaultCss = `--stacked-scroll-panel-background: var(--semantic-surface);
--stacked-scroll-panel-card-background: color-mix(in oklch, var(--semantic-text) 4%, var(--semantic-surface));
--stacked-scroll-panel-color: var(--semantic-text);
--stacked-scroll-panel-border: color-mix(in oklch, var(--semantic-border) 68%, var(--semantic-surface));
--stacked-scroll-panel-radius: var(--radius-xl);
--stacked-scroll-panel-reveal: var(--space-m);
--stacked-scroll-panel-canvas-padding: clamp(var(--space-l), 6vw, var(--space-4xl));
--stacked-scroll-panel-card-size: clamp(20rem, 60svh, 36rem);
padding: var(--stacked-scroll-panel-canvas-padding);
background: var(--stacked-scroll-panel-background);
color: var(--stacked-scroll-panel-color);
container: stacked-scroll-panel_component/inline-size;`;

export const stackedScrollPanelNestedCss = `:scope:focus-visible {
	outline: 3px solid var(--semantic-focus);
	outline-offset: 3px;
}

:scope[data-motion="flow"] {
	gap: var(--space-l);
}

:scope[data-motion="flow"]::after {
	display: none;
}

:scope::after {
	min-block-size: calc(var(--stacked-scroll-panel-card-size) + var(--space-l));
	content: "";
}

@keyframes stacked-scroll-panel_component--recede {
	to {
		scale: var(--stacked-scroll-panel-recede-scale, .92);
		filter: saturate(.78);
	}
}

@container stacked-scroll-panel_component (max-width:30rem) {
	:scope::after {
		display: none;
	}
}

@media (max-width:40rem),(max-height:38rem),(prefers-reduced-motion:reduce) {
	:scope::after {
		display: none;
	}
}`;

export const stackedScrollPanelSupportCss = `@scope (.stacked-scroll-panel_component .stacked-card_component) to ([class*="_component"]) {
	:scope {
		position: sticky;
		z-index: calc(var(--stacked-scroll-panel-index) + 1);
		inset-block-start: calc(var(--stacked-scroll-panel-canvas-padding) + var(--stacked-scroll-panel-index)*var(--stacked-scroll-panel-reveal));
		grid-template-columns: minmax(0, 1.62fr) minmax(10rem, 1fr);
		justify-self: center;
		inline-size: min(100%, 60rem);
		min-block-size: var(--stacked-scroll-panel-card-size);
		overflow: clip;
		border: 1px solid var(--stacked-scroll-panel-border);
		border-radius: calc(var(--stacked-scroll-panel-radius)*.88);
		background: var(--stacked-scroll-panel-card-background);
		box-shadow: 0 .2rem 1rem color-mix(in oklch, var(--semantic-text) 6%, transparent);
		transform-origin: center top;
		gap: 0;
	}
	.content {
		align-content: space-between;
		gap: var(--space-l);
		padding: clamp(var(--space-m), 4vw, var(--space-xl));
	}
	.heading-style-h2 {
		font: 400 var(--text-xl)/.95 var(--font-heading);
		letter-spacing: -.05em;
	}
	.footer {
		gap: var(--space-s);
		justify-items: start;
	}
	.footer p {
		max-inline-size: 28ch;
		color: color-mix(in oklch, var(--semantic-text) 72%, var(--semantic-surface));
		font: 400 var(--text-s)/1.5 var(--font-body);
	}
	.image {
		block-size: 100%;
		min-block-size: 0;
	}
	:scope:focus-within {
		z-index: 10;
		animation: none;
		filter: none;
		scale: 1;
	}
	@container stacked-scroll-panel_component (max-width:30rem) {
		:scope {
			position: relative;
			inset-block-start: auto;
			grid-template-columns: minmax(0, 1fr);
			animation: none;
		}
		.image {
			aspect-ratio: 16/9;
		}
	}
	@media (max-width:40rem),(max-height:38rem),(prefers-reduced-motion:reduce) {
		:scope {
			position: relative;
			inset-block-start: auto;
			grid-template-columns: minmax(0, 1fr);
			animation: none;
		}
		.image {
			aspect-ratio: 16/9;
		}
	}
}

@scope (.stacked-scroll-panel_component[data-motion="flow"] .stacked-card_component) to ([class*="_component"]) {
	:scope {
		position: relative;
		inset-block-start: auto;
	}
}

@scope (.stacked-scroll-panel_component[data-motion="stacked"] .stacked-card_component) to ([class*="_component"]) {
	@supports (animation-timeline:scroll(nearest block)) {
		:scope:not(:focus-within) {
			animation: stacked-scroll-panel_component--recede linear both;
			animation-timeline: scroll(nearest block);
		}
		:scope:nth-of-type(1) {
			animation-range: 0% 29%;
		}
		:scope:nth-of-type(2) {
			animation-range: 30% 63%;
		}
		:scope:nth-of-type(3) {
			animation: none;
		}
	}
}

@scope (.stacked-scroll-panel_component[data-motion] .stacked-card_component) to ([class*="_component"]) {
	@container stacked-scroll-panel_component (max-width:30rem) {
		:scope:not(:focus-within) {
			position: relative;
			inset-block-start: auto;
			grid-template-columns: minmax(0, 1fr);
			animation: none;
		}
	}
	@media (max-width:40rem),(max-height:38rem),(prefers-reduced-motion:reduce) {
		:scope:not(:focus-within) {
			position: relative;
			inset-block-start: auto;
			grid-template-columns: minmax(0, 1fr);
			animation: none;
		}
	}
}

@scope (.stacked-scroll-panel_component .button_component) to ([class*="_component"]) {
	:scope {
		--btn-background: var(--semantic-text);
		--btn-border-color: var(--semantic-text);
		--btn-text-color: var(--semantic-surface);
		--btn-min-block-size: 2.25rem;
		--btn-padding-block: var(--space-4xs);
		--btn-padding-inline: var(--space-xs);
		--btn-font-size: var(--text-s);
		--btn-radius: var(--radius-full);
		white-space: nowrap;
	}
}`;
