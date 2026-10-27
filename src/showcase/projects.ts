import { canonicalFrameworkRoute } from "../framework/routes.ts";
import { patternCatalog } from "../patterns/registry.ts";

export const githubOwner = "techiesreviews";
export const githubOrganization = `https://github.com/${githubOwner}`;
export const homePath = "/home";

export const maker = {
  name: "Lex",
  brand: "Techies Reviews",
  photo: "/showcase/lex.webp",
  links: [
    { label: "techies.review", href: "https://techies.review" },
    { label: "YouTube", href: "https://www.youtube.com/@techiesreviews" },
    { label: "GitHub", href: githubOrganization },
  ],
} as const;

export interface ShowcaseLink {
  label: string;
  href: string;
}

export interface ShowcaseFeature {
  title: string;
  text: string;
}

export type ShowcaseIcon = "Palette" | "PanelsTopLeft" | "Sparkles" | "PenLine" | "Blocks" | "Camera" | "FlaskConical";

export interface ShowcaseApp {
  /** URL slug for `/apps/<id>`. */
  id: string;
  name: string;
  kind: string;
  /** Where the app runs: on techies.tools itself, on its own subdomain, or as a download. */
  home: "site" | "subdomain" | "download";
  icon: ShowcaseIcon;
  tagline: string;
  summary: string;
  problem: string;
  fix: string;
  features: readonly ShowcaseFeature[];
  primary: ShowcaseLink;
  /** Extra entry points, such as the Framework's three pages. */
  links?: readonly ShowcaseLink[];
  address?: string;
  repository?: string;
  license?: string;
  /** Screenshot in `public/showcase`; apps without one show an illustration. */
  image?: string;
  privacy: readonly string[];
  status?: string;
}

export interface ShowcaseAddress {
  host: string;
  href: string;
  purpose: string;
  test?: boolean;
}

const siteRepository = "TechiesTools";

/** Every Techies app, in showcase order. Facts come from each project's README, CONTEXT, and docs. */
export const showcaseApps: readonly ShowcaseApp[] = [
  {
    id: "framework",
    name: "Framework",
    kind: "Design tool · techies.tools",
    home: "site",
    icon: "Palette",
    tagline: "Your design, written down once.",
    summary: "Choose your colors, fonts, spacing, and the look of every HTML element in one place. Export them as plain CSS plus an AI-ready guide, so any website or AI assistant can follow your design.",
    problem: "AI tools and templates make every website look the same, and they forget your choices from one page to the next.",
    fix: "The Framework records your design choices once and hands them to any website or AI assistant as plain files you own.",
    features: [
      { title: "Colors that do a job", text: "Build a palette, then give colors jobs such as text, buttons, borders, and focus rings. Contrast is checked for you." },
      { title: "Type and space", text: "Pick from the Google Fonts catalog and set text sizes, spacing, and rounded corners that grow smoothly with the screen." },
      { title: "92 HTML elements", text: "Shape headings, forms, lists, tables, media, and more, and see each one on a realistic sample website." },
      { title: "Ready for AI", text: "Export tokens.css, elements.css, components.css, and a context.md guide that AI assistants can follow." },
    ],
    primary: { label: "Open the Framework", href: canonicalFrameworkRoute("design-system")!.path },
    links: [
      { label: "Design system", href: canonicalFrameworkRoute("design-system")!.path },
      { label: "Homepage preview", href: canonicalFrameworkRoute("homepage")!.path },
      { label: "Element reference", href: canonicalFrameworkRoute("elements")!.path },
    ],
    address: "techies.tools",
    repository: siteRepository,
    image: "/showcase/framework.webp",
    privacy: [
      "No account. Your Framework is saved only in your browser.",
      "Exports are files you download and own. There is no database.",
      "Fonts you pick load from Google Fonts.",
    ],
  },
  {
    id: "patterns",
    name: "Patterns",
    kind: "Component library · techies.tools",
    home: "site",
    icon: "PanelsTopLeft",
    tagline: "Ready-made pieces in your style.",
    summary: `A library of ${patternCatalog.length} ready-made interface pieces, such as buttons, cards, and scroll panels, drawn with your active Framework.`,
    problem: "Copying a component from the web means rewriting its colors, fonts, and spacing until it fits your site.",
    fix: "Every pattern already uses your Framework, so it matches your site the moment you copy it.",
    features: [
      { title: "Drawn in your Framework", text: "Colors, type, spacing, and corners come from the Framework you set up, so each pattern looks like your site." },
      { title: "Focused settings", text: "Open a pattern to adjust a few clear choices, with its preview and source side by side." },
      { title: "Plain HTML and CSS", text: "Inspect and copy semantic HTML and Framework-based CSS. No build step and no library to install." },
    ],
    primary: { label: "Browse patterns", href: "/patterns" },
    address: "techies.tools/patterns",
    repository: siteRepository,
    image: "/showcase/patterns.webp",
    privacy: [
      "No account. Your pattern settings are saved only in your browser.",
      "Some preview images load from Unsplash and Pexels.",
    ],
  },
  {
    id: "glass-card",
    name: "Glass card",
    kind: "Visual generator · techies.tools",
    home: "site",
    icon: "Sparkles",
    tagline: "Frosted glass without the guesswork.",
    summary: "Shape a frosted-glass card with blur, reflections, edges, glow, and a light you can drag around, then copy the result.",
    problem: "Glass effects take a pile of CSS layers that are hard to tune by hand and easy to get wrong on small screens.",
    fix: "Move sliders and drag the light while you watch the card change, then copy code that already works.",
    features: [
      { title: "Every layer in reach", text: "Blur, surface, reflection, edge, glow, radius, and lighting all sit in one settings bar." },
      { title: "Drag the light", text: "Move the light right in the preview, or set its position exactly." },
      { title: "Three ways to export", text: "Copy or save the stylesheet, the markup, or a complete HTML file, or download all three." },
    ],
    primary: { label: "Make a glass card", href: "/tools/glass-card" },
    address: "techies.tools/tools/glass-card",
    repository: siteRepository,
    image: "/showcase/glass-card.webp",
    privacy: [
      "No account. Your latest card is saved only in your browser.",
      "Nothing you make is sent anywhere.",
    ],
  },
  {
    id: "native-site-editor",
    name: "Native Site Editor",
    kind: "Website editor · editor.techies.tools",
    home: "subdomain",
    icon: "PenLine",
    tagline: "Edit plain websites. Keep them yours.",
    summary: "A visual editor for plain HTML and CSS websites that live in a GitHub repository.",
    problem: "Most website builders keep your site in a format only they understand. Leave the builder and the site stops working.",
    fix: "Your GitHub repository is the site. Edit it visually or in code, save it as a normal commit, and stop using the editor whenever you like.",
    features: [
      { title: "Click to edit", text: "Click any text or image in a live preview of your real pages to change it." },
      { title: "Code beside the page", text: "A full code editor sits next to the preview, with pages, addresses, and image uploads." },
      { title: "Saved to GitHub", text: "Save everything as one commit, with conflict checks and history for every file." },
      { title: "Works with AI assistants", text: "Claude, Codex, or any MCP assistant can suggest changes. They arrive as drafts for you to review." },
    ],
    primary: { label: "Open the editor", href: "https://editor.techies.tools" },
    address: "editor.techies.tools",
    repository: "native-site-editor",
    license: "MIT",
    privacy: [
      "Sign in with GitHub. Your GitHub token stays on the server and never reaches the page's code.",
      "Unsaved drafts stay in your browser until you save.",
      "AI assistants can draft changes, but only you can save them.",
    ],
  },
  {
    id: "techies-playground",
    name: "Techies Playground",
    kind: "WordPress test bench · play.techies.tools",
    home: "subdomain",
    icon: "Blocks",
    tagline: "Test premium WordPress plugins in seconds.",
    summary: "Start a WordPress test site in your browser with the premium plugins and themes you own.",
    problem: "Trying a premium WordPress plugin usually means setting up a server and pasting licence keys into places they can leak from.",
    fix: "WordPress runs right in your browser tab. Plugins stay on your computer, and licence keys can live in an encrypted vault.",
    features: [
      { title: "Your plugin vault", text: "Keep plugin and theme ZIPs in a local vault and search the WordPress.org directory." },
      { title: "Reusable recipes", text: "Save a setup as a recipe and reopen any of your last 30 test sites." },
      { title: "Any WordPress version", text: "Pick any version from 6.3 to the latest release, which updates by itself." },
      { title: "Encrypted licence keys", text: "Store keys in a vault locked with a master password that is never saved." },
    ],
    primary: { label: "Open Playground", href: "https://play.techies.tools" },
    address: "play.techies.tools",
    repository: "techies-playground",
    image: "/showcase/techies-playground.webp",
    privacy: [
      "No server and no account. Nothing is uploaded to Techies.",
      "Licence keys are encrypted with a master password that is never stored.",
      "Plugin search talks directly to WordPress.org.",
    ],
  },
  {
    id: "camframe",
    name: "CamFrame",
    kind: "Desktop app · Windows and macOS",
    home: "download",
    icon: "Camera",
    tagline: "Your camera, in any shape, on top.",
    summary: "Your live camera in a movable shape that floats above every other window.",
    problem: "Recording a screen with your face in the corner often means a heavy recording app just to place one camera bubble.",
    fix: "A small app that does only that: pick a shape, drag it anywhere, and keep it on top while you record or present.",
    features: [
      { title: "Four shapes", text: "Circle, rounded square, portrait, or landscape. Drag and resize it anywhere." },
      { title: "Frame yourself", text: "Move the picture inside the shape, mirror it, and go full screen with one click." },
      { title: "Scenes and shortcuts", text: "Save scenes, control it from the tray, and press Ctrl+Shift+C to show its controls." },
    ],
    primary: { label: "Download", href: "https://github.com/techiesreviews/camframe/releases/latest" },
    repository: "camframe",
    privacy: [
      "No account and no internet connection needed.",
      "Your camera image never leaves your computer; settings are saved in a local file.",
      "Builds are not code-signed yet, so Windows or macOS may ask you to confirm the first launch.",
    ],
  },
  {
    id: "astro-live-builder",
    name: "Astro Live Builder",
    kind: "Experiment · astro.techies.tools",
    home: "subdomain",
    icon: "FlaskConical",
    tagline: "Astro pages, previewed instantly.",
    summary: "A visual page builder for Astro websites whose live preview is built entirely in your browser.",
    problem: "Previewing an Astro page normally needs a server or a build step on every change.",
    fix: "Astro's real compiler runs in the browser, so the preview updates in about 30 milliseconds.",
    features: [
      { title: "Click to find code", text: "Click anything in the preview to jump to the line of code that made it." },
      { title: "Edit text in place", text: "Double-click text in the preview to change it." },
      { title: "Insert components", text: "Add components from a side panel and watch them appear." },
    ],
    primary: { label: "Try the experiment", href: "https://astro.techies.tools" },
    address: "astro.techies.tools",
    image: "/showcase/astro-live-builder.webp",
    status: "Experiment: it edits a bundled starter site and has been tested in Chromium only. Its code is not public yet.",
    privacy: [
      "No sign-in. Drafts stay in your browser.",
      "Your code runs in a locked-down frame with no server behind it.",
    ],
  },
];

export const showcaseApp = (id: string): ShowcaseApp | undefined => showcaseApps.find((app) => app.id === id);

export const appPath = (app: Pick<ShowcaseApp, "id">): string => `/apps/${app.id}`;

/** Every public address Techies runs on techies.tools. */
export const showcaseAddresses: readonly ShowcaseAddress[] = [
  { host: "techies.tools", href: "https://techies.tools", purpose: "This website: Framework, Patterns, and Glass card" },
  { host: "editor.techies.tools", href: "https://editor.techies.tools", purpose: "Native Site Editor" },
  { host: "play.techies.tools", href: "https://play.techies.tools", purpose: "Techies Playground" },
  { host: "astro.techies.tools", href: "https://astro.techies.tools", purpose: "Astro Live Builder experiment" },
  { host: "preview.techies.tools", href: "https://preview.techies.tools", purpose: "Test version of this website, with upcoming changes", test: true },
  { host: "preview-editor.techies.tools", href: "https://preview-editor.techies.tools", purpose: "Test version of Native Site Editor", test: true },
];

/** Public GitHub repositories, one row each. */
export const showcaseRepositories: readonly { name: string; repository: string; summary: string; license?: string }[] = [
  { name: "techies.tools", repository: siteRepository, summary: "This website: Framework, Patterns, and Glass card" },
  ...showcaseApps.flatMap(({ name, repository, summary, license }) => repository && repository !== siteRepository ? [{ name, repository, summary, license }] : []),
];

export const githubRepositoryUrl = (repository: string): string => `${githubOrganization}/${repository}`;

export const githubRepositoryApiUrl = (repository: string): string => `https://api.github.com/repos/${githubOwner}/${repository}`;
