import { createActionControlDefinition } from "../actions/index.ts";

const sources = [
  {
    id: "input-submit",
    subject: 'input[type="submit"]',
    label: "Submit input",
    semanticHtml: '<form><input type="submit" value="Submit order"></form>',
    secondaryLabel: "Secondary submit input",
    secondarySemanticHtml: '<form><input type="submit" value="Save draft" data-variant="secondary"></form>',
  },
  {
    id: "input-reset",
    subject: 'input[type="reset"]',
    label: "Reset input",
    semanticHtml: '<form><label for="reset-example">Example value</label><input id="reset-example" name="example" type="text" value="Initial value"><input type="reset" value="Reset form"></form>',
    secondaryLabel: "Secondary reset input",
    secondarySemanticHtml: '<form><input type="reset" value="Reset form" data-variant="secondary"></form>',
  },
  {
    id: "input-button",
    subject: 'input[type="button"]',
    label: "Button input",
    semanticHtml: '<input type="button" value="Open options" onclick="this.nextElementSibling.textContent=\'Options opened.\'"><output aria-live="polite"></output>',
    secondaryLabel: "Secondary button input",
    secondarySemanticHtml: '<input type="button" value="Show help" onclick="this.nextElementSibling.textContent=\'Help opened.\'" data-variant="secondary"><output aria-live="polite"></output>',
  },
] as const;

export const formsFileActionTreatments = Object.freeze(Object.fromEntries(
  sources.map((source) => [source.id, createActionControlDefinition({
    ...source,
    selectorSubject: "input",
  })]),
));
