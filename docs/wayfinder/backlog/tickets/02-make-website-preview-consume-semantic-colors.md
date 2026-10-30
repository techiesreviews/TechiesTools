---
title: "Make Website Preview consume Semantic colors consistently"
type: task (AFK)
status: needs-triage
assignee:
blocked_by: []
issue: https://github.com/techiesreviews/TechiesTools/issues/37
---

## Issue

From GitHub Issue [techiesreviews/TechiesTools#37](https://github.com/techiesreviews/TechiesTools/issues/37), opened by techiesreviews on 2026-07-17.

Labels: none

#### What happened

Changing Semantic colors updates some Website Preview accents, but other visible surfaces still use palette aliases or fixed colors.

#### What I expected

The Website Preview uses the current Semantic color roles consistently for text, surfaces, actions, borders, and focus treatments.

#### Steps to reproduce

1. Open Framework and select Website Preview.
2. Assign strongly contrasting values to the Semantic color roles.
3. Inspect the hero, navigation, cards, buttons, borders, and focus states.
4. Observe that only part of the website follows the selected roles.

#### Additional context

Fallbacks may protect legibility, but the Preview must not silently use an unrelated palette or fixed color when a Semantic role is available.

## Comments

None.
