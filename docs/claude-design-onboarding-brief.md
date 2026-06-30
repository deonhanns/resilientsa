# ResilientSA — Claude Design Onboarding Brief
*Import this document into Claude Design to seed the ResilientSA design system.*

---

## Project Name
ResilientSA

## Tagline
Gifts of Community, Roots of Resilience.

## One-Line Description
A community resilience platform rooted in Ubuntu philosophy — helping South African communities trade gifts, skills, and knowledge, and stay connected when formal systems fail.

## Brand Personality
Grounded, warm, trustworthy, calm, dignified, South African, organic, non-corporate, non-clinical. Never techy, never sterile, never NGO-poster-cliché. Think: hand-drawn warmth meets quiet competence. The platform should feel like a trusted neighbour, not a startup.

## Logo
Attached: hand-drawn mark of an open hand holding a sprouting seedling with visible roots, framed by a network sphere of connected nodes above it. Represents Ubuntu (the hand), growth grounded in community (the seedling and roots), and network weaving (the sphere). Wordmark "ResilientSA" in bold sans-serif beneath, with tagline in a warm accent color below that.

---

## Color System — "Living Soil"

### Primary Palette

| Token Name | Hex | Role |
|---|---|---|
| `baobab-bark` | `#2C2A29` | Primary text & linework (replaces black) |
| `canvas-grey` | `#F4F4F2` | Background base (replaces white) |
| `ochre-earth` | `#C85A3C` | Safety pillar / crisis & alert signal |
| `fynbos-aloe` | `#4A7256` | Growth / success / primary action (replaces default blue/green CTA) |
| `sunbaked-clay` | `#E6A854` | Warmth / pending states / Energy pillar |
| `rainwater-blue` | `#3D6B8C` | Calm / navigation / Water pillar |

### Pillar Color Mapping
- Water → Rainwater Blue `#3D6B8C`
- Food → Fynbos Aloe `#4A7256`
- Health → Fynbos Aloe `#4A7256`
- Safety → Ochre Earth `#C85A3C`
- Energy → Sunbaked Clay `#E6A854`
- Skills & Trade → Sunbaked Clay `#E6A854`

### UI State Mapping
- Primary action / buttons → Fynbos Aloe
- Success / confirmed → Fynbos Aloe
- Warning / pending → Sunbaked Clay
- Crisis / urgent alert → Ochre Earth
- Navigation / informational → Rainwater Blue
- Body text → Baobab Bark
- Backgrounds → Canvas Grey

### Accessibility Notes
- Baobab Bark on Canvas Grey: 15.2:1 contrast (AAA)
- Fynbos Aloe on Canvas Grey: 4.8:1 (AA)
- Rainwater Blue on Canvas Grey: 5.1:1 (AA)
- Ochre Earth on Canvas Grey: 4.6:1 (AA)
- Sunbaked Clay on Canvas Grey: 2.9:1 — large text and decorative use only, never body text

---

## Typography

**Headings:** Ubuntu (preferred) or Work Sans (fallback) — bold for H1/display, semibold for H2/H3
**Body & UI:** Inter (preferred) or Roboto (fallback) — regular weight, medium for emphasis
**Never use italic for UI elements** — reserve italic for quotations and editorial callouts only

### Type Scale (base 16px)
- Display/Hero: 48px Bold (Ubuntu)
- H1: 36px Bold (Ubuntu)
- H2: 28px SemiBold (Ubuntu)
- H3: 22px SemiBold (Ubuntu)
- Body Large: 18px Regular (Inter)
- Body: 16px Regular (Inter)
- Body Small: 14px Regular (Inter)
- Caption/Label: 12px Medium (Inter)
- Minimum readable size (feature phone/SMS contexts): 14px

---

## Visual Application Strategy

**Layer 1 — Foundation:** Canvas Grey base for all backgrounds. Structural/grid elements render at low opacity.

**Layer 2 — Human element:** Bold, continuous Baobab Bark linework for all illustration, iconography, and community/trade visualizations. Hand-drawn, warm line quality — not geometric or corporate.

**Layer 3 — Narrative focus:** Vibrant accent colors (Ochre Earth, Fynbos Aloe, Sunbaked Clay, Rainwater Blue) reserved for points that matter — pillar tags, active states, urgent flags, success confirmations. Accents earn their use; never decorative for its own sake.

---

## Component Priorities (build these first)

1. **Pillar tags/badges** — small colored chips for Water/Food/Health/Safety/Energy/Skills, using the pillar color mapping
2. **Trade listing card** — photo, title, pillar tag, "offering ↔ seeking" pattern
3. **Cell Steward dashboard widgets** — needs radar, member list, ledger summary
4. **Community profile card** — node name, location, member count, active pillars
5. **Grounder/programme card** — verified badge, programme description, "request" action
6. **Crisis mode banner** — high-contrast Ochre Earth alert state, simplified UI
7. **Buttons** — primary (Fynbos Aloe fill), secondary (Baobab Bark outline), crisis/urgent (Ochre Earth fill)
8. **Founder/Elder profile card** — used in the Elder Prospectus and platform "Grounder" directory
9. **Cooperative Formation wizard steps** — multi-step form UI for the readiness assessment, member collection, and document generation flow

---

## Tone for Generated Copy
Plain language. No jargon. No corporate NGO-speak ("synergies," "stakeholders," "leverage"). Written as if explaining to a trusted neighbour. Short sentences. Warm but not sentimental. Never patronizing toward the communities the platform serves.

---

## What NOT to Do
- No pure black (`#000000`) or pure white (`#FFFFFF`) — always use Baobab Bark / Canvas Grey
- No neon, gradient-mesh, or "AI startup" visual clichés
- No stock-photo diversity imagery — prefer the hand-drawn linework style from the logo
- No institutional blue (government/corporate banking feel)
- No generic charity-green (NGO poster feel)
- No emoji in interface copy

---

## Founder / Context (for any generated about/profile content)
**Deon (Sketch) Hanns** — Visual storyteller, consciousness explorer, founder of The San Scribe. Author of *San Consciousness: The Return of the First Wisdom Keepers*. ResilientSA grows from the conviction that ancient community wisdom — reciprocity, gift economies, deep relationship — is the resilience infrastructure modern South African communities need.

---

*Import this brief along with the brand palette markdown and logo PNG into Claude Design's onboarding flow to seed the design system.*
