# Design QA

Source: `C:/Users/lexvd/AppData/Local/Temp/codex-clipboard-a8e6f20c-afc2-4d55-a5fe-d3503d463b37.png`

Target: `http://127.0.0.1:4321/`

The main Framework surface now follows the supplied browser-preview direction: compact controls stay in the Framework sidebar, while the main canvas presents an edge-to-edge browser-like preview with address bar, device controls, site navigation, hero, primary color cards, type scale preview, and design-system variable overview.

Verified:
- Browser preview replaces the old Dashboard 9 placeholder.
- Browser preview fills the available main pane edge-to-edge.
- Address bar uses `preview.local/design-system`.
- Address bar behaves like a constrained autocomplete: it only accepts the internally defined `/design-system` and `/primary-token` preview pages.
- Preview content scrolls inside the browser viewport below the toolbar, like a real website, with below-the-fold variable sections.
- Design-system preview starts at the browser viewport edge with no extra wrapper spacing.
- Sidebar Type section is compact and still shows a small live preview.
- Device controls update the preview width label and active state.
- Primary color and selected Type role publish updates to the preview surface.
- Navigation button wrapping was fixed after screenshot review.

Remaining iteration notes:
- The preview is adapted to the available app viewport next to the Main menu and Framework sidebar, so the hero headline wraps earlier than in the standalone reference image.

final result: passed
