# ResilientSA — Anticipatory Intelligence Specification
## Bridge Document | Version 1.0
*Closes the deferred gap flagged in Crisis Roles Framework Spec Section 7. Extends Mission Brief Sections 4.3, 7.5, and CREW_MANIFEST.md's Uhura role definition.*

---

## 1. Purpose and Why This Matters More Than a Technical Footnote

Mission Brief Section 7.5 states the intelligence layer "shifts from descriptive to anticipatory" in crisis, projecting needs 24–72 hours ahead. This was philosophy without architecture — flagged honestly as deferred in the Crisis Roles Framework Spec (Section 7) rather than glossed over.

**This is not a peripheral feature.** Per the Captain's framing: anticipatory intelligence is what makes ResilientSA proactive rather than reactive — the difference between a platform that helps a community survive a crisis already underway and one that helps a community see it coming and prepare. This distinction sits at the heart of the platform's founding hypothesis (Mission Brief 1.2): communities equipped *before* a crisis sustain themselves better than communities organising *during* one. Anticipatory intelligence is the mechanism that makes "before" actually possible, not just aspirational.

---

## 2. The Two Kinds of Anticipation — Separated, Then Joined

The Mission Brief's single phrase "anticipatory intelligence" actually describes two structurally different capabilities that have been conflated until now. Separating them clarifies who builds what.

### 2.1 Internal Anticipation — Pattern-Based Forecasting

Forecasting drawn entirely from the platform's own accumulated data: trade depletion velocity, isolation trend lines, needs radar trajectories, `NetworkPhaseSnapshot` history (Technical Architecture Document Section 3.4a). This is a genuine Statistical Intelligence extension (Mission Brief 4.3) — time-series analysis over data the platform already collects. **Owned by O'Brien, built into the Community Node tier** (Technical Architecture Document Section 2.2).

### 2.2 External Anticipation — Environmental Signal Scanning

Early warning drawn from outside the platform: load shedding schedules, municipal water/service disruption notices, weather and flood warnings, regional unrest or instability signals, and disease outbreak alerts. This is not derivable from the platform's own data — it requires actively monitoring external sources. **This is Uhura's domain**, a direct extension of the external intelligence and environmental scanning role already defined in `CREW_MANIFEST.md` and exercised for SEDA/CIPC/CBDA regulatory monitoring in `UHURA_INTEL.md`.

### 2.3 Why They Must Converge, Not Run Separately

A node showing internal stress signals (Listing depletion accelerating, isolation rising) is a different and more urgent situation when an external signal (load shedding stage escalation, an approaching weather system) corroborates it. Treating these as two unrelated systems wastes the platform's most valuable anticipatory capability: **the moment internal pattern and external signal agree, confidence in the forecast rises sharply, and that is precisely the moment a Cell Steward most needs to know.**

---

## 3. Uhura's Extended Mission Scope

This section formally extends Uhura's role definition beyond what `CREW_MANIFEST.md` and `UHURA_INTEL.md` currently specify (SEDA/CIPC/CBDA regulatory watch only).

### 3.1 New Signal Sources for Community Resilience Scanning

| Source | Type | What It Feeds |
|---|---|---|
| Eskom / municipal load shedding schedules | Public API / published schedule | Energy pillar (Pillar 5) stress anticipation |
| South African Weather Service | Public API | Water/flood risk, Safety pillar anticipation |
| Municipal service disruption notices (water, sanitation) | Public notices, varies by municipality | Water pillar (Pillar 1) anticipation |
| Provincial/regional civil unrest or instability signals | News monitoring, public reporting | Safety pillar (Pillar 4), Crisis Mode readiness |
| Disease outbreak notices (NICD) | Public health bulletins | Health pillar (Pillar 3) anticipation |

This list is a starting scope, not exhaustive — Uhura's existing practice (per `UHURA_INTEL.md`'s standing format) is to update before relevant Bridge sessions, and this list should grow as real pilot communities reveal which external signals actually matter to them.

### 3.2 What This Does Not Change About Uhura's Role

Uhura remains Bridge-only, DeepSeek-powered, reporting to Captain and Spock (per `CREW_MANIFEST.md`). This extension does not move Uhura into the Engine Room or grant any new platform-write permissions — Uhura's output here is intelligence delivered to the Bridge and, through the mechanism in Section 4 below, surfaced to communities via the existing human-delivery principle (Mission Brief 2.5, 4.5). Uhura does not get a direct line to community members; the signal flows through the same structured, Cell-Steward-mediated path everything else on this platform uses.

### 3.3 Reporting Cadence

`UHURA_INTEL.md` is extended with a new standing section — **Community Resilience Signal Watch** — updated on a regular cadence (weekly, not just "before relevant Bridge sessions" as the regulatory watch is, since these signals are more time-sensitive than cooperative regulatory shifts) once real pilot nodes exist with real locations to monitor signals against. Before pilot nodes exist, this section remains a scoped placeholder, since there is no specific location or community context to scan against yet.

---

## 4. The Convergence Mechanism — How External and Internal Signals Combine

This is the architectural core of the spec: how Uhura's external scan and O'Brien's internal forecasting model actually meet.

### 4.1 Data Model

```
ExternalSignal {
  id (uuid, pk)
  signal_type (enum: load_shedding_escalation, weather_warning,
        water_disruption_notice, unrest_signal, health_outbreak_notice)
  source (text — which of Section 3.1's sources this came from)
  affected_region (text — geographic scope, matched against Node.location)
  severity (enum: watch, warning, severe)
  reported_at (timestamp)
  expires_at (timestamp, nullable)
  logged_by (text, default 'uhura' — distinguishes from any future
        automated ingestion, see Section 7)
  notes (text)
}

InternalForecast {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell, nullable)
  pillar_tag (from Six Pillars enum — see docs/pillar-integration-reference-v1.0.md)
  forecast_type (enum: depletion_trend, isolation_trend,
        needs_radar_trajectory)
  confidence (enum: low, medium, high)
  projected_at (timestamp — when this forecast was generated)
  projected_window_start (timestamp — start of the 24-72hr window
        per Mission Brief 7.5)
  projected_window_end (timestamp)
  basis (jsonb — the underlying data points the forecast was built
        from, for auditability, same pattern as NetworkPhaseSnapshot's
        metrics field)
}

AnticipatoryAlert {
  id (uuid, pk)
  node_id (fk → Node)
  cell_id (fk → Cell, nullable)
  pillar_tag (from Six Pillars enum — see docs/pillar-integration-reference-v1.0.md)
  internal_forecast_id (fk → InternalForecast, nullable)
  external_signal_id (fk → ExternalSignal, nullable)
  convergence (boolean — true if both internal_forecast_id AND
        external_signal_id are present, i.e. internal pattern and
        external signal agree)
  confidence (enum: low, medium, high — elevated automatically when
        convergence is true, per Section 4.2 logic)
  surfaced_to (fk → User, nullable — which Cell Steward or Crisis
        Coordinator this was delivered to)
  surfaced_at (timestamp, nullable)
  acknowledged_at (timestamp, nullable)
}
```

An `AnticipatoryAlert` can exist from an `InternalForecast` alone, an `ExternalSignal` alone, or both together (`convergence = true`). All three are valid — the platform does not wait for convergence to alert, but convergence changes how the alert is framed and prioritised.

### 4.2 Convergence Logic (Structured Intelligence Rule, per Mission Brief 4.3)

```
ON new ExternalSignal logged by Uhura:
  MATCH against Node.location (affected_region overlap)
  FOR each matched Node:
    CHECK for any InternalForecast for that node/cell within
      a corresponding pillar_tag, projected within a reasonably
      overlapping window
    IF InternalForecast exists:
      CREATE AnticipatoryAlert (convergence = true, confidence = high)
    ELSE:
      CREATE AnticipatoryAlert (convergence = false, confidence =
        based on ExternalSignal.severity alone)

ON new InternalForecast generated (nightly batch, per Section 5):
  CHECK for any active ExternalSignal matching this node/cell's
    pillar_tag and region
  IF ExternalSignal exists:
    CREATE AnticipatoryAlert (convergence = true, confidence = high)
  ELSE:
    CREATE AnticipatoryAlert (convergence = false, confidence =
      based on InternalForecast.confidence alone)
```

This is a transparent, inspectable rule — consistent with the platform-wide principle (Mission Brief 4.3) that Structured Intelligence is rule-based and auditable, not a black-box model decision.

### 4.3 What Convergence Changes for the Recipient

A non-convergent alert (internal pattern only, or external signal only) is delivered as a gentle, low-urgency note, per the existing intelligence principles (Mission Brief 4.5) — easily ignorable, no pressure. A convergent alert (both agree) is delivered with elevated framing — still calm, still human-voiced, but explicit that two independent sources point the same direction. Example delivery language, written for the Cell Steward to relay, not the raw system output:

*Non-convergent:* "Water listings in your cell have been trending down for two weeks. Worth keeping an eye on."

*Convergent:* "Water listings in your cell have been trending down for two weeks, and the municipality has issued a water disruption notice for your area this week. These two things together are worth raising with your community soon."

---

## 5. Internal Forecasting — O'Brien's Build Scope

### 5.1 What's Genuinely Simple to Build Now

Trend-line extrapolation over existing `Listing` and `ConnectionEvent` data — a rolling rate-of-change calculation (e.g. "Pillar 1 open Listings have decreased 40% over the past 14 days") is standard time-series work, not exotic ML. This produces `InternalForecast` rows with `confidence: low` or `medium` and is buildable with the same statistical libraries already specced (Technical Architecture Document Section 12.2 — "standard open source libraries, no proprietary ML platforms").

### 5.2 What Genuinely Needs More Sophistication Later

Producing `confidence: high` internal forecasts without external corroboration requires more rigorous seasonal/cyclical modelling (distinguishing a real depletion trend from normal weekly fluctuation) — this is a legitimate Phase 2 refinement, consistent with how `NetworkPhaseSnapshot`'s Phase 3/4 classification was staged in the Technical Architecture Document (Section 3.4a.1). MVP and early Phase 2 can reasonably rely on convergence with Uhura's external signals to raise confidence, rather than needing sophisticated internal modelling alone to reach high confidence.

### 5.3 Computation Cadence

Nightly batch job, consistent with `NetworkPhaseSnapshot`'s existing cadence pattern (Technical Architecture Document Section 3.4a) — anticipatory forecasting does not need real-time computation, and batching keeps this affordable and simple to reason about.

---

## 6. The Cascade Intelligence Architecture — Wider Signal Network

This section extends Section 3 (Uhura's Extended Mission Scope) to cover the full five-layer cascade of signals that can impact a local community — from global to provincial — and formalises how O'Brien's internal forecasting and Uhura's external scanning converge across all five layers, not just the local/operational layer originally scoped.

### 6.1 The Governing Principle

Events at higher geographic scales don't hit communities uniformly or instantaneously — they propagate downward through time and intermediary systems, often amplifying at each step. A global wheat supply shock becomes a national flour price increase becomes a provincial bakery closure becomes a Food-pillar stress event in a specific cell. The community experiences the bottom of the cascade; the platform's anticipatory intelligence exists to see the top and mid-levels, so the community has time to prepare rather than react. This is the precise mechanism by which ResilientSA becomes proactive rather than reactive — the founding intent of this entire spec.

**The wildcard problem:** some events don't cascade predictably — they punctuate. COVID-19 was a wildcard. The July 2021 unrest was a wildcard. The appropriate response to wildcards is not to predict them (this is not possible) but to build **tail-risk awareness**: recognising when multiple independent mid-level signals are simultaneously elevated, indicating conditions where the probability of a punctuating event is higher even if the specific event is unknowable. When three or more signals from different layers align in the same direction, the platform's confidence weighting elevates accordingly, consistent with Section 4.2's convergence logic.

### 6.2 The Five-Layer Signal Stack

```
LAYER 1: GLOBAL
Slow-moving, calibrating. Annual/quarterly cadence.
Sets the structural backdrop against which all lower layers
are interpreted. Changes here compound over months and years,
not days.

LAYER 2: CONTINENTAL
Seasonal/quarterly cadence. Southern African regional systems
that share conditions with South Africa's communities directly.

LAYER 3: NATIONAL (South Africa)
Weekly/monthly cadence. The most direct macro-level influence
on community-level pillars. This is where most visible cascades
originate for SA communities.

LAYER 4: PROVINCIAL
Weekly cadence. Where national conditions express themselves
in specific geographic terms relevant to actual node locations.

LAYER 5: LOCAL / COMMUNITY
Daily. The platform's own internal data — already specced in
Sections 3–5. This is where Uhura's external scan and O'Brien's
internal forecasting actually meet.
```

### 6.3 Specific Named Sources at Each Layer

These are real, publicly accessible, named sources — not vague gestures at "global data." All are currently active and accessible as of the date of this document. Uhura consumes these; O'Brien builds ingestion pipelines against those with usable APIs.

---

**Layer 1 — Global**

| Source | What It Provides | Cadence | Access |
|---|---|---|---|
| FAO Food Price Index | Global food commodity price trends — cereals, oils, dairy, meat, sugar — directly relevant to Food pillar (Pillar 2) anticipation | Monthly | Public, free download (fao.org/worldfoodsituation) |
| Fund for Peace Fragile States Index | SA's structural state stability score across 12 indicators (security, economy, public services, human rights) — the macro-level backdrop against which community resilience makes sense | Annual | Public, free (fragilestatesindex.org) |
| IMF World Economic Outlook | Global growth projections, inflation, commodity price outlooks — context for SARB and SA economic conditions | Biannual + updates | Public, free (imf.org) |
| NOAA El Niño/La Niña tracker | Pacific ocean temperature state — the single most significant global driver of Southern African drought/flood patterns | Continuous | Public, free API (ncei.noaa.gov) |

**Layer 2 — Continental (Southern Africa)**

| Source | What It Provides | Cadence | Access |
|---|---|---|---|
| SADC Climate Services Centre — SARCOF | Seasonal rainfall probability outlook for Southern Africa, covering drought/flood risk zones per region, confidence-rated | Seasonal (3-monthly) | Public, published at sadc.int and csc.sadc.int |
| SADC-CSC GitHub (sadccsc) | Scripts and data for downloading/processing seasonal forecast products programmatically | As published | Public GitHub (github.com/sadccsc) — O'Brien can build against this |
| African Development Bank — African Economic Outlook | Continental economic conditions, regional growth outlooks | Annual | Public, free |

**Layer 3 — National (South Africa)**

| Source | What It Provides | Cadence | Access |
|---|---|---|---|
| EskomSePush API | Load shedding stage (current + scheduled), area-level schedule, GPS-based area lookup — directly actionable for Energy pillar (Pillar 5) | Real-time | Paid subscription, affordable tier available (esp.info) — O'Brien automates this |
| Eskom Data Portal | Historical load shedding data, generation performance, winter/summer outlook reports | Published periodically | Public (eskom.co.za/dataportal) |
| Stats SA CPI release | Consumer price inflation, food inflation sub-index — directly relevant to Food and Energy pillar stress | Monthly | Public, free (statssa.gov.za) |
| BER Weekly Data Review | Synthesised weekly review of SA economic conditions — CPI, retail sales, Eskom outlook, PMI — with cascade analysis | Weekly | Public summary free; detailed subscriber (ber.ac.za) |
| SARB Quarterly Bulletin | Monetary conditions, commodity price index, economic growth | Quarterly | Public, free (resbank.co.za) |
| NICD Disease Outbreak Notices | National Institute for Communicable Diseases — outbreak alerts directly relevant to Health pillar (Pillar 3) | As published | Public (nicd.ac.za) |
| South African Weather Service | Weather warnings, severe weather alerts — flood, storm, drought conditions | Daily / as published | Public (weathersa.co.za); API available |

**Layer 4 — Provincial**

| Source | What It Provides | Cadence | Access |
|---|---|---|---|
| Municipal service disruption notices | Water, sanitation, electricity disruptions specific to a node's municipality — directly actionable for Water (Pillar 1) and Energy (Pillar 5) | As published | Varies by municipality — most publish via website and social media; no consistent API, requires monitoring |
| Provincial health department alerts | Disease outbreaks, health advisories at provincial level | As published | Varies by province |
| Media monitoring (regional/provincial news) | Early civil unrest signals, protest activity, service delivery protests — Safety pillar (Pillar 4) anticipation | Continuous | Public news sources; Uhura manually monitors until automated ingestion is warranted |

**Layer 5 — Local / Community**

Already specced in Sections 3–5. O'Brien's internal data layer. Not repeated here.

---

### 6.4 The Two-Speed Signal Framework

Not all signals warrant the same monitoring cadence or response urgency. This framework prevents alert fatigue by separating calibrating context from actionable intelligence.

**Slow signals — calibrating context (monthly/quarterly/annual):**
FAO Food Price Index, Fragile States Index, IMF WEO, SARB Quarterly Bulletin, SARCOF seasonal outlook, BER monthly data. These shift slowly. Uhura updates the Community Resilience Signal Watch section of `UHURA_INTEL.md` when these are released, and the platform uses them to adjust the **baseline confidence weighting** of internal forecasts — e.g. when national food inflation is running above trend, a Food-pillar depletion signal inside the platform is weighted more seriously than it would be in a low-inflation environment.

**Fast signals — actionable intelligence (daily/weekly):**
EskomSePush (real-time), SAWS weather warnings, NICD outbreak notices, municipal service disruption notices, BER weekly review, media monitoring of civil unrest signals. These can change urgently. Uhura monitors these at minimum weekly (and immediately for Critical-severity events such as Stage 6 load shedding or a declared outbreak). O'Brien automates ingestion where an API exists (EskomSePush, SAWS) and Uhura covers what requires human monitoring.

### 6.5 How Cascade Context Adjusts O'Brien's Internal Confidence

The convergence logic in Section 4.2 handles the case where Uhura's external signal and O'Brien's internal forecast align at the same layer and pillar. The cascade architecture adds a second mechanism: **baseline confidence adjustment from calibrating signals**.

When slow signals at Layers 1–3 are elevated (e.g. FAO food prices rising globally, SA CPI food sub-index above trend, national retail food sales declining), O'Brien's internal forecast model increases the weight given to Food-pillar depletion trends it observes inside the platform. This means an internal depletion trend that would normally produce `confidence: low` (insufficient internal data alone) is elevated to `confidence: medium` when the macro context corroborates it — without waiting for a specific fast-signal event to confirm.

Concretely, this is a **context modifier** stored alongside `InternalForecast` in the `basis` jsonb field (Section 4.1), recording which calibrating signals were active when the forecast was generated. This preserves auditability — future users can see not just what the forecast was, but what macro context informed its confidence level.

### 6.6 The Wildcard / Tail-Risk Protocol

For events that don't cascade predictably, the platform implements a **multi-signal convergence alert** — distinct from the pillar-specific `AnticipatoryAlert` (Section 4.1):

```
MultiSignalAlert {
  id (uuid, pk)
  node_id (fk → Node)
  signal_ids (array of ExternalSignal ids)
  convergence_count (integer — how many independent signals are
        simultaneously elevated across different layers)
  layers_represented (array — which of the five layers have an
        active elevated signal)
  severity (enum: watch, warning — elevated only when 3+ signals
        from 3+ different layers converge)
  generated_at
}
```

A `MultiSignalAlert` with `severity: warning` (3+ signals, 3+ layers) surfaces to the Regional Steward with a plain-language framing: *"Multiple independent signals are elevated across different levels this week — local, national, and global. This is a pattern worth discussing with your communities at your next check-in."* This is not a prediction of a specific event. It is an honest signal that conditions are elevated. The Regional Steward decides what, if anything, to do with it.

### 6.7 Honest Limitations

This architecture is powerful but not omniscient. The platform does not:

- Predict specific wildcard events — only recognises when conditions make them more probable
- Replace local knowledge — a Cell Steward who knows their community intimately will always notice things no signal stack can detect
- Operate in real time at full fidelity from day one — the fast-signal API integrations are buildable immediately; municipal disruption monitoring and media monitoring grow over time
- Remove the human decision — Crisis Mode activation remains a human decision regardless of what any signal or alert produces

---

## 7. What This Spec Does Not Cover

- **Automated external signal ingestion.** In MVP and early Phase 2, external signals are logged by Uhura's own scanning practice, not automatically pulled via API. Building automated ingestion pipelines is a legitimate future technical project — Uhura's manual scanning is the correct starting point given the platform has no pilot nodes yet.
- **Crisis Mode auto-activation from `AnticipatoryAlert`.** Crisis Mode activation remains a Cell Steward or Node Admin decision. A high-confidence convergent alert informs the human who decides — it never decides on their behalf. This is deliberate: automatic activation would violate the platform-wide principle that the platform facilitates what communities decide (Mission Brief 9.1).
- **The SMS/WhatsApp delivery template for `AnticipatoryAlert`** — extends the existing `NotificationLog` infrastructure (Technical Architecture Section 4.1a) but the actual message templating needs its own short addendum before O'Brien builds it.

---

## 8. Updates Required to Other Documents

- **`UHURA_INTEL.md`** — add the Community Resilience Signal Watch section per Section 3.3, and the five-layer cascade signal stack per Section 6.2 as standing monitoring scope.
- **Technical Architecture Document Section 3.4** — the `ExternalSignal`, `InternalForecast`, `AnticipatoryAlert`, and `MultiSignalAlert` entities in Sections 4.1 and 6.6 of this document should be added to the Technical Architecture's Data Model as a formal addendum.
- **Pillar Integration Reference** — Section 4 (Signal Source to Pillar Mapping) in `docs/pillar-integration-reference-v1.0.md` provides the authoritative mapping of every signal source to its pillar(s). This spec defers to that document for all pillar tag assignments.

---

*ResilientSA Anticipatory Intelligence Specification v1.0 | Bridge Document | Extends Mission Brief Sections 4.3, 7.5 | Closes Crisis Roles Framework Spec Section 7 Gap | Includes five-layer cascade architecture per Captain's direction | For Engine Room and Bridge Use*
