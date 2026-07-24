import { createFormControlDefinition } from "../form-control.ts";
import { createNativeAccentDefinition } from "../native-accent.ts";

const inputNumber = createFormControlDefinition({
  id: "input-number",
  subject: 'input[type="number"]:not(:disabled):not(:read-only):not(:invalid)',
  selectorSubject: "input",
  label: "Numeric input",
  semanticHtml: '<label for="ticket-count">Ticket count</label><input id="ticket-count" name="ticket-count" type="number" min="0" max="20" step="1" value="2">',
});

const temporalSources = [
  {
    id: "input-date",
    type: "date",
    label: "Date input",
    semanticHtml: '<label for="start-date">Start date</label><input id="start-date" name="start-date" type="date" min="2026-01-01" max="2026-12-31">',
  },
  {
    id: "input-time",
    type: "time",
    label: "Time input",
    semanticHtml: '<label for="appointment-time">Appointment time</label><input id="appointment-time" name="appointment-time" type="time" min="09:00" max="18:00" step="900">',
  },
  {
    id: "input-datetime-local",
    type: "datetime-local",
    label: "Local date and time input",
    semanticHtml: '<label for="meeting-time">Meeting date and time</label><input id="meeting-time" name="meeting-time" type="datetime-local" min="2026-01-01T09:00" max="2026-12-31T18:00" step="900">',
  },
  {
    id: "input-month",
    type: "month",
    label: "Month input",
    semanticHtml: '<label for="billing-month">Billing month</label><input id="billing-month" name="billing-month" type="month" min="2026-01" max="2026-12">',
  },
  {
    id: "input-week",
    type: "week",
    label: "Week input",
    semanticHtml: '<label for="delivery-week">Delivery week</label><input id="delivery-week" name="delivery-week" type="week" min="2026-W01" max="2026-W52">',
  },
] as const;

const inputRange = createNativeAccentDefinition({
  id: "input-range",
  subject: 'input[type="range"]',
  selectorSubject: "input",
  label: "Range input",
  semanticHtml: '<label for="volume">Volume</label><input id="volume" name="volume" type="range" min="0" max="100" step="5" value="50">',
});

export const formsNumericTemporalTreatments = Object.freeze({
  "input-number": inputNumber,
  ...Object.fromEntries(temporalSources.map((source) => [source.id, createFormControlDefinition({
    id: source.id,
    subject: `input[type="${source.type}"]:not(:disabled):not(:read-only):not(:invalid)`,
    selectorSubject: "input",
    label: source.label,
    semanticHtml: source.semanticHtml,
  })])),
  "input-range": inputRange,
});
