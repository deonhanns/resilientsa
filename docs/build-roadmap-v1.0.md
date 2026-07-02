# ResilientSA — Build Roadmap
## Bridge Document | Version 1.1
*Sequences all Crew Orders from clickable prototype to pilot-ready platform. The document that converts extensive specs into a build sequence.*

---

## 1. Governing Principles

**Build in the right order.** Every dependency is explicit. O'Brien does not start Order N+1 until Order N is complete and merged.

**Bones before O'Brien builds.** Every human-facing Crew Order is gated by a Bones verdict before O'Brien writes a line of code. The Bones Protocol (`docs/bones-protocol-v1.0.md`) defines what this means.

**Worf reviews before merge.** Every Order touching PII or the security boundary gets a Worf sign-off before the PR is considered complete.

**McCoy designs before O'Brien builds.** The clickable prototype (Order 001) is produced in Claude Design, reviewed by Bones, and approved by Captain before any PWA code begins. Everything O'Brien builds in Orders 002–010 is built from McCoy's approved designs.

**The MVP scope is the ceiling.** Orders 001–010 deliver Mission Brief Section 11.1 (Must Have) and 11.2 (Should Have). Nothing Phase 2 appears here.

**Language is a design problem, not just a translation problem.** South Africa has 11 official languages. The platform's primary language barrier strategy is visual-first design — pillar colours, icons, and patterns communicate before words do. The Cell Steward is the human language bridge for their community. i18n is wired in from ORDER 002 so that English + Afrikaans are available at MVP launch and additional languages (isiZulu, others) can be added without rework. Voice/USSD (Phase 2) is the long-term answer for non-literate users regardless of language.

---

## 2. Pre-Build Gate — Before Any Order Is Issued

These are not Crew Orders. They are preconditions. No Order is issued until all three are confirmed.

| Gate | Owner | Status |
|---|---|---|
| Kilo Code cold-start verification | O'Brien session | ✅ Verified 2026-06-30 |
| Community Health Protocol Spec committed | Spock | ✅ Done |
| Bones Protocol committed | Spock | ✅ Done |

---

## 3. The Crew Order Sequence

### ORDER 001 — Clickable Prototype (McCoy / Claude Design)
**Owner:** McCoy (Claude Design), not O'Brien
**Gate:** Bones Protocol review required. Bones Brief is fully specified in `docs/bones-protocol-v1.0.md` Section 6.
**Dependencies:** None — this is the first deliverable.

**Scope:**
Three clickable screens in Claude Design, built from `docs/brand-palette-v1.0.md` and `docs/claude-design-onboarding-brief.md`:
1. Trade Exchange — gift/need listing and match experience
2. Community Marketplace ("Get Support") — Programme Offering browsing and request
3. Cell Steward Dashboard — needs radar, member list, network summary

**Language note for McCoy:** Every screen must be designed to communicate meaning without relying on text alone. Pillar colours, icons, and visual hierarchy carry meaning first. A person who cannot read the English label on a Water listing should still be able to identify it as a Water listing from its visual treatment. This is tested explicitly in the Bones Protocol (Q6 — Visual Language Independence, per `docs/bones-protocol-v1.0.md` Section 3).

**Definition of done:** Bones verdict is PASS or CONDITIONAL PASS (with changes applied). Captain has approved. Design files are exported and committed to `design/prototype-v1/`.

**What this unlocks:** Orders 002–010 (O'Brien builds from these approved designs). The prototype itself is carried into the first Cape Town RA/CPF community meeting.

---

### ORDER 002 — Project Scaffold, Design Tokens, and i18n Foundation
**Owner:** O'Brien
**Gate:** No Bones review (no human-facing output yet). No Worf review (no PII in this order).
**Dependencies:** ORDER 001 approved

**Scope:**
- Initialise React + Vite PWA project structure per Technical Architecture Section 6.2
- Configure Tailwind with `docs/brand-palette-v1.0.md` colour tokens (Technical Architecture Section 6.1)
- Create `src/lib/pillars.ts` — Six Pillars TypeScript constants, verbatim from `docs/pillar-integration-reference-v1.0.md` Section 8
- Create `src/lib/api.ts` — typed API client shell (base client with auth header handling, no endpoints yet)
- Service Worker scaffold — offline-first PWA shell, IndexedDB initialisation via `idb`
- Empty component directories per Technical Architecture Section 6.2
- Vercel deployment connected to `main` branch
- **Install and configure `react-i18next` with the following structure from day one:**
  - `src/i18n/index.ts` — i18n initialisation, language detection, fallback to English
  - `src/i18n/locales/en.json` — English strings (all UI copy lives here, never hardcoded in components)
  - `src/i18n/locales/af.json` — Afrikaans strings (populated for MVP launch)
  - `src/i18n/locales/zu.json` — isiZulu strings (scaffold only for MVP — empty translations fall back to English; populated in Phase 2)
  - Language selector: simple toggle in user settings, defaults to English
  - `User.preferred_language` field added to the `User` schema (passed to ORDER 003 migration)

**Why i18n at ORDER 002, not later:** adding internationalisation to an existing React codebase requires touching every string in every component. Doing it at scaffold stage means zero rework. Doing it later means a significant refactor. The cost of wiring it in now is two hours. The cost of not doing it is days of rework when isiZulu or another language becomes urgent.

**Afrikaans rationale:** for Cape Town pilot communities specifically, Afrikaans covers a significant portion of the population. It is also well-supported by translation tools, making the translation work tractable for MVP. isiZulu is the most widely spoken home language nationally — wired as a scaffold now, populated in Phase 2.

**Definition of done:** `git push` to `main` triggers a Vercel preview deployment. The deployed URL shows the PWA shell. `src/lib/pillars.ts` exports the correct enum and constants. All UI strings in the scaffold are externalised to `en.json` — no hardcoded strings in components. Afrikaans translations exist for all scaffold-level strings. O'Brien standup entry.

---

### ORDER 003 — PostgreSQL Schema
**Owner:** O'Brien
**Gate:** Worf review required — schema includes `phone_number` (encrypted), sets up the `coop_pii` namespace, and establishes row-level security policies.
**Dependencies:** ORDER 002 complete

**Scope:**
All tables from Technical Architecture Document Section 3, exactly as specified:
- Core: `Node`, `Cell`, `User` (include `preferred_language` field per ORDER 002), `GiftsProfile`, `Listing`, `Match`, `TradeCompletion`, `CommunityExchangeReference`, `ValueCharter`
- Marketplace: `Grounder`, `ProgrammeOffering`, `OfferingEngagement`, `OfferingEndorsement`
- Cooperative: `Cooperative`, `FoundingMember` (in `coop_pii` schema namespace), `CooperativeStatusEvent`
- Network health: `ConnectionEvent`, `NetworkPhaseSnapshot`
- Crisis: `CrisisMode`
- Anticipatory: `ExternalSignal`, `InternalForecast`, `AnticipatoryAlert`, `MultiSignalAlert`
- Community health: `CommunityHealthAssessment`
- Notifications: `NotificationLog` (with `whatsapp` channel enum value)
- Users: `whatsapp_opted_in`, `whatsapp_number`, `preferred_language` fields

Row-level security policies enforcing `node_id` tenant isolation at the database layer, not just application logic.

**Definition of done:** All tables created via migration. `FoundingMember` in `coop_pii` schema with separate encryption config. `SCOTTY_PATTERNS.md` updated with any schema patterns discovered. Worf signs off. O'Brien standup entry.

---

### ORDER 004 — Authentication
**Owner:** O'Brien
**Gate:** Bones review required (SMS OTP is the first thing a new member experiences). Worf review required (phone numbers are PII, session tokens are security-sensitive).
**Dependencies:** ORDER 003 complete, Africa's Talking account active

**Scope:**
- `POST /auth/request-code` — phone number → Africa's Talking SMS OTP send
- `POST /auth/verify-code` — code verification → 30-day session token stored in IndexedDB on client
- Session middleware for all subsequent API routes
- PWA auth screens (from ORDER 001 prototype design, or basic Bones-reviewed screen if auth not included in prototype)
- Offline session handling — token persists in IndexedDB, silently refreshed on connectivity
- Language preference stored on session: if `User.preferred_language` is set, the PWA switches to that language on login

**Definition of done:** A real phone number receives an OTP via Africa's Talking, enters it in the PWA, and receives a valid session token. Session persists across PWA reloads. Worf confirms phone number encrypted at rest in `User` table. Language preference loads correctly on login. O'Brien standup entry.

---

### ORDER 005 — Gifts Profile
**Owner:** O'Brien
**Gate:** Bones review required — first community member experience after auth.
**Dependencies:** ORDER 004 complete

**Scope:**
- `GET /gifts-profile/me` and `PUT /gifts-profile/me`
- `GiftsProfile` CRUD on the backend
- Three-question guided capture UI (from ORDER 001 prototype or new Bones-reviewed design)
- All three questions externalised to `en.json` and `af.json` — Bones reviews both language versions
- Offline: profile cached in IndexedDB, updates via Outbox pattern (Technical Architecture Section 5.1)
- **Platform requirement per June Holley Integration Guide Section 3.2:** on profile completion, immediately surface at least one potential connection to the Cell Steward if the cell has existing members. The first experience of submitting a Gifts Profile must feel like a connection being made, not a form being filed.

**Definition of done:** A member can complete their Gifts Profile, see it persist across sessions, and update it. Profile renders correctly in English and Afrikaans. Cell Steward receives a contextual nudge if complementary gifts exist. O'Brien standup entry.

---

### ORDER 006 — Trade Exchange
**Owner:** O'Brien
**Gate:** Bones review required — core product experience.
**Dependencies:** ORDER 005 complete

**Scope:**
- `GET /listings`, `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id`
- `POST /matches`, `PATCH /matches/:id/confirm`, `PATCH /matches/:id/decline`
- `POST /trade-completions/:match_id/confirm-fairness`
- `GET /community-exchange-reference`
- Trade Exchange UI (from ORDER 001 approved prototype design)
- Pillar tag selection — uses `src/lib/pillars.ts` constants, never re-derived per component
- Pillar tag labels externalised to `en.json` and `af.json` — pillar colour and icon carry meaning independently of the label
- Offline: listings cached 90-day rolling window; new listings and fairness confirmations queue via Outbox
- Conflict resolution: `Listing.status` transitions use server-side expected-state check (Technical Architecture Section 5.2)
- Steward-facilitated introduction flow: `POST /matches` is Steward-initiated per `Match.facilitated_by_steward`

**Definition of done:** A member can create an offer or need, a Cell Steward can facilitate a match, both parties can confirm fairness. Community Exchange Reference updates from completed trades. Offline creates queue and sync correctly. All UI strings in English and Afrikaans. O'Brien standup entry.

---

### ORDER 007 — Cell Steward Dashboard + Batch Jobs
**Owner:** O'Brien
**Gate:** Bones review required — Steward's primary working view.
**Dependencies:** ORDER 006 complete

**Scope:**
- `GET /steward/dashboard/:cell_id` — member list, needs radar aggregated by pillar, basic activity
- `GET /steward/isolates/:cell_id` — members with no recent `ConnectionEvent`
- `GET /steward/hubs/:cell_id` — high connection density, phase-aware interpretation (June Holley Integration Guide Section 4a.2)
- `GET /steward/network-summary/:cell_id` — plain-language phase summary, never raw graph
- `POST /steward/log-offline-trade` — manual ledger entry for offline trades
- Dashboard UI (from ORDER 001 approved prototype design)
- All dashboard copy externalised to `en.json` and `af.json` — plain-language summaries translated in both
- Reciprocity Prompt logic: when a member's giving significantly outpaces receiving, private nudge to Steward (Mission Brief Section 6.2)
- Steward Companion depletion signal: if Steward's own ratio is imbalanced, Steward Companion receives a nudge (Mission Brief Section 3.2)
- Nightly batch job: `NetworkPhaseSnapshot` computation (Technical Architecture Section 3.4a), `InternalForecast` computation (Anticipatory Intelligence Spec Section 5)

**Definition of done:** A Cell Steward can see member list, needs radar by pillar, phase-aware isolate flags, and a plain-language network summary in English and Afrikaans. Nightly batch produces new `NetworkPhaseSnapshot` and `InternalForecast` rows. O'Brien standup entry.

---

### ORDER 008 — Community Marketplace
**Owner:** O'Brien
**Gate:** Bones review required — community-facing browsing experience.
**Dependencies:** ORDER 006 complete (parallel with ORDER 007 — does not depend on it)

**Scope:**
- `GET /marketplace/offerings` with pillar filter and search
- `POST /marketplace/offerings/:id/request`
- Grounder-side: `POST /grounders` (verification flow), `POST /marketplace/offerings` (create offering), `GET /grounders/requests`
- Community Marketplace UI — "Get Support" entry point, pillar filter, offering cards, request flow (from ORDER 001 approved prototype design)
- "Get Support" entry point and all navigation copy externalised to `en.json` and `af.json`
- Endorsement flow: post-engagement `OfferingEndorsement` prompt to Node Admin
- Offline: cached offering catalogue browsable offline; requests queue via Outbox

**Definition of done:** A Cell Steward can browse Programme Offerings by pillar, request one for their community, a Grounder can see and respond to the request, and an endorsement prompt fires on engagement completion. All community-facing strings in English and Afrikaans. O'Brien standup entry.

---

### ORDER 009 — Notifications (SMS + WhatsApp)
**Owner:** O'Brien
**Gate:** Bones review required for all message copy in both English and Afrikaans. Worf review required (phone number handling in dispatch).
**Dependencies:** ORDER 004 (phone numbers), ORDER 006 (trade match notifications), ORDER 007 (Steward alert notifications), Africa's Talking WhatsApp Business API account active

**Scope:**
- Notification dispatch service — Africa's Talking SMS and WhatsApp channels
- `NotificationLog` writes on every send attempt, delivery status update on callback
- WhatsApp opt-in flow: in-app toggle, explicit per-channel consent, `User.whatsapp_opted_in` and `User.whatsapp_number` captured
- Message types for MVP: `trade_match`, `fairness_prompt`, `steward_alert`, `crisis_activation`
- **Notification copy sent in the recipient's `preferred_language`** — messages pull from `en.json` or `af.json` notification string keys based on `User.preferred_language`. isiZulu falls back to English until Phase 2 translations are populated.
- All notification copy Bones-reviewed in both English and Afrikaans before Order is considered complete
- Non-convergent vs. convergent `AnticipatoryAlert` delivery language per Anticipatory Intelligence Spec Section 4.3

**Definition of done:** A trade match triggers SMS (and WhatsApp if opted in) in the recipient's preferred language. All message copy has a Bones verdict in both languages. `NotificationLog` records every send. O'Brien standup entry.

---

### ORDER 010 — Basic Crisis Mode + Resource Map
**Owner:** O'Brien
**Gate:** Bones review required — highest-stakes human-facing experience on the platform.
**Dependencies:** ORDER 006 (Listing model for Pillar 1–3 filter), ORDER 009 (crisis_activation notification)

**Scope:**
- `POST /crisis-mode/:node_id/activate` and `POST /crisis-mode/:node_id/deactivate` (Cell Steward or Node Admin only)
- On activation: Listing queries filter to Pillars 1–3 only; PWA switches to simplified high-contrast crisis UI (Ochre Earth dominant, non-essential UI removed, text size increases — per Brand Identity System crisis mode adaptations)
- `crisis_activation` notification fires via SMS (and WhatsApp if opted in) to all cell members in their preferred language
- Resource Map: crowdsourced six-pillar resource map, member-updatable, aggressively cached offline
- Crisis mode: Resource Map switches to priority view — water, food, medical, safe gathering points foreground
- All Crisis Mode copy — activation messages, resource map labels, pillar filter labels — externalised to `en.json` and `af.json`; Bones reviews both language versions specifically
- `AnticipatoryAlert` delivery active — convergent alerts surface to Cell Steward with elevated framing (Anticipatory Intelligence Spec Section 4.3)

**Definition of done:** A Cell Steward can activate Crisis Mode. PWA immediately simplifies, filters to Pillars 1–3, and sends notifications in recipients' preferred languages. Resource Map is browsable offline. Deactivation returns to normal mode. Bones verdict on Crisis Mode UI and copy in both languages. O'Brien standup entry.

---

## 4. After Order 010 — Pilot-Ready

At Order 010 complete, the platform delivers Mission Brief Section 11.1 (Must Have) and 11.2 (Should Have). The ship is pilot-ready.

**What happens next is not a Crew Order — it is a Captain-level action:**
- Carry the working platform into the first Cape Town RA/CPF community relationship
- Run the Community Health Assessment (Regional Steward + `docs/community-health-protocol-spec-v1.0.md`)
- Onboard the first pilot node through the full 10-stage Onboarding Journey (Mission Brief Section 9.4)
- Collect real community feedback — including language feedback — that informs Phase 2 prioritisation

**SEDA outreach** is also now warranted — per Captain's sequencing decision (2026-06-30), held pending pilot evidence. At Order 010 complete, pilot evidence exists.

---

## 5. What Is Deliberately Not in This Roadmap

- isiZulu and other language translations beyond English and Afrikaans (Phase 2 — scaffold wired in ORDER 002, translations populated after pilot feedback on language needs)
- Voice/USSD interface (Phase 2 — the real answer for non-literate users regardless of language, per Mission Brief Section 10.3)
- Cooperative Formation backend build (Phase 2 — data model specced, backend deferred)
- Crisis Roles Framework full build — Crisis Roster, workshop tooling (Phase 2)
- Full Anticipatory Intelligence automated ingestion pipelines (Phase 2 — Uhura's manual scanning covers MVP)
- Network Health full graph visualisation UI (Phase 2 — data substrate built in ORDER 007)
- Regional Steward dashboard (Phase 2)
- Mesh radio integration (Phase 2)
- Adaptive ML/federated learning (Phase 2)
- Node Admin dashboard (deliberately deferred to Phase 2 — Cell Steward dashboard is the primary MVP operational surface)

---

## 6. Crew Order Summary Table

| Order | What | Owner | Bones | Worf | Depends On |
|---|---|---|---|---|---|
| 001 | Clickable Prototype | McCoy | ✅ Required | — | Nothing |
| 002 | Project Scaffold + Design Tokens + i18n | O'Brien | — | — | 001 |
| 003 | PostgreSQL Schema | O'Brien | — | ✅ Required | 002 |
| 004 | Authentication | O'Brien | ✅ Required | ✅ Required | 003 |
| 005 | Gifts Profile | O'Brien | ✅ Required | — | 004 |
| 006 | Trade Exchange | O'Brien | ✅ Required | — | 005 |
| 007 | Cell Steward Dashboard + Batch Jobs | O'Brien | ✅ Required | — | 006 |
| 008 | Community Marketplace | O'Brien | ✅ Required | — | 006 |
| 009 | Notifications (SMS + WhatsApp) | O'Brien | ✅ Required (both languages) | ✅ Required | 004, 006, 007 |
| 010 | Crisis Mode + Resource Map | O'Brien | ✅ Required (both languages) | — | 006, 009 |

Orders 007 and 008 can run in parallel once Order 006 is complete.

---

*ResilientSA Build Roadmap v1.1 | Bridge Document | Updated: i18n wired from ORDER 002, Afrikaans at MVP, isiZulu scaffold for Phase 2 | For Bridge and Engine Room Use*
