import {
  FRAMEWORK_LEGACY_STORAGE_KEY,
  FRAMEWORK_UI_DIFF_STORAGE_KEY,
  loadFrameworkPaletteColors,
  parseFrameworkPaletteColors,
} from "../../framework/colors/palette-preferences.ts";

const normalizedHex = (value: string) => {
  const cleaned = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(cleaned)) {
    return `#${cleaned.split("").map((channel) => channel.repeat(2)).join("")}`.toUpperCase();
  }
  return /^[\da-f]{6}$/i.test(cleaned) ? `#${cleaned}`.toUpperCase() : null;
};

const syncColorChoices = (field: HTMLElement, value: string | null) => {
  const buttons = [...field.querySelectorAll<HTMLButtonElement>("[data-settings-color-choice]")];
  const matchingButtons = value
    ? buttons.filter((button) => button.dataset.settingsColorChoice === value)
    : [];
  const selectedVariable = field.dataset.settingsColorSelectedVariable;
  const exactButton = selectedVariable
    ? matchingButtons.find((button) => button.dataset.settingsColorVariable === selectedVariable)
    : undefined;
  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", String(exactButton ? button === exactButton : matchingButtons.length === 1 && button === matchingButtons[0]));
  });
};

const setAccordionOpen = (section: HTMLElement, open: boolean) => {
  section.querySelector<HTMLButtonElement>("[data-settings-accordion-trigger]")
    ?.setAttribute("aria-expanded", String(open));
  const content = section.querySelector<HTMLElement>("[data-settings-accordion-content]");
  if (content) content.hidden = !open;
};

const accordionGroup = (section: HTMLElement) =>
  section.closest<HTMLElement>("[data-settings-accordion-group]")
  ?? section.closest<HTMLElement>("[data-settings-bar]")
  ?? document.body;

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const colorChoice = target.closest<HTMLButtonElement>("[data-settings-color-choice]");
  if (colorChoice) {
    const field = colorChoice.closest<HTMLElement>("[data-settings-color-field]");
    const picker = field?.querySelector<HTMLInputElement>('[data-settings-color-input="picker"]');
    const text = field?.querySelector<HTMLInputElement>('[data-settings-color-input="text"]');
    const value = normalizedHex(colorChoice.dataset.settingsColorChoice ?? "");
    if (!field || !picker || !text || !value) return;
    picker.value = value;
    text.value = value;
    text.dispatchEvent(new Event("input", { bubbles: true }));
    text.dispatchEvent(new Event("change", { bubbles: true }));
    field.dataset.settingsColorSelectedVariable = colorChoice.dataset.settingsColorVariable ?? "";
    syncColorChoices(field, value);
    return;
  }

  const choice = target.closest<HTMLButtonElement>("[data-settings-segmented-value]");
  if (choice) {
    const control = choice.closest<HTMLElement>("[data-settings-segmented]");
    if (!control) return;
    control.querySelectorAll<HTMLButtonElement>("[data-settings-segmented-value]").forEach((button) => {
      const selected = button === choice;
      button.setAttribute("aria-pressed", String(selected));
    });
    control.dispatchEvent(new CustomEvent("settings-segmented:change", {
      bubbles: true,
      detail: {
        name: control.dataset.settingsSegmented,
        value: choice.dataset.settingsSegmentedValue,
      },
    }));
    return;
  }

  const trigger = target.closest<HTMLButtonElement>("[data-settings-accordion-trigger]");
  const section = trigger?.closest<HTMLElement>("[data-settings-accordion]");
  if (!trigger || !section) return;

  const open = trigger.getAttribute("aria-expanded") !== "true";
  accordionGroup(section).querySelectorAll<HTMLElement>("[data-settings-accordion]").forEach((item) => {
    setAccordionOpen(item, item === section && open);
  });
  section.dispatchEvent(new CustomEvent("settings-accordion:change", {
    bubbles: true,
    detail: { id: section.dataset.settingsAccordion, open },
  }));
});

const syncColorField = (input: HTMLInputElement, commit: boolean) => {
  const field = input.closest<HTMLElement>("[data-settings-color-field]");
  if (!field) return;
  delete field.dataset.settingsColorSelectedVariable;
  const picker = field.querySelector<HTMLInputElement>('[data-settings-color-input="picker"]');
  const text = field.querySelector<HTMLInputElement>('[data-settings-color-input="text"]');
  if (!picker || !text) return;

  if (input === picker) {
    text.value = picker.value.toUpperCase();
    syncColorChoices(field, text.value);
    return;
  }

  const color = normalizedHex(text.value);
  if (color) {
    picker.value = color;
    if (commit) text.value = color;
    syncColorChoices(field, color);
  } else if (commit) {
    text.value = picker.value.toUpperCase();
    syncColorChoices(field, text.value);
  } else {
    syncColorChoices(field, null);
  }
};

const renderFrameworkPalette = (field: HTMLElement) => {
  const options = field.querySelector<HTMLElement>("[data-settings-color-options]");
  if (!options) return;
  const selected = normalizedHex(field.querySelector<HTMLInputElement>('[data-settings-color-input="text"]')?.value ?? "");
  let colors = parseFrameworkPaletteColors(null);
  try {
    colors = loadFrameworkPaletteColors(localStorage);
  } catch {
    // Access to localStorage can be blocked; the canonical default remains available.
  }
  const buttons = colors.map((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.settingsColorChoice = color.value;
    button.dataset.settingsColorVariable = color.variable;
    button.setAttribute("aria-label", `Use Framework color ${color.name}, ${color.variable}, ${color.value}`);
    button.setAttribute("aria-pressed", "false");
    button.title = `${color.name} · ${color.variable} · ${color.value}`;

    const swatch = document.createElement("span");
    swatch.className = "settings-color-field__swatch";
    swatch.style.setProperty("--settings-color-choice", color.value);
    swatch.setAttribute("aria-hidden", "true");

    const name = document.createElement("span");
    name.className = "settings-color-field__choice-name";
    name.textContent = color.name;
    const variable = document.createElement("code");
    variable.className = "settings-color-field__choice-variable";
    variable.textContent = color.variable;
    button.append(swatch, name, variable);
    return button;
  });
  options.replaceChildren(...buttons);
  syncColorChoices(field, selected);
};

const hydrateFrameworkPalettes = () => {
  document.querySelectorAll<HTMLElement>('[data-settings-color-palette-source="framework"]')
    .forEach(renderFrameworkPalette);
};

requestAnimationFrame(hydrateFrameworkPalettes);
window.addEventListener("storage", (event) => {
  if ([FRAMEWORK_UI_DIFF_STORAGE_KEY, FRAMEWORK_LEGACY_STORAGE_KEY].includes(event.key ?? "")) {
    hydrateFrameworkPalettes();
  }
});

document.addEventListener("settings-color:sync", (event) => {
  if (!(event.target instanceof HTMLElement)) return;
  const field = event.target.closest<HTMLElement>("[data-settings-color-field]");
  const text = field?.querySelector<HTMLInputElement>('[data-settings-color-input="text"]');
  if (field) {
    syncColorChoices(field, normalizedHex(text?.value ?? ""));
  }
});

document.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement) syncColorField(event.target, false);
}, { capture: true });

document.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement) syncColorField(event.target, true);
}, { capture: true });
