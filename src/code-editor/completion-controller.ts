export interface CompletionListItem {
	label: string;
	insertText: string;
	detail: string;
	cursorBack?: number;
}

interface CompletionRange { start: number; end: number; }

interface CompletionControllerOptions<Item extends CompletionListItem> {
	textarea: HTMLTextAreaElement;
	listbox: HTMLElement;
	status: HTMLElement;
	replacementRange: () => CompletionRange | null;
	afterAccept: () => void;
	beforeOpen?: () => void;
	renderItem?: (option: HTMLElement, item: Item, fragment: string) => void;
}

/** Own generic completion state, accessibility, keyboard, pointer, and insertion behavior. */
export const mountCodeCompletion = <Item extends CompletionListItem>(options: CompletionControllerOptions<Item>) => {
	const { textarea, listbox, status } = options;
	let items: readonly Item[] = [];
	let activeIndex = -1;
	const isOpen = () => listbox.matches(":popover-open");
	const close = () => {
		if (isOpen()) listbox.hidePopover();
		items = [];
		activeIndex = -1;
		textarea.setAttribute("aria-expanded", "false");
		textarea.removeAttribute("aria-activedescendant");
	};
	const setActive = (index: number) => {
		if (!items.length) return;
		activeIndex = (index + items.length) % items.length;
		listbox.querySelectorAll<HTMLElement>("[role=option]").forEach((option, optionIndex) => option.setAttribute("aria-selected", String(optionIndex === activeIndex)));
		const active = listbox.querySelector<HTMLElement>(`#${CSS.escape(`${textarea.id}-completion-${activeIndex}`)}`);
		if (active) { textarea.setAttribute("aria-activedescendant", active.id); active.scrollIntoView({ block:"nearest" }); }
	};
	const accept = () => {
		const item = items[activeIndex];
		const range = options.replacementRange();
		if (!item || !range) return;
		textarea.setRangeText(item.insertText, range.start, range.end, "end");
		if (item.cursorBack) textarea.setSelectionRange(textarea.selectionStart - item.cursorBack, textarea.selectionStart - item.cursorBack);
		close();
		options.afterAccept();
		close();
	};
	const show = (nextItems: readonly Item[], fragment = "") => {
		items = nextItems;
		activeIndex = items.length ? 0 : -1;
		listbox.replaceChildren(...items.map((item, index) => {
			const option = document.createElement("div");
			option.id = `${textarea.id}-completion-${index}`;
			option.setAttribute("role", "option");
			option.setAttribute("aria-label", item.label);
			option.setAttribute("aria-selected", String(index === 0));
			if (options.renderItem) options.renderItem(option, item, fragment);
			else {
				const label = document.createElement("code");
				label.textContent = item.label;
				const detail = document.createElement("small");
				detail.textContent = item.detail;
				option.append(label, detail);
			}
			option.addEventListener("pointerdown", (event) => { event.preventDefault(); activeIndex = index; accept(); });
			return option;
		}));
		if (!items.length) { close(); status.textContent = "No suggestions."; return; }
		options.beforeOpen?.();
		if (!isOpen()) listbox.showPopover();
		textarea.setAttribute("aria-expanded", "true");
		textarea.setAttribute("aria-activedescendant", `${textarea.id}-completion-0`);
		status.textContent = `${items.length} ${items.length === 1 ? "suggestion" : "suggestions"}. Use arrow keys, then Enter or Tab.`;
	};

	textarea.addEventListener("blur", close);
	textarea.addEventListener("keydown", (event) => {
		if (event.key === "ArrowDown" && items.length) { event.preventDefault(); event.stopImmediatePropagation(); setActive(activeIndex + 1); }
		else if (event.key === "ArrowUp" && items.length) { event.preventDefault(); event.stopImmediatePropagation(); setActive(activeIndex - 1); }
		else if ((event.key === "Enter" || event.key === "Tab") && items.length) { event.preventDefault(); event.stopImmediatePropagation(); accept(); }
		else if (event.key === "Escape" && items.length) { event.preventDefault(); event.stopImmediatePropagation(); close(); }
	});

	return { accept, close, hasItems:() => Boolean(items.length), isOpen, setActive, show };
};
