---
name: resilientsa-design
description: Use this skill to generate well-branded interfaces and assets for ResilientSA (the "Living Soil" design system) — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colours, type, fonts, assets, the Six-Pillar system, and UI-kit components for prototyping South African community-resilience surfaces rooted in Ubuntu.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Non-negotiables (from the McCoy brief)
- **Never pure black (`#000`) or pure white (`#fff`).** Baobab Bark `#2C2A29` on Canvas Grey `#F4F4F2`.
- **Meaning without text.** The Six Pillars (Water · Food · Health · Safety · Energy · Skills & Trade) are carried by **colour + icon**, so a design reads in any of SA's 11 languages. Never rely on text alone. Pillar colours carry meaning — do not invent new ones.
- **The word "pillar" never appears in the UI.**
- **Voice = trusted neighbour.** Warm, grounded, plainspoken, sentence case. Not a tech startup, not an NGO. No jargon, no false urgency, no dark patterns.
- **Ubuntu** for headings, **Inter** for body. No emoji in product UI.

## Where things are
- `styles.css` — link this one file; everything (tokens, fonts) flows from it.
- `_ds_bundle.js` — the compiled component library. Read components via `window.ResilientSALivingSoilDesignSystem_6bdfdd.<Name>`.
- `components/` — Icon, PillarTag/PillarButton/PillarGrid, Button/IconButton/Input/SearchField/SegmentToggle, Card/ListingCard/ProgrammeCard, Badge/EmptyState, AppBar/BottomNav, NeedsRadar/MemberRow/NetworkSummary.
- `ui_kits/resilientsa-app/` — the three-screen prototype to copy from.
- `guidelines/` — specimen cards for colour, type, spacing, brand.
- `assets/logo/resa-mark.svg` — the seed-in-hand mark.

Run the six-question test on anything you make (see readme.md): human? clear on first encounter? reduces anxiety? trustworthy on first use? respects time and dignity? communicates without text?
