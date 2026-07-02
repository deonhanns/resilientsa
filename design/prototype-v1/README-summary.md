# ResilientSA — the Living Soil Design System

> A South African community-resilience platform rooted in **Ubuntu** — *a person is a person through other people*. Living Soil is its design language: warm, grounded, and legible to anyone, in any of South Africa's 11 official languages, because meaning is carried by **colour and icon**, not only by words.

---

## What ResilientSA is

ResilientSA helps Cape Town township and peri-urban communities help each other. It is organised into **cells** — the people immediately around you — and everything a community does is grouped under **Six Pillars** of resilience:

**Water · Food · Health · Safety · Energy · Skills & Trade**

The people it serves are evidence-based and tired of empty promises; they have "been through development theatre before." So the product earns trust by *working*, not by looking impressive. The brand voice is a **trusted neighbour** — not a tech startup, not an NGO.

### The three surfaces
1. **The Trade Exchange** — members see what their cell is offering and needing, and post their own. A Cell Steward can facilitate a match between two members.
2. **The Community Marketplace ("Get Support")** — browse programmes other communities have used, by pillar. Feels like *browsing for help*, not navigating a directory.
3. **The Cell Steward Dashboard** — a Steward's working view: where unmet needs are pooling, who has drifted out of touch, and a plain-language read of the cell's health. Scannable in under 10 seconds.

The first deliverable (ORDER 001) is a **three-screen clickable prototype** of exactly these surfaces — built here at `ui_kits/resilientsa-app/`.

---

## Sources used to build this system

- **`uploads/ReSA_logo_1.svg`** — the ResilientSA mark (a hand cradling a germinating seed with roots reaching down). Copied to `assets/logo/resa-mark.svg`.
- **`uploads/ResilientLogo_full.pdf`** — full lock-up (vector art, no extractable text — rendering timed out; the mark SVG is the working asset).
- **`uploads/ResilientSA-McCoy-Prompt-ORDER001-v1.0.md`** — the "McCoy" brief for the first deliverable. It carries the complete brand system (palette, type, pillar meaning, design rules) and the three-screen spec. **This system follows it exactly.**
- **GitHub — [`deonhanns/resilientsa`](https://github.com/deonhanns/resilientsa)** — attached for reference. ⚠️ The GitHub connection's token was **expired** at build time, so this repo could not be read. The brand system in the McCoy brief is complete and self-contained, so the foundation was built from it. **Explore `github.com/deonhanns/resilientsa` yourself** for deeper product context (docs, brand palette, onboarding brief) and re-run to enrich this system if useful.

---

## Content fundamentals — how ResilientSA writes

The voice is a **warm, grounded, trusted neighbour**. Plainspoken. Never institutional, never a pitch.

- **Address the person as "you", talk about "your cell".** "What does your cell need this week?" Not "Submit a resource request."
- **Sentence case everywhere.** Never ALL-CAPS shouting, never Title Case Headings.
- **Plain language, no platform jargon.** The word **"pillar" never appears in the UI** — the colours and icons carry that meaning. Say "Water", "Get support", "Reach out" — not "resource category", "service directory", "engagement".
- **Name real people and real things.** "You offered seedlings. Nomsa wants them." Specific, human, concrete.
- **Calm, never urgent-by-default.** No false urgency, no dark patterns. Ochre Earth (urgent) is reserved for genuine crisis and isolate flags.
- **Framing is forward-looking.** Empty states are growth, not failure ("Be the first to offer something"). The isolate flag is a nudge to connect, never a reprimand.
- **No emoji in product UI.** Meaning comes from the icon system, not emoji. (The brand/voice specimen card uses ✓/✕ only as editorial do/don't marks, not in-product.)

**Say it like a neighbour:** "Someone nearby can help with that." · "You offered seedlings. Nomsa wants them."
**Not like a platform:** "Leverage your cell's pillar coverage." · "Onboarding required to access features."

---

## Visual foundations

**Palette — "Living Soil."** Earth tones on paper. **Never pure black or pure white.**
- **Baobab Bark `#2C2A29`** — all text and linework.
- **Canvas Grey `#F4F4F2`** — all backgrounds.
- **Fynbos Aloe `#4A7256`** — Food pillar, success, primary CTAs.
- **Protea Rose `#B24C63`** — Health pillar (SA's national flower).
- **Ochre Earth `#C85A3C`** — Safety pillar, crisis signals, urgent alerts.
- **Sunbaked Clay `#E6A854`** — Energy pillar, pending states.
- **Indigo Cloth `#5E5A8C`** — Skills & Trade pillar (shweshwe textile).
- **Rainwater Blue `#3D6B8C`** — Water pillar, navigation, informational states.

Each hue has a soft **tint** (e.g. `--aloe-tint`) for tag fills and surfaces, and a hand-mixed **deep** variant for hover/press. **Each of the six pillars has its own distinct on-brand hue** — colour alone separates them, and the icon reinforces it. Pillar colours carry meaning — *never invent new ones.*

**Type.** **Ubuntu** (humanist, warm, unmistakably South African) for all headings. **Inter** for all body and UI. Phone-first scale, 11 → 38px. Tight tracking on large display, normal elsewhere. Line-height 1.5 for body.

**Backgrounds.** Flat Canvas Grey, or a barely-there radial warm-grey (the prototype's device backdrop). No photographic hero imagery in the app; no busy patterns. The one gradient in the system is the subtle device backdrop — content surfaces stay flat.

**Surfaces & cards.** A card is a *raised paper* surface: `--surface-card` (`#FBFBF9`, one step up from canvas), 1px hairline border (`rgba(44,42,41,.12)`), **16px** radius, and a **low, warm, Baobab-tinted shadow** (`--shadow-card`) — never a crisp blue-grey tech drop-shadow. Listing cards carry a **6px pillar colour strip** down the left edge so the pillar reads with the labels covered.

**Corner radii.** Friendly and grounded: inputs/buttons/chips **12px**, cards **16px**, sheets/hero **22px**, pills **999px**. Nothing sharp.

**Elevation system.** Three warm steps — `flat` (hairline lift), `card` (resting card), `raised` (FAB, toast, sheet). Sheets add an upward shadow (`--shadow-sheet`).

**Borders.** Hairline `rgba(44,42,41,.12)` at rest; `rgba(44,42,41,.22)` for emphasis. Colour borders (pillar hue, 1.5–2.5px) signal selection or high urgency.

**Motion.** Gentle and functional, never bouncy-cute. Toasts rise 8px + fade (`.25s ease`); sheets slide up with a soft `cubic-bezier(.2,.8,.2,1)`; overlays fade. **Press** shrinks controls to `scale(0.97)`; **hover** is not relied on (touch-first). No infinite decorative loops. Durations 150–280ms.

**Hover / press states.** Primary actions darken to their `deep` variant conceptually; the built-in interaction is a subtle press-shrink. Selection tints the surface and rings it in the relevant hue.

**Focus.** Rainwater-Blue focus ring (`--focus-ring`, 3px, 35% alpha) for accessibility on inputs.

**Transparency & blur.** Used sparingly — a 40% Baobab scrim behind bottom sheets. No frosted-glass chrome, no heavy blur.

**Imagery vibe.** Warm, earthy, human. If photography is ever added, it should be warm-toned and candid — never cool, corporate, or stocky.

**Layout rules.** Phone-first, 390px design width, 20px page gutter. Fixed **AppBar** (top) and **BottomNav** (bottom); content scrolls between. Minimum tap target **44px** (lg buttons 52px); the FAB is 56px. Bottom nav and pillar buttons read **icon-first** for the multi-language context.

---

## Iconography

ResilientSA has **no supplied icon font or sprite**, so the system uses **[Lucide](https://lucide.dev)** line icons — their thin, round-capped linework echoes the seed-in-hand mark. **The exact Lucide path data is inlined** into `components/foundation/Icon.jsx` (ISC-licensed), so the set ships self-contained with **no runtime CDN dependency**.

- **Style:** line-only, `currentColor` stroke, **1.75** default weight (2.0 for active/high-emphasis), round caps and joins, 24×24 viewbox.
- **The six pillar glyphs are load-bearing.** `water` (droplet), `food` (wheat), `health` (heart-pulse), `safety` (shield), `energy` (sun), `skills` (handshake). Colour + glyph together identify a pillar **without any text** — this is the core accessibility mechanism of the whole system.
- **UI glyphs:** `plus search bell users map-pin filter arrow-left arrow-right check x hand-heart user-round circle-alert sprout home message-circle clock circle-check`.
- **No emoji** in product UI. No Unicode dingbats as icons.
- **⚠️ Substitution flag:** Lucide is a substitute for an (unsupplied) house icon set. If ResilientSA has its own icons, drop them into `assets/` and remap `ICON_PATHS`.

To extend: add the glyph's inner SVG to `ICON_PATHS` in `components/foundation/Icon.jsx` and (optionally) its name to the `IconName` union in `Icon.d.ts`.

---

## Index — what's in this system

**Foundation (root)**
- `styles.css` — the single entry point consumers link. Imports everything below.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` · `tokens/fonts.css` — CSS custom properties + webfont loading (104 tokens).
- `assets/logo/resa-mark.svg` — the ResilientSA mark.

**Components** (`window.ResilientSALivingSoilDesignSystem_6bdfdd.<Name>`)
- **foundation/** — `Icon`
- **pillars/** — `PillarTag`, `PillarButton`, `PillarGrid` (+ `pillarMeta.js`, the canonical pillar map)
- **forms/** — `Button`, `IconButton`, `Input`, `SearchField`, `SegmentToggle`
- **cards/** — `Card`, `ListingCard`, `ProgrammeCard`
- **feedback/** — `Badge`, `EmptyState`
- **navigation/** — `AppBar`, `BottomNav`
- **data/** — `NeedsRadar`, `MemberRow`, `NetworkSummary`

**UI kit**
- `ui_kits/resilientsa-app/` — the ORDER 001 three-screen prototype (`index.html` + `App.jsx`, `TradeExchange.jsx`, `Marketplace.jsx`, `StewardDashboard.jsx`, `data.js`). Open `index.html`.

**Specimen cards** (`guidelines/`) — Colours (neutrals, pillar hues, signals), Type (Ubuntu, Inter, scale), Spacing (scale, radii & elevation), Brand (mark, six pillars, voice). Plus one `*.card.html` per component directory. All appear on the **Design System** tab.

**Intentional additions** (no source component library was readable, so a purpose-built set was authored against the three-screen brief):
- `NeedsRadar`, `MemberRow`, `NetworkSummary` — the Steward dashboard's bespoke visualisations, required by the brief's "visual, not a table" rule.
- `PillarTag` / `PillarButton` — the pillar-as-meaning primitives that make the "readable without text" rule concrete.
- Lucide as the icon set (see Iconography).

---

## Using the system

Consumers link one file and read components off the namespace:

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
<script>
  const { Button, ListingCard, PillarGrid } = window.ResilientSALivingSoilDesignSystem_6bdfdd;
</script>
```

Colours, type, spacing, radii, and shadows are all CSS custom properties (`var(--action-primary)`, `var(--pillar-water)`, `var(--shadow-card)`) — reach for the **semantic aliases** first.

---

## The six-question test every ResilientSA design must pass

1. **Is it human?** Warm, grounded — not corporate or NGO-generic.
2. **Is it clear on first encounter?** No explanation required.
3. **Does it reduce anxiety?** Enabling, not overwhelming.
4. **Would a stretched Cell Steward trust it on first use?** It earns trust by *working*.
5. **Does it respect the member's time and dignity?** No dark patterns, no false urgency.
6. **Does it communicate without relying on text?** The colour + icon layer carries meaning on its own.

*Cover the labels on any screen. If you still know the pillar, the state, and the action — it passes.*
