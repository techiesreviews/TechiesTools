import { canonicalFrameworkRoute } from "../framework/routes.ts";
import { patternCatalog } from "../patterns/registry.ts";

export const githubOwner = "techiesreviews";
export const githubOrganization = `https://github.com/${githubOwner}`;
export const homePath = "/home";

export interface ShowcaseLink {
  label: string;
  href: string;
}

export interface ShowcaseTool {
  name: string;
  icon: "Palette" | "PanelsTopLeft" | "Sparkles" | "History";
  summary: string;
  links: readonly ShowcaseLink[];
}

export interface ShowcaseProject {
  id: string;
  name: string;
  kind: string;
  icon: "PenLine" | "Blocks" | "Camera" | "FlaskConical";
  summary: string;
  problem: string;
  fix: string;
  features: readonly string[];
  primary: ShowcaseLink;
  repository?: string;
  privacy: readonly string[];
}

export interface ShowcaseAddress {
  host: string;
  href: string;
  purpose: string;
  test?: boolean;
}

/** Tools that live on techies.tools itself, in Main menu order. */
export const showcaseTools: readonly ShowcaseTool[] = [
  {
    name: "Framework",
    icon: "Palette",
    summary: "Choose your colors, fonts, spacing, and the look of every HTML element once. Export them as plain CSS plus an AI-ready guide, so any website or AI assistant can follow your design.",
    links: [
      { label: "Design system", href: canonicalFrameworkRoute("design-system")!.path },
      { label: "Homepage preview", href: canonicalFrameworkRoute("homepage")!.path },
      { label: "Element reference", href: canonicalFrameworkRoute("elements")!.path },
    ],
  },
  {
    name: "Patterns",
    icon: "PanelsTopLeft",
    summary: `A library of ${patternCatalog.length} ready-made interface pieces, such as buttons and cards, drawn in your Framework. Adjust them and copy the HTML and CSS.`,
    links: [{ label: "Browse patterns", href: "/patterns" }],
  },
  {
    name: "Glass card",
    icon: "Sparkles",
    summary: "Shape a frosted-glass card with blur, reflections, edges, glow, and a light you can drag around. Copy the CSS, the markup, or a complete HTML file.",
    links: [{ label: "Make a glass card", href: "/tools/glass-card" }],
  },
  {
    name: "Changelog",
    icon: "History",
    summary: "Every update to techies.tools in plain words, so you can see what changed and why.",
    links: [{ label: "Read the changelog", href: "/changelog" }],
  },
];

/** Techies projects that live on their own subdomain or download. */
export const showcaseProjects: readonly ShowcaseProject[] = [
  {
    id: "native-site-editor",
    name: "Native Site Editor",
    kind: "Web app",
    icon: "PenLine",
    summary: "A visual editor for plain HTML and CSS websites that live in a GitHub repository.",
    problem: "Most website builders keep your site in a format only they understand. Leave the builder and the site stops working.",
    fix: "Your GitHub repository is the site. Edit it visually or in code, save it as a normal commit, and stop using the editor whenever you like.",
    features: [
      "Click any text or image in a live preview of your real pages to edit it.",
      "Code editor beside the preview, plus pages, addresses, and image uploads.",
      "Claude, Codex, or any MCP assistant can suggest changes that arrive as drafts for you to review.",
    ],
    primary: { label: "Open the editor", href: "https://editor.techies.tools" },
    repository: "native-site-editor",
    privacy: [
      "Sign in with GitHub. Your GitHub token stays on the server and never reaches the page's code.",
      "Unsaved drafts stay in your browser until you save.",
      "AI assistants can draft changes, but only you can save them.",
    ],
  },
  {
    id: "techies-playground",
    name: "Techies Playground",
    kind: "Web app",
    icon: "Blocks",
    summary: "Start a WordPress test site in your browser with the premium plugins and themes you own.",
    problem: "Trying a premium WordPress plugin usually means setting up a server and pasting licence keys into places they can leak from.",
    fix: "WordPress runs right in your browser tab. Plugins stay on your computer, and licence keys can live in an encrypted vault.",
    features: [
      "Keep plugin ZIPs in a local vault and search the WordPress.org directory.",
      "Save setups as reusable recipes and reopen your last 30 test sites.",
      "Pick any WordPress version from 6.3 to the latest release.",
    ],
    primary: { label: "Open Playground", href: "https://play.techies.tools" },
    repository: "techies-playground",
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
    icon: "Camera",
    summary: "Your live camera in a movable shape that floats above every other window.",
    problem: "Recording a screen with your face in the corner often means a heavy recording app just to place one camera bubble.",
    fix: "A small app that does only that: pick a shape, drag it anywhere, and keep it on top while you record or present.",
    features: [
      "Circle, rounded square, portrait, and landscape shapes you can drag and resize.",
      "Move the picture inside the shape, mirror it, and go full screen with one click.",
      "Saved scenes, tray controls, and a Ctrl+Shift+C shortcut.",
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
    kind: "Experiment",
    icon: "FlaskConical",
    summary: "A visual page builder for Astro websites whose live preview is built entirely in your browser.",
    problem: "Previewing an Astro page normally needs a server or a build step on every change.",
    fix: "Astro's real compiler runs in the browser, so the preview updates in about 30 milliseconds.",
    features: [
      "Click anything in the preview to jump to its code.",
      "Double-click text to edit it in place.",
      "Insert components from a side panel.",
    ],
    primary: { label: "Try the experiment", href: "https://astro.techies.tools" },
    privacy: [
      "No sign-in. Drafts stay in your browser.",
      "Your code runs in a locked-down frame with no server behind it.",
    ],
  },
];

/** Every public address Techies runs on techies.tools. */
export const showcaseAddresses: readonly ShowcaseAddress[] = [
  { host: "techies.tools", href: "https://techies.tools", purpose: "This website: Framework, Patterns, and Glass card" },
  { host: "editor.techies.tools", href: "https://editor.techies.tools", purpose: "Native Site Editor" },
  { host: "play.techies.tools", href: "https://play.techies.tools", purpose: "Techies Playground" },
  { host: "astro.techies.tools", href: "https://astro.techies.tools", purpose: "Astro Live Builder experiment" },
  { host: "preview.techies.tools", href: "https://preview.techies.tools", purpose: "Test version of this website, with upcoming changes", test: true },
  { host: "preview-editor.techies.tools", href: "https://preview-editor.techies.tools", purpose: "Test version of Native Site Editor", test: true },
];

/** Public GitHub repositories, including this website. */
export const showcaseRepositories: readonly { name: string; repository: string; summary: string }[] = [
  { name: "techies.tools", repository: "TechiesTools", summary: "This website and its tools" },
  ...showcaseProjects.flatMap(({ name, repository, summary }) => repository ? [{ name, repository, summary }] : []),
];

export const githubRepositoryUrl = (repository: string): string => `${githubOrganization}/${repository}`;

export const githubRepositoryApiUrl = (repository: string): string => `https://api.github.com/repos/${githubOwner}/${repository}`;
