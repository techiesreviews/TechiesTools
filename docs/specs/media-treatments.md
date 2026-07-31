# Media Element Treatments

## Decision

Promote `img`, `figure`, and `figcaption` to Active `1.0.0`. Keep `picture`, `source`, `audio`, `video`, and `track` Native `0.0.0`.

The Active Definitions own a responsive `100%` maximum, automatic block size, and token-backed radius for images, logical figure rhythm without user-agent inline indentation, and readable caption type/rhythm. Each uses one exact low-specificity CSS box. Percentage authoring is explicitly enabled only on the responsive maximum declaration; other length controls continue rejecting percentages. Intrinsic width and height attributes remain required to reserve aspect ratio and reduce layout shift.

`picture` and `source` preserve browser source selection and the final `img` fallback. `source` and `track` are non-rendered and emit no CSS. Audio and video retain platform controls, keyboard/touch behavior, playback state, full-screen and picture-in-picture features, timed tracks, and fallback content. A separately reviewed equivalent-behavior contract would be required before replacing native media controls.

## Evidence

Checked 2026-07-23. MDN marks all eight Media Elements Baseline Widely available:

- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/picture>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figure>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/figcaption>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video>
- <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/track>

Automated coverage verifies lifecycle and visible/exported parity, locked CSS boxes, image dimensions and alternatives, picture fallback, media controls, captions, transcripts, timed-track metadata, Context inclusion, and zero CSS for Native and non-rendered entries.
