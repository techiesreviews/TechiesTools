import { createFormControlDefinition } from "../form-control.ts";

const select = createFormControlDefinition({
  id: "select",
  subject: "select:not([multiple]):not([size]):not(:disabled):not(:invalid)",
  label: "Collapsed select",
  semanticHtml: '<label for="choice-intent">Intent</label><select id="choice-intent" name="intent"><option value="">Choose an intent</option><option value="browse">Browse</option><option value="act">Act</option></select>',
});

export const formsChoiceTreatments = Object.freeze({ select });
