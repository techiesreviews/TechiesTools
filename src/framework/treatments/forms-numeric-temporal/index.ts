import { createFormControlDefinition } from "../form-control.ts";

const inputNumber = createFormControlDefinition({
  id: "input-number",
  subject: 'input[type="number"]:not(:disabled):not(:read-only):not(:invalid)',
  selectorSubject: "input",
  label: "Numeric input",
  semanticHtml: '<label for="ticket-count">Ticket count</label><input id="ticket-count" name="ticket-count" type="number" min="0" max="20" step="1" value="2">',
});

export const formsNumericTemporalTreatments = Object.freeze({
  "input-number": inputNumber,
});
