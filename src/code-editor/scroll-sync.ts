interface ScrollSource {
	scrollTop: number;
	scrollLeft: number;
}

interface ScrollViewport extends ScrollSource {
	style: { translate: string };
}

interface CodeEditorScrollParts {
	source: ScrollSource;
	syntaxViewport: ScrollViewport;
	lineViewport: ScrollViewport;
	caretViewport?: ScrollViewport;
}

const residualTranslation = (viewport: ScrollSource, source: ScrollSource) =>
	`${viewport.scrollLeft - source.scrollLeft}px ${viewport.scrollTop - source.scrollTop}px`;

/** Keep visual editor layers aligned even when hidden viewports clamp before a native textarea scrollbar. */
export const syncCodeEditorScroll = ({
	source,
	syntaxViewport,
	lineViewport,
	caretViewport,
}: CodeEditorScrollParts) => {
	syntaxViewport.scrollTop = source.scrollTop;
	syntaxViewport.scrollLeft = source.scrollLeft;
	lineViewport.scrollTop = source.scrollTop;

	syntaxViewport.style.translate = residualTranslation(syntaxViewport, source);
	lineViewport.style.translate = `0 ${lineViewport.scrollTop - source.scrollTop}px`;

	if (!caretViewport) return;
	caretViewport.scrollTop = source.scrollTop;
	caretViewport.scrollLeft = source.scrollLeft;
	caretViewport.style.translate = residualTranslation(caretViewport, source);
};
