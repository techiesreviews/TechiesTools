---
title: "Configure live Google Fonts API integration"
type: task (AFK)
status: needs-triage
assignee:
blocked_by: []
issue: https://github.com/techiesreviews/TechiesTools/issues/64
---

## Issue

From GitHub Issue [techiesreviews/TechiesTools#64](https://github.com/techiesreviews/TechiesTools/issues/64), opened by techiesreviews on 2026-07-24.

Labels: none

#### Goal

Use the Google Fonts Developer API as the primary font-catalog source in local, preview, and production environments while retaining the current bundled fallback.

#### Current state

- Font catalog endpoint and UI integration already exist.
- Without `GOOGLE_FONTS_API_KEY`, `/api/google-fonts.json` intentionally returns the bundled fallback catalog.
- Font family selections and lazy Google Fonts CSS previews already work.

#### Scope

- Enable the Google Fonts Developer API in the relevant Google Cloud project.
- Create and restrict an API key for the Web Fonts Developer API.
- Configure `GOOGLE_FONTS_API_KEY` for local development and deployed environments without exposing it to browser code, generated exports, logs, or the repository.
- Verify `/api/google-fonts.json` returns `source: "google"` when configured.
- Verify popular and recent catalog ordering, supported role weights, literal font previews, and lazy CSS2 loading.
- Preserve graceful fallback behavior when the key, API, or network is unavailable.
- Document setup, ownership, restrictions, rotation, and verification steps.

#### Acceptance criteria

- Local, preview, and production can use the live Google Fonts catalog.
- API key remains server-only and absent from committed files and client payloads.
- Endpoint reports the live Google source when healthy.
- Existing fallback remains functional and tested.
- Setup and secret rotation are documented.

#### Out of scope

- Popular font-pairing recommendations or analytics-backed pairing rankings.

## Comments

None.
