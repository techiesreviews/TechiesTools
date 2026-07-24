import { createFormControlDefinition } from "../form-control.ts";
import { createNativeAccentDefinition } from "../native-accent.ts";

const select = createFormControlDefinition({
  id: "select",
  subject: "select:not([multiple]):not([size]):not(:disabled):not(:invalid)",
  label: "Collapsed select",
  semanticHtml: '<label for="choice-intent">Intent</label><select id="choice-intent" name="intent"><option value="">Choose an intent</option><option value="browse">Browse</option><option value="act">Act</option></select>',
});

const inputCheckbox = createNativeAccentDefinition({
  id: "input-checkbox",
  subject: 'input[type="checkbox"]',
  selectorSubject: "input",
  label: "Checkbox",
  semanticHtml: '<label><input name="updates" type="checkbox" value="email"> Email updates</label>',
});

const inputRadio = createNativeAccentDefinition({
  id: "input-radio",
  subject: 'input[type="radio"]',
  selectorSubject: "input",
  label: "Radio group",
  semanticHtml: '<fieldset><legend>Contact method</legend><label><input name="contact" type="radio" value="email"> Email</label><label><input name="contact" type="radio" value="phone"> Phone</label></fieldset>',
});

export const formsChoiceTreatments = Object.freeze({
  select,
  "input-checkbox": inputCheckbox,
  "input-radio": inputRadio,
});
