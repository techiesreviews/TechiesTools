import { canonicalFrameworkRoute } from "../framework/routes.ts";
import { patternCatalog } from "../patterns/registry.ts";

export const githubOwner = "techiesreviews";
export const githubOrganization = `https://github.com/${githubOwner}`;
export const homePath = "/home";
export const appsPath = "/apps";

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

export type ShowcaseIcon = "Palette" | "PanelsTopLeft" | "Sparkles" | "PenLine" | "Blocks" | "Camera" | "ScrollText" | "NotebookPen" | "Clapperboard";

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
  /** The way in. Apps that are not public yet have none. */
  primary?: ShowcaseLink;
  comingSoon?: boolean;
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
    license: "MIT",
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
    license: "MIT",
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
    license: "MIT",
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
    image: "/showcase/native-site-editor.webp",
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
    license: "MIT",
    image: "/showcase/techies-playground.webp",
    privacy: [
      "No server and no account. Nothing is uploaded to Techies.",
      "Licence keys are encrypted with a master password that is never stored.",
      "Plugin search talks directly to WordPress.org.",
    ],
  },
  {
    id: "script-editor",
    name: "Script editor",
    kind: "Video scripts · script.techies.tools",
    home: "subdomain",
    icon: "NotebookPen",
    tagline: "Scripts that sound like you, not like AI.",
    summary: "A clean editor for video scripts that sound like you, not like AI. Select text and your own AI agent rewrites it in place, as a before and after you keep or undo.",
    problem: "Polishing a script with AI means copying text back and forth into a chat, losing track of what changed, and ending up with lines that sound like AI wrote them.",
    fix: "Open a Markdown script from your computer and edit it in a calm view that saves itself back to your file. Select text, pick an edit, and your own AI agent answers right in place, with Keep or Undo.",
    features: [
      { title: "Calm writing view", text: "Open a Markdown script from your computer and edit it section by section, without distractions. It saves itself back to your file." },
      { title: "One-click edits", text: "Select text and ask Sound like me, Simpler, Shorter, Explain how it works, Check facts, or anything else." },
      { title: "Before and after", text: "Your agent answers in place next to the original, so you keep it or undo it with one click." },
      { title: "Sounds like me", text: "Marks the lines that sound generic or written by AI, so you know what to rewrite." },
      { title: "Your own agent", text: "There is no built-in AI and nothing to pay for. Claude Code or any other MCP client does the work." },
      { title: "Ready to record", text: "Export the camera script, or open the script straight in Prompter." },
    ],
    primary: { label: "Open the script editor", href: "https://script.techies.tools" },
    address: "script.techies.tools",
    repository: "script",
    license: "MIT",
    image: "/showcase/script-editor.webp",
    status: "Version 1, made for one person. Working on a script together with others comes later.",
    privacy: [
      "No account and nothing to pay for.",
      "Scripts open from and save to your own device.",
      "The server only passes your asks and the answers between this page and your agent. It never stores your script.",
      "No built-in AI: only the agent you connect sees your text.",
    ],
  },
  {
    id: "prompter",
    name: "Prompter",
    kind: "Teleprompter · prompter.techies.tools",
    home: "subdomain",
    icon: "ScrollText",
    tagline: "Talk to camera without losing your place.",
    summary: "A free teleprompter for talking to camera, plus an MCP server so your AI assistant can write the script with you.",
    problem: "Reading a script on camera means juggling notes, links, and timing, and most teleprompter apps want an account and your script on their servers.",
    fix: "Big text that scrolls by itself, a second screen that opens your links as you reach them, and a script that lives inside its own link.",
    features: [
      { title: "Built for reading", text: "Big text, auto-scroll, a reading line, and a show clock." },
      { title: "A second screen", text: "A main-screen window opens each section's links as you reach them. YouTube links play full size." },
      { title: "Script checker", text: "Points out long lines, a missing main question, links in the wrong place, and similar problems." },
      { title: "Write it with AI", text: "Connect your AI assistant over MCP. It interviews you, writes the script, checks it, and gives you a link." },
      { title: "Works offline", text: "The whole page is one self-contained HTML file." },
    ],
    primary: { label: "Open Prompter", href: "https://prompter.techies.tools" },
    address: "prompter.techies.tools",
    image: "/showcase/prompter.webp",
    privacy: [
      "No account and no server storage.",
      "A shared link carries the whole script after the #, which browsers never send to a server.",
      "The AI connection reads your script, answers, and keeps nothing. It keeps no request logs.",
    ],
  },
  {
    id: "video-review",
    name: "Video Review",
    kind: "Video review · video.techies.tools",
    home: "subdomain",
    icon: "Clapperboard",
    tagline: "Review recordings word by word.",
    summary: "Watch a recording next to its word-timed transcript, comment on exact moments, and mark what to cut.",
    problem: "Reviewing a recording means scrubbing back and forth, writing down timecodes by hand, and sending huge video files to whoever helps you edit.",
    fix: "The video plays straight from your computer beside its transcript. Comment on exact moments, select words to cut, and export the comments and cut list.",
    features: [
      { title: "Comments on the timeline", text: "Comment on an exact moment or a range, step frame by frame, and mark comments resolved." },
      { title: "Cut from the transcript", text: "Select words to cut, shorten pauses, flag retakes, and export the cut list." },
      { title: "Find anything", text: "Search across every video title and transcript." },
      { title: "Works with your AI assistant", text: "Connect your assistant to read the comments and suggest changes." },
    ],
    primary: { label: "Open Video Review", href: "https://video.techies.tools" },
    address: "video.techies.tools",
    image: "/showcase/video-review.webp",
    privacy: [
      "Videos play from your computer and are never uploaded.",
      "Comments and transcripts are saved in your browser. Download a backup at any time.",
      "A connected assistant reaches this tab through a relay; video files never pass through it.",
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
    license: "MIT",
    privacy: [
      "No account and no internet connection needed.",
      "Your camera image never leaves your computer; settings are saved in a local file.",
      "Builds are not code-signed yet, so Windows or macOS may ask you to confirm the first launch.",
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
  { host: "script.techies.tools", href: "https://script.techies.tools", purpose: "Script editor" },
  { host: "prompter.techies.tools", href: "https://prompter.techies.tools", purpose: "Prompter" },
  { host: "video.techies.tools", href: "https://video.techies.tools", purpose: "Video Review" },
];

/** Public GitHub repositories, one row each. */
export const showcaseRepositories: readonly { name: string; repository: string; summary: string; license?: string }[] = [
  { name: "techies.tools", repository: siteRepository, summary: "This website: Framework, Patterns, and Glass card", license: "MIT" },
  ...showcaseApps.flatMap(({ name, repository, summary, license }) => repository && repository !== siteRepository ? [{ name, repository, summary, license }] : []),
  { name: "Native Site Editor starter", repository: "native-site-editor-starter", summary: "The starter website Native Site Editor offers when you create a new site", license: "MIT" },
];

export const githubRepositoryUrl = (repository: string): string => `${githubOrganization}/${repository}`;

export const githubRepositoryApiUrl = (repository: string): string => `https://api.github.com/repos/${githubOwner}/${repository}`;
