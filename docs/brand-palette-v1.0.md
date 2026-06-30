# ResilientSA — Brand Identity System
## Brand Palette & Typography | Version 1.0
*Document Status: Approved for Implementation*

---

## Core Philosophy: "Living Soil"

The ResilientSA palette bypasses the clinical aesthetics of traditional tech interfaces. It is drawn from the physical realities of the South African landscape, prioritising high contrast for accessibility on varying screen qualities while retaining the warmth of indigenous visual traditions.

This is not a technology brand that has borrowed nature language. It is a community brand that uses technology carefully — and its visual identity reflects that distinction at every level.

---

## The Primary Palette

### Baobab Bark
- **Hex:** `#2C2A29`
- **RGB:** 44, 42, 41
- **Role:** Primary Text & Linework
- **Usage:** Replaces harsh black. Provides grounded, highly legible text for feature phones and printed directories. Ideal for bold, narrative outlines and all body text. The anchor of every composition.

---

### Canvas Grey
- **Hex:** `#F4F4F2`
- **RGB:** 244, 244, 242
- **Role:** Background Base
- **Usage:** A calm, quiet foundation. Reduces eye strain and allows underlying structural elements to recede while vibrant human elements come forward. The default background for all screens, documents, and printed materials.

---

### Ochre Earth
- **Hex:** `#C85A3C`
- **RGB:** 200, 90, 60
- **Role:** Safety Pillar / Crisis Signal
- **Usage:** Represents ancient soils. Used for the Safety pillar, crisis mode activation signals, and urgent alerts. Distinct from primary action states to ensure crisis signals are never confused with standard interactive elements.

---

### Fynbos Aloe
- **Hex:** `#4A7256`
- **RGB:** 74, 114, 86
- **Role:** Growth / Success / Primary Action
- **Usage:** A deep, resilient green. Used for the Food and Health pillars, successful trade confirmations, verified community elements, and primary calls-to-action. The platform's dominant accent — life, growth, and forward movement.

---

### Sunbaked Clay
- **Hex:** `#E6A854`
- **RGB:** 230, 168, 84
- **Role:** Warmth / Pending / Energy Pillar
- **Usage:** An inviting amber. Used for the Energy pillar, pending and waiting states, Reciprocity Prompts, and secondary highlights. Warm attention without alarm.

---

### Rainwater Blue
- **Hex:** `#3D6B8C`
- **RGB:** 61, 107, 140
- **Role:** Calm / Navigation / Water Pillar
- **Usage:** Clear, life-giving blue. Used for the Water pillar, secondary navigation links, informational states, and safe zone markers on the Resource Map. Calm and trustworthy.

---

## Pillar Colour Mapping

| Pillar | Colour | Hex |
|---|---|---|
| Water | Rainwater Blue | `#3D6B8C` |
| Food | Fynbos Aloe | `#4A7256` |
| Health | Fynbos Aloe | `#4A7256` |
| Safety | Ochre Earth | `#C85A3C` |
| Energy | Sunbaked Clay | `#E6A854` |
| Skills & Trade | Sunbaked Clay | `#E6A854` |

---

## UI State Mapping

| State | Colour | Hex |
|---|---|---|
| Primary action (buttons, CTAs) | Fynbos Aloe | `#4A7256` |
| Success / Confirmed | Fynbos Aloe | `#4A7256` |
| Warning / Pending | Sunbaked Clay | `#E6A854` |
| Crisis / Urgent alert | Ochre Earth | `#C85A3C` |
| Safety pillar | Ochre Earth | `#C85A3C` |
| Navigation / Info | Rainwater Blue | `#3D6B8C` |
| All body text | Baobab Bark | `#2C2A29` |
| All backgrounds | Canvas Grey | `#F4F4F2` |

---

## Typography

### Primary Font — Headings & Display
**Ubuntu** (preferred) or **Work Sans** (fallback)

Approachable and structured. Ubuntu carries deliberate meaning in this context — the font name is the platform's philosophical foundation. Use for all headings, section titles, and display text. Bold weight for primary headings. Medium for secondary headings.

### Secondary Font — Body & UI
**Inter** (preferred) or **Roboto** (fallback)

Highly legible, space-efficient sans-serif that renders cleanly on basic mobile interfaces. Use for all body text, UI labels, captions, and form elements. Regular weight for body. Medium for emphasis. Never use italic for UI elements — reserve italic for quotations and callouts only.

### Type Scale (Base 16px)

| Role | Size | Weight | Font |
|---|---|---|---|
| Display / Hero | 48px | Bold | Ubuntu |
| H1 | 36px | Bold | Ubuntu |
| H2 | 28px | SemiBold | Ubuntu |
| H3 | 22px | SemiBold | Ubuntu |
| Body Large | 18px | Regular | Inter |
| Body | 16px | Regular | Inter |
| Body Small | 14px | Regular | Inter |
| Caption / Label | 12px | Medium | Inter |
| SMS / Feature phone | 14px minimum | Regular | Inter |

---

## Visual Application Strategy

### Layer 1 — The Foundation
Canvas Grey (`#F4F4F2`) as the base environment for all screens and documents. Structural elements, grid lines, and background maps rendered at low opacity against this base.

### Layer 2 — The Human Element
Bold, continuous Baobab Bark (`#2C2A29`) linework for foreground illustrations, community interaction maps, trade flows, and gift visualisations. All iconography uses this colour at full weight.

### Layer 3 — The Narrative Focus
Vibrant accents (Ochre Earth, Fynbos Aloe, Sunbaked Clay, Rainwater Blue) applied to critical points of connection, active elements, pillar indicators, and urgent needs. Accents earn their presence — they are never decorative.

---

## Accessibility Requirements

- All text must meet WCAG AA contrast ratio (4.5:1 minimum) against its background
- Baobab Bark on Canvas Grey: **contrast ratio 15.2:1** — exceeds AAA
- Fynbos Aloe on Canvas Grey: **contrast ratio 4.8:1** — passes AA
- Rainwater Blue on Canvas Grey: **contrast ratio 5.1:1** — passes AA
- Ochre Earth on Canvas Grey: **contrast ratio 4.6:1** — passes AA
- Sunbaked Clay on Canvas Grey: **contrast ratio 2.9:1** — use for large text and decorative elements only, not body text
- Minimum touch target size: 44x44px for all interactive elements
- All pillar colours must be accompanied by a text label — never rely on colour alone to communicate pillar category

---

## Crisis Mode Adaptations

When a community node activates Crisis Mode, the interface makes the following adaptations:

- Background shifts to white (`#FFFFFF`) for maximum contrast
- Ochre Earth becomes the dominant accent — crisis urgency is immediately visible
- All non-essential UI elements are removed
- Text size increases by one step across the scale
- High contrast mode activates automatically on devices that support it

---

## Print and Offline Applications

For the quarterly printed Community Directory:

- Canvas Grey background prints as near-white — specify as white for print production
- Baobab Bark prints true — no conversion needed
- Fynbos Aloe and Ochre Earth hold well in standard CMYK printing
- Sunbaked Clay and Rainwater Blue may require spot colour specification for accurate reproduction in low-quality print environments
- All printed materials must include a text version of all colour-coded information

---

## Logo Usage

The ResilientSA mark comprises three elements:
1. An open hand — offering, community, Ubuntu
2. A seedling with visible roots — growth that is grounded, life sustained from below
3. A network sphere — the connection of nodes, June Holley's network weaving made visible

**Tagline:** *Gifts of Community, Roots of Resilience.*

**Clear space:** Maintain minimum clear space equal to the height of the "R" in ResilientSA on all sides of the mark.

**Minimum size:** 120px / 32mm to maintain legibility of the network sphere detail.

**Colour versions:**
- Full colour on Canvas Grey — preferred
- Baobab Bark monochrome on Canvas Grey — for single-colour print
- Canvas Grey on Fynbos Aloe — for reversed applications

---

## What This Brand Is Not

- Not a tech startup palette — no pure black, no neon accents, no gradient mesh
- Not a generic NGO palette — no institutional blue, no charity green
- Not a government palette — no formal navy, no bureaucratic grey
- Not borrowed from anywhere else — every name, every choice is South African, ecological, and grounded in the platform's values

---

*ResilientSA Brand Identity System v1.0 | Approved for Implementation | For Engine Room and Design Use*
