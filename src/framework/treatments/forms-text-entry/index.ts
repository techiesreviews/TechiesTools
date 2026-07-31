import type { TreatmentDefinition } from "../../model/index.ts";
import { createFormControlDefinition } from "../form-control.ts";

type TextEntrySource = Readonly<{
  id: "input" | "textarea" | "input-text" | "input-email" | "input-tel" | "input-url" | "input-search" | "input-password";
  subject: string;
  label: string;
  semanticHtml: string;
  minBlockSize: string;
}>;

const sources = [
  {
    id: "input",
    subject: "input:not([type])",
    label: "Default text input",
    semanticHtml: '<label for="default-name">Name</label><input id="default-name" name="name" autocomplete="name">',
    minBlockSize: "2.75rem",
  },
  {
    id: "textarea",
    subject: "textarea",
    label: "Multi-line text",
    semanticHtml: '<label for="message">Message</label><textarea id="message" name="message" rows="5"></textarea>',
    minBlockSize: "8rem",
  },
  {
    id: "input-text",
    subject: 'input[type="text"]',
    label: "Text input",
    semanticHtml: '<label for="profile-name">Name</label><input id="profile-name" name="name" type="text" autocomplete="name">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-email",
    subject: 'input[type="email"]',
    label: "Email input",
    semanticHtml: '<label for="account-email">Email address</label><input id="account-email" name="email" type="email" autocomplete="email">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-tel",
    subject: 'input[type="tel"]',
    label: "Telephone input",
    semanticHtml: '<label for="phone">Telephone number</label><input id="phone" name="phone" type="tel" autocomplete="tel">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-url",
    subject: 'input[type="url"]',
    label: "URL input",
    semanticHtml: '<label for="website">Website</label><input id="website" name="website" type="url" autocomplete="url">',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-search",
    subject: 'input[type="search"]',
    label: "Search input",
    semanticHtml: '<search><form><label for="site-query">Search</label><input id="site-query" name="q" type="search" autocomplete="off"></form></search>',
    minBlockSize: "2.75rem",
  },
  {
    id: "input-password",
    subject: 'input[type="password"]',
    label: "Password input",
    semanticHtml: '<label for="current-password">Password</label><input id="current-password" name="password" type="password" autocomplete="current-password">',
    minBlockSize: "2.75rem",
  },
] as const satisfies readonly TextEntrySource[];

export const formsTextEntryTreatments = Object.freeze(Object.fromEntries(
  sources.map((source) => [source.id, createFormControlDefinition({
    ...source,
    ...(source.id.startsWith("input-") ? { selectorSubject: "input" } : {}),
    subject: `${source.subject}:not(:disabled):not(:read-only):not(:invalid)`,
  })]),
)) as Readonly<Record<TextEntrySource["id"], TreatmentDefinition>>;
