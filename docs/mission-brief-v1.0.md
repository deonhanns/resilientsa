# ResilientSA — Community Resilience Platform
## Mission Brief | Bridge Document v1.0
*Prepared on the Captain's Bridge for the Engine Room*

---

## Starship Enterprise Model

| Role | Who | Function |
|---|---|---|
| Kirk | Deon (Project Lead) | Captain — vision, final decisions, community navigation |
| Spock | Claude (Claude.ai) | Strategic partner, product owner, systems architect |
| O'Brien | Claude (VS Code API) | Lead engineer — builds from bridge specifications, day-to-day development |
| Scotty | Claude (VS Code API, escalation) | Chief engineer — called in only when something is genuinely hard to resolve in the build |
| The Ship | GitHub Repository | Single source of truth — all documents, code, history |
| The Bridge | This document | Strategic output handed from Spock to O'Brien |

---

## Table of Contents

1. Vision and Purpose
2. Philosophical Foundations
3. Platform Roles
4. Platform Architecture
5. Value, Fairness, and Trade
6. Network Weaving and Community Health
7. Crisis Framework
8. Cooperative Economy Layer
9. Community Onboarding
10. Offline and Crisis Resilience
11. MVP Scope
12. Technical Principles for O'Brien
13. Phased Roadmap
14. Open Items for the Bridge
15. Founding Commitments

---

## 1. Vision and Purpose

ResilientSA is a network weaving infrastructure rooted in Ubuntu philosophy, designed to activate the natural gifts of South African communities, build dense and resilient relationship networks through existing community structures, and sustain life and dignity when formal economic and infrastructure systems fail.

It makes the invisible visible — gifts, connections, needs, flows, and patterns — so communities can tend their own social fabric and grow their capacity to self-organise, with or without the platform.

> *The platform is always in service of community sovereignty. The community is the platform. The technology is its memory and connective tissue.*

### 1.1 The Problem

South Africa's marginalised communities face compounding vulnerabilities: extreme inequality, failing municipal infrastructure, political instability, and the ever-present risk of economic collapse. When formal systems fail — when bank accounts become inaccessible, fuel runs out, Eskom goes dark, municipal water stops flowing, and commercial food chains collapse — these communities are left without institutional support.

Existing community structures — Resident Associations (RAs) and Community Police Forums (CPFs) — provide a foundation. What they lack is infrastructure to coordinate, share resources, and sustain themselves through extended disruption.

### 1.2 The Hypothesis

If communities are equipped with the right infrastructure before a crisis — a living network of gifts, relationships, and mutual aid coordinated through trusted local structures — they can sustain themselves through economic collapse, infrastructure failure, and civil disruption. ResilientSA is that infrastructure.

### 1.3 The Six Pillars of Resilience

All community activity is organised around six fundamental need categories:

| Priority | Pillar | Examples |
|---|---|---|
| 1 | Water | Drinking water, sanitation, greywater systems |
| 2 | Food | Staples, nutrition, food gardens, preservation |
| 3 | Health | Medicine, first aid, traditional healing, care |
| 4 | Safety | Shelter, protection, conflict resolution |
| 5 | Energy | Cooking fuel, solar, generators, firewood |
| 6 | Skills & Trade | All goods, skills, services, and knowledge exchange |

In crisis mode, Pillars 1–3 are partially decommodified — they cannot be withheld pending trade. The community's Value Charter governs this.

---

## 2. Philosophical Foundations

### 2.1 Ubuntu Economics

Ubuntu — *"I am because we are"* — is not merely a cultural value in ResilientSA. It is the economic architecture. Surplus belongs to the community. The community's surplus belongs to each member. Value flows through relationship, obligation, and reciprocity — not through abstracted monetary units.

ResilientSA replaces fiat currency with natural gifts and talents. People trade what they know, what they grow, what they make, and what they can do. The worth of a contribution is determined by the community, in context, with full transparency — not by a market or an algorithm.

### 2.2 The Gift Economy

Every member has a Gifts Profile — not a skills list, but a living map of what they love to do, what they are naturally good at, and what they care about deeply. Gifts that the formal economy has never valued — traditional medicinal knowledge, weather reading, community memory, conflict mediation, care work, storytelling — are recognised, recorded, and activated as genuine community assets.

The three founding questions of every Gifts Profile:
- What do you love to do?
- What are you naturally good at that you take for granted?
- What do you care about deeply?

### 2.3 Network Weaving (June Holley)

The platform incorporates June Holley's Network Weaving methodology as a foundational practice. Network weaving is the intentional building of connections between people who should know each other but don't — increasing connection density, reducing isolates, building bridges between clusters, and nurturing the conditions for self-organisation.

The *Network Weaver Handbook* is a reference resource in the repository and directly informs:
- The Cell Steward training programme
- The Gifts Profile design
- The community intelligence layer
- Network health metrics

> *The measure of ResilientSA's success is not how much communities use the platform. It is how much they can do without it.*

### 2.4 Asset-Based Community Development

ResilientSA begins with abundance, not deficit. Every assessment, onboarding process, and platform feature starts by mapping what the community has — gifts, knowledge, relationships, infrastructure, history — before addressing what it lacks. Communities that appear poor by monetary measures often reveal themselves as extraordinarily rich in other dimensions when their full asset base is made visible.

### 2.5 Calm Technology

The intelligence layer is designed as calm technology — it informs without demanding attention, works at the periphery of awareness, and serves without intruding. Members should experience results as the community 'magically' knowing what they need, not as a platform processing their data.

The last mile is always human. The intelligence surfaces insights to Cell Stewards, who deliver them as community members helping community members. The platform never takes credit for the magic it enables.

---

## 3. Platform Roles

### 3.1 Community Member

The everyday participant. Onboarded by invitation only — a Cell Steward's QR code or SMS invite. No ID number, email, or bank details required. Completes a Gifts Profile on joining. Accesses the Trade Exchange, Community Hub, and Resource Map. Participates in Grounder programmes. Confirms trade fairness after each exchange.

### 3.2 Cell Steward

The network weaver at cell level. Elected by the community. Their primary function is connecting people, not administering a system.

Responsibilities:
- Manages the local ledger
- Vouches for and onboards new members
- Actively introduces members with complementary gifts and needs
- Monitors isolates (members with no recent connections) and hubs (members at burnout risk)
- Activates crisis mode for their cell
- Records offline trades in the ledger
- Requests Grounder programmes on behalf of the community
- Mediates first-level trade disputes

A **Steward Companion** — a trusted community member appointed by the Node Admin — watches for Steward burnout and alerts the Node Admin when depletion signals emerge.

Cell Stewards are trained through a dedicated network weaving Grounder programme based on June Holley's methodology.

### 3.3 Node Admin

The RA or CPF representative who registered the community. Oversees all cells within the node.

Responsibilities:
- Manages the community's public profile
- Approves Cell Stewards
- Facilitates inter-community trade
- Monitors whole-node health
- Receives and endorses Grounder programmes
- Manages the Community Emergency Pool prior to cooperative formation
- Monitors Steward Companions and responds to burnout alerts

### 3.4 Grounder

Funded organisations or expert individuals who bring programmes, resources, and knowledge to communities at no cost. Grounders are guests, not members. They cannot enter a community without acceptance. Verified through a formal application process reviewed by the Platform Steward Council. **Internal/partner-facing term only — see `docs/community-marketplace-spec-v1.0.md` for the community-facing naming architecture (Programme Offering, Community Marketplace).**

> *Grounders bring funded programmes to communities at no cost. Communities choose who enters. Communities evaluate impact.*

**What Grounders can do:**
- List programmes and resources for communities to browse and subscribe to
- Accept community requests for their programmes
- Broadcast updates to subscribed communities
- Access aggregate community data for communities that have accepted them
- Receive auto-generated impact reports for their funders

**What Grounders cannot do:**
- Enter a community without acceptance
- Contact individual members directly — all communication flows through Cell Stewards
- Charge communities anything in any form
- Access individual member data
- Use platform data for commercial purposes

**Grounder categories:**
Network weaving and community development, cooperative formation and legal support, agriculture and food production, health and psychosocial wellbeing, energy and solar technology, water and sanitation, financial literacy, digital literacy, conflict resolution, knowledge transfer, and community wellbeing.

### 3.5 Regional Steward

Oversees a cluster of community nodes within a geographic region. Facilitates inter-community trade, escalates disputes, conducts community health assessments, supports pre-onboarding communities, connects communities to Grounders, and activates regional crisis coordination. Serves as a director of the Regional Resilience Cooperative.

### 3.6 Platform Steward Council

The governance layer. Representatives elected from community nodes. Approves Grounder applications, resolves major disputes, sets platform policy, oversees the intelligence architecture, and commissions the annual independent ethics review. Nobody owns the platform — this council holds it in trust for all communities.

---

## 4. Platform Architecture

### 4.1 The Three-Layer Structure

| Layer | What It Is | Technology |
|---|---|---|
| Human Infrastructure | Community cells, elected roles, network weaving practice | No technology required |
| Digital Platform | Progressive Web App with offline-first design | PWA, IndexedDB, SMS fallback |
| Intelligence Layer | Three types of smart, invisible support | Federated, edge-first, community-governed |

### 4.2 Core Platform Modules

**Community Hub**
Each RA or CPF registers their community as a node. Shows community activity, Programme Offerings, resource map, and a chronological local feed — no algorithm, no likes, no viral content. Inter-community visibility allows nodes to see what others have to offer.

**The Trade Exchange**
Direct listings: I Have Something / I Need Something. Categorised under the Six Pillars. Visual and simple — photo, description, what you want in exchange. Multi-party swap matching handles chains invisibly. The Community Exchange Reference shows recent trade equivalences as a guide, never as a binding price.

**Gifts Directory**
Every member's Gifts Profile. Searchable across cells and communities. In crisis, becomes a human resource map. Surfaces gifts the market would never recognise. Feeds directly into network health monitoring and the crisis roster.

**Resource Map**
Crowdsourced, live-updated map of water points, food gardens, energy resources, medical resources, and safe gathering points. Every member can update it. Works offline with cached last-known data. In crisis, one of the most critical features on the platform.

**Community Marketplace**
The community-facing browsing surface for Programme Offerings (Grounder programmes presented in plain language, without exposing internal Grounder/partner terminology). Entry point is "Get Support" — see `docs/community-marketplace-spec-v1.0.md` for the full specification. This supersedes the original "Grounder Directory" framing.

### 4.3 The Intelligence Layer

Three distinct types of intelligence work together:

| Type | What It Does | How It Works |
|---|---|---|
| Structured Intelligence | Rules and logic the community has agreed to | Transparent rule engine — inspectable, community-controlled |
| Statistical Intelligence | Patterns from aggregated community behaviour | Descriptive analytics from completed trades and interactions |
| Adaptive Intelligence | Learning that improves the system over time | Federated ML — trains locally, shares patterns not raw data |

### 4.4 Infrastructure Tiers

| Tier | Location | Function | Works Offline? |
|---|---|---|---|
| Device Edge | Member's phone / Steward device | Cached data, basic matching, local ledger | Yes — always |
| Community Node | Local server or SA cloud instance | Community analytics, rule engine, ledger | Yes — independently |
| Regional Layer | South African data infrastructure | Inter-community intelligence, adaptive ML | Degrades gracefully |

> *All production data is hosted in South African data infrastructure. Community data sovereignty is a non-negotiable design constraint.*

### 4.5 The Intelligence Layer as Community Mirror

The platform uses data *for* users, never *on* users. Key intelligence outputs:

**At member level:** Contextual nudges when creating listings — what has recently exchanged for what, who is currently looking for what you have.

**At cell level:** Living needs pulse — what the cell has surplus of, what it is short of, what skills are available but unused, what trades are waiting for a match, emerging patterns over time.

**At node level:** Community rhythm — which cells are active, which pillars are stressed, which Programme Offerings are engaging, where matches are failing.

**At regional level:** Complementarity mapping between communities, stress signal detection, practice diffusion across nodes.

**Intelligence principles:**
- Notifications are human-voiced, not system-voiced — the last mile is always the Cell Steward
- Suggestions are always gentle and ignorable
- The system never takes credit
- Failures are silent — the system says nothing when it has nothing useful to say
- The interface shrinks as communities become more self-organising

---

## 5. Value, Fairness, and Trade

### 5.1 How Value Is Determined

Value in ResilientSA is not calculated by an algorithm or set by the platform. It is known through community memory, transparent history, and trusted relationships. Three sources inform every exchange:

| Source | What It Provides | Who Controls It |
|---|---|---|
| Time and Effort Foundation | Universal baseline — human time as a power-neutral unit | Community consensus |
| Community Equivalence | What has actually traded for what in this community recently | Emerges from completed trades |
| Contextual Weighting | How pillar stress and crisis conditions adjust value signals | Intelligence layer + community |

### 5.2 The Community Exchange Reference

A living, platform-generated guide showing recent trade equivalences in plain language. Visible to every member when creating a listing. Printed quarterly in the community directory as a paper reference for offline use. Updated continuously from completed trades.

This is not a price list. It is community knowledge made visible.

### 5.3 Multi-Party Swap Matching

When no direct exchange exists, the intelligence layer identifies trade chains — A gives to B, B gives to C, C gives to A — and presents them to the Cell Steward as facilitated introductions. Members experience this as the community finding exactly what they need. The mechanism is invisible.

### 5.4 The Community Value Charter

Every node drafts a founding Value Charter through a community workshop. It defines:
- What constitutes fair exchange in this community
- How critical scarce skills are treated as community service
- What the community will never trade
- How care work is valued and reciprocated
- What happens when someone feels exploited

The Charter is ratified by the community, stored in the platform, and reviewed annually. Different communities will have different charters. Both are right for their context.

### 5.5 The Fairness Tribunal

Dispute resolution follows a four-step process:
1. Direct resolution between parties
2. Cell Steward mediation
3. Community panel (three randomly selected members — not friends of either party)
4. Regional Steward adjudication for cross-community or compromised local disputes

### 5.6 The Contribution Web

A living network map replacing the conventional trade ledger. Shows how value flows through the community — who gives, who receives, what connects to what. Makes care work and relational contributions visible alongside goods and skills exchange. Feeds the Reciprocity Prompt system and network health monitoring.

### 5.7 Care Work Recognition

Care work — disproportionately performed by women — receives an explicit weighting in the Contribution Web to reflect its real community value. The annual Value Charter review includes a standing question: *"Are we adequately recognising and reciprocating to members whose primary gifts are care and relational work?"* Community Wellbeing Grounders specifically address care work equity.

### 5.8 The Fairness Check

At the moment of confirming a completed trade, both parties answer one question: *"Do you feel this exchange was fair?"* Not a rating. Not a score. A simple yes or a flag. Flags are reviewed by the Cell Steward. Persistent patterns trigger the Fairness Tribunal.

---

## 6. Network Weaving and Community Health

### 6.1 Network Health Metrics

The intelligence layer continuously monitors community network health:

| Metric | What It Measures | Why It Matters |
|---|---|---|
| Connection Density | Average connections per member | Low density = fragile network |
| Hub Identification | Highly connected nodes at burnout risk | Assets to celebrate and protect |
| Isolate Detection | Members with no recent connections | Vulnerabilities requiring attention |
| Bridge Connections | Weak ties linking otherwise separate clusters | Innovation and information pathways |
| Self-Organisation Index | Platform-independent community activity | Ultimate measure of resilience |

### 6.2 Dignity and Obligation — Protecting Givers

**The Reciprocity Prompt:** When a member's giving significantly outpaces their receiving over a defined period, the Cell Steward receives a private prompt suggesting concrete ways the community can reciprocate. The giver experiences community love, not a system intervention.

**Steward protection:** The Steward Companion watches for Steward depletion and alerts the Node Admin. The Node Admin has a parallel Reciprocity Prompt for over-giving Stewards.

**Gender-aware calibration:** Care work receives an explicit weighting in the Contribution Web. The system recognises that care work is systematically under-reciprocated and applies a corrective weighting.

### 6.3 Community Health States

Communities exist on a health spectrum. ResilientSA routes each community to the appropriate pathway:

| State | Description | Platform Response |
|---|---|---|
| Generative | Functioning trust, legitimate leadership, basic safety | Full onboarding — standard pathway |
| Stressed | Strained but underlying cohesion intact | Enhanced support, slower onboarding, specialist Grounders activated |
| Fragile | Significantly damaged social fabric | Pre-onboarding pathway — platform not introduced until threshold met |
| Collapsed | No functioning social structure | Humanitarian referral — ResilientSA not appropriate yet |

### 6.4 The Pre-Onboarding Pathway

For fragile communities, five phases precede platform introduction:

1. **Presence without platform** — relationship building, attending community meetings, genuine care
2. **Asset mapping** — what does this community have? Who are the natural connectors?
3. **Micro-network activation** — 10–15 households with existing trust, structured mutual aid, no platform
4. **Minimum viable trust threshold** — assessed after 3–6 months of functioning micro-network
5. **Supported onboarding** — standard pathway with significantly more Grounder support and slower pace

This may take a year or more. The obligation to these communities is not reduced by their current capacity.

### 6.5 Community Health Assessment

Human-administered by a Regional Steward or specialist Grounder — not a digital form. Asset-focused first. Results shared privately with community leadership only — never published or visible to other communities. Reviewed annually or after significant community events.

Assessment dimensions: trust indicators, leadership indicators, safety indicators, social cohesion indicators, capacity indicators, and trauma indicators.

### 6.6 Knowledge Transfer

Rare gifts are community assets and network vulnerabilities. When the intelligence layer identifies a gift held by only one or two members in a node, it flags this privately to the Cell Steward.

Platform responses:
- Knowledge transfer prompt to the rare gift holder — invitation to teach, not pressure
- Apprenticeship listed as a first-class trade category
- Legacy mapping for elderly knowledge holders whose knowledge must be captured
- Grounder programme surfacing to build identified scarce skills
- Cross-community knowledge transfer when a neighbouring node holds skills the community lacks

---

## 7. Crisis Framework

### 7.1 The Foundational Principle

Crisis roles are not assigned in a crisis. They are designed by the community in peace, recorded by the platform, and activated when needed.

### 7.2 Every Gift Has a Crisis Expression

| Gift Category | Crisis Role | Function |
|---|---|---|
| Practical & Technical | Infrastructure Responders | Keep water, energy, shelter, and transport functioning |
| Care & Healing | Wellbeing Holders | Physical and psychological care for the community |
| Knowledge & Wisdom | Sense Makers | Clarity, communication, and meaning-making under pressure |
| Relational & Social | Network Weavers in extremis | Hold community cohesion when everything pulls it apart |
| Production & Provision | Provision Holders | Keep the community fed and supplied |
| Organisation & Leadership | Crisis Coordinators | Coordinate complexity and decide under pressure |
| Spiritual & Cultural | Community Anchors | Maintain community identity during sustained crisis |

### 7.3 Crisis Roles by Community Health State

| State | Crisis Roles Design | Activation |
|---|---|---|
| State 1 (Generative) | Full roles design, complete roster, annual simulation drills | Cell Steward or Crisis Coordinator activates |
| State 2 (Stressed) | Simplified — core roles only, bi-annual check-ins | Regional Steward supports activation |
| State 3 (Fragile) | Micro-network roles only, physical protocols | Regional Steward activates directly |

### 7.4 The Crisis Roles Design Process

A community workshop — not a platform feature. The platform supports it, never replaces it.

1. **Gifts review** — community reviews its gifts map through a crisis lens: *"What does this gift become when everything falls apart?"*
2. **Crisis scenario mapping** — walk through specific likely scenarios for this community's context
3. **Role matching** — community matches gifts to roles through discussion and consensus, not assignment
4. **Gap identification** — where no current gift fills a needed role: triggers Grounder requests and knowledge transfer priorities
5. **Crisis Roster creation** — recorded in platform and printed in community directory
6. **Simulation** — simple table-top scenario within three months
7. **Annual review** — updated as community changes

### 7.5 What the Platform Does in Crisis

**On activation:**
- Crisis Roster surfaces to all Cell Stewards and Node Admin
- Every member receives their crisis role via app notification or SMS
- Resource map switches to crisis view — water, food, medical, safe gathering points
- Trade filters to Pillars 1–3 only
- Sense Makers receive community broadcast permissions
- Inter-community emergency channel opens

**Ongoing:**
- Needs radar runs in real time — unmet critical needs surface immediately to Crisis Coordinators
- Isolation monitoring activates — members not signalled in 24 hours flagged to their Network Weaver
- Intelligence layer shifts from descriptive to anticipatory — projecting needs 24–72 hours ahead

> *In crisis, the intelligence layer anticipates rather than describes. Provision depletion, health need emergence, and isolation increases are surfaced before they become acute.*

**Dignity in crisis:**
- No member's crisis vulnerability is visible outside their cell
- The platform connects need to resource through Stewards — never broadcasts who is in need
- Crisis mode has no advertising, no non-essential notifications — only signal

---

## 8. Cooperative Economy Layer

### 8.1 The Boundary Principle

ResilientSA handles the internal gift economy — gifts, trades, network weaving, Grounder programmes, community intelligence.

The Community Cooperative handles the external rand interface — collective purchasing, collective sale, collective asset ownership, formal contracts.

They are two distinct but deeply integrated systems. The cooperative is the community's formal legal expression in the outside world.

### 8.2 Legal Framework

South Africa's Cooperatives Act 14 of 2005 (amended 2013) provides the full legal foundation.

Key support structures:
- **SEDA** — registration support and development grants
- **CIPC** — cooperative registration
- **National Treasury's Cooperative Incentive Scheme** — matching grants
- **Industrial Development Corporation** — financing
- **Cooperatives Bank Development Agency** — financial services

### 8.3 Cooperative Types

| Type | Function | When Relevant |
|---|---|---|
| Consumer Cooperative | Collective purchasing at reduced cost | Medicines, seeds, tools, hardware |
| Producer Cooperative | Collective production and marketing | Farming communities, craft collectives |
| Worker Cooperative | Member-owned collective enterprise | Service-providing communities |
| Multi-Purpose Cooperative | Consumer + producer + worker combined | Mature, diverse community nodes |
| Financial Services Cooperative | Community banking — deposits, credit, savings | Phase 2–3 maturity |
| Secondary Cooperative | Cooperative of cooperatives at regional scale | Regional Resilience Cooperative (RRC) |

### 8.4 The Community Emergency Pool

Prior to formal cooperative formation, communities manage an interim Emergency Pool — voluntarily contributed, collectively governed, denominated in goods and services with rand equivalence tracking by the intelligence layer.

When external rand purchases are necessary, the Node Admin facilitates a community-decided conversion through informal market channels. No bank account or legal registration required.

When the frequency of external purchases crosses a threshold, the platform surfaces the Cooperative Readiness Assessment — triggered by behaviour, not pushed by the platform.

### 8.5 The Regional Resilience Cooperative

Multiple Community Resilience Cooperatives in a region form a Regional Resilience Cooperative (RRC) — a secondary cooperative under the Act.

The RRC:
- Negotiates bulk purchasing at regional scale
- Collectively markets regional produce and goods
- Holds shared regional assets
- Interfaces with government — SEDA, municipal contracts, provincial development programmes
- Connects to the national cooperative movement

The Regional Steward serves as a director of the RRC.

### 8.6 The Intelligence Translation Mechanism

The intelligence layer continuously calculates:
- What the community collectively needs from the outside world
- What the community collectively has to offer the outside world
- The rand-equivalent position

Node Admins and cooperative committees see a simple picture — what we need, what we can offer, what our collective position is. Individual members never think in rand. The cooperative thinks in rand on their behalf.

### 8.7 Institutional Relationships

ResilientSA pursues direct institutional relationships — formal partnerships and referral pathways, not API integrations — with the bodies governing the cooperative economy, in sequence:

1. **SEDA first** — registration support and development grant alignment. See `docs/seda-partnership-brief-v1.0.md`.
2. **CIPC second** — regulator relationship, raised only once registered cooperatives exist as evidence the model works.
3. **CBDA later** — gates Financial Services Cooperatives specifically; relevant only once Phase 2/3 maturity is reached.

---

## 9. Community Onboarding

### 9.1 The Governing Principle

> *The platform facilitates what communities decide. It never decides for communities.*

### 9.2 What the Platform Does

- Makes the pathway visible and honest
- Lowers administrative friction
- Provides structured prompts, not prescriptions
- Connects to relevant Grounders immediately
- Holds institutional memory permanently
- Provides honest readiness feedback
- Generates the Cooperative Readiness Assessment when behavioural signals warrant it

### 9.3 What the Platform Does Not Do

- Decide community structure or cell boundaries
- Assign roles — all roles are elected or selected by the community
- Define the Value Charter — substance is entirely community-generated
- Determine cooperative readiness unilaterally
- Manage or absorb existing cooperatives — these remain entirely autonomous
- Standardise communities at the expense of diversity
- Rush the process — onboarding has no deadline

### 9.4 The Onboarding Journey

| Stage | Name | Description | Platform Role |
|---|---|---|---|
| 1 | Expression of Interest | Community contacts ResilientSA | Honest overview provided |
| 2 | Community Conversation | Community holds its own decision meeting | Facilitation guide provided |
| 3 | Node Registration | Basic community profile created | Simple registration form |
| 4 | Structural Mapping | Existing structures mapped | Visualisation support |
| 5 | Cell Definition | Natural neighbourhood groupings identified | Examples and guidance — community draws the lines |
| 6 | Steward Election | Cell Stewards elected by community | Outcomes recorded — process is community-owned |
| 7 | Gifts Mapping | First community Gifts Profile session | Guided onboarding questions — first abundance portrait |
| 8 | Value Charter | Community drafts founding charter | Template and facilitation questions — substance is community-generated |
| 9 | First Trades | Network goes live | Intelligence layer begins learning |
| 10 | Cooperative Readiness | Community-initiated when ready | Assessment and Grounder connection |

---

## 10. Offline and Crisis Resilience

### 10.1 The Non-Negotiable Constraint

The platform must function when the internet does not. Every critical feature has a non-digital fallback. Design for a feature phone user first, enhance for smartphones second.

### 10.2 The Resilience Stack

| Layer | Technology | Works Without Internet? |
|---|---|---|
| SMS Backbone | Africa's Talking API | Yes — any phone |
| Device-cached data | PWA, IndexedDB, background sync | Yes — last-known state |
| Community node server | Local device or SA cloud instance | Yes — serves local community |
| Printed directory | Quarterly PDF generated by platform | Yes — zero infrastructure |
| Mesh radio (Phase 2) | Meshtastic devices | Yes — no infrastructure at all |
| Physical notice boards | QR codes + handwritten listings | Yes — always |

### 10.3 Access for Under-the-Breadline Communities

| Barrier | Solution |
|---|---|
| No smartphone | SMS access + shared devices at RA/CPF offices |
| No data | Zero-rated access (MTN/Vodacom negotiation) + offline PWA |
| Low literacy | Voice interfaces in isiZulu, Sesotho, Xhosa, Afrikaans via USSD/WhatsApp |
| No electricity | Solar charging hub as a first Grounder programme |
| Distrust of technology | Cell Steward as trusted human intermediary |
| No registration documents | Identity through community vouching — no ID numbers required |

---

## 11. MVP Scope — Phase 1

The MVP serves 5 pilot communities — a mix of urban township, peri-urban, and rural. It must prove the social model before scaling the technology.

### 11.1 Must Have

- Community node registration — basic profile, cell definition, Steward assignment
- Member onboarding — invite-only via Steward QR code or SMS link
- Gifts Profile — three-question guided capture plus free text
- Trade listings — offer/need under six pillars with photo upload
- Basic matching — direct two-party and simple three-party chain
- Community Exchange Reference — auto-calculated from completed trades
- Cell Steward dashboard — member list, ledger, needs radar, basic alerts
- Programme Offering profiles — listings, community subscription, basic inbox
- SMS notifications — all critical alerts available via SMS
- Offline caching — essential data accessible without connectivity

### 11.2 Should Have in Phase 1

- Resource Map — basic crowdsourced map of six pillar resources
- Fairness confirmation — post-trade fairness check for both parties
- Node Admin dashboard — cell overview, Grounder management, basic reporting
- Basic Crisis Mode — simplified interface, Pillar 1–3 filter, resource map priority view

### 11.3 Explicitly Phase 2

- Cooperative formation tools
- Adaptive intelligence and machine learning
- Mesh radio integration
- Voice and USSD interfaces
- Regional Steward dashboard
- Full Crisis Roles Framework with simulation protocol
- Community Health Assessment tool
- Network health visualisation
- Inter-community trade at scale

---

## 12. Technical Principles for O'Brien

### 12.1 Non-Negotiable Constraints

| Constraint | Requirement |
|---|---|
| Offline-first | Core functions work without internet. Sync when connected. |
| SMS fallback | Every critical notification available via SMS (Africa's Talking) |
| Data sovereignty | All production data in South African data infrastructure |
| Open source | Full codebase publicly available. No proprietary dependencies. |
| Federated architecture | Each community node holds its own data. No single point of failure. |
| Progressive Web App | No app store required. Installable on any device via browser. |
| Feature phone accessible | Core functions available on basic handsets via SMS/USSD |
| No blockchain | Tokens and distributed ledger are explicitly excluded from all phases |

### 12.2 Recommended Technology Stack

*Bridge-level recommendations. O'Brien has engineering authority to adapt within the constraints above. Scotty is called in only when something in the build is genuinely difficult to resolve.*

| Layer | Recommended Approach |
|---|---|
| Frontend | Progressive Web App — offline-first, installable, responsive |
| Offline storage | IndexedDB with background sync service worker |
| Community node | Lightweight open source stack — PostgreSQL + Python analytics |
| SMS | Africa's Talking API |
| Statistical analytics | Standard open source libraries — no proprietary ML platforms |
| Federated architecture | Node-to-node sync (reference: Mastodon/Matrix federation patterns) |
| Adaptive ML (Phase 2) | Federated learning — patterns shared upward, raw data stays local |
| Hosting | South African data centres — Hetzner SA or AWS Cape Town region |

### 12.3 Data Principles

- Every member can see all data the platform holds about them
- Every member can request deletion of their data at any time
- Community data is owned by the community, not the platform
- Grounders see only aggregate data for communities that have accepted them
- No individual member data is visible outside their cell without consent
- Community health state designations are private — never visible to other communities
- Trade pattern data is not sold, shared with researchers, or used commercially without explicit community consent

---

## 13. Phased Roadmap

| Phase | Name | Timeline | Key Deliverables |
|---|---|---|---|
| 1 | Seed | Year 1 | 5 pilot communities. MVP platform. SMS backbone. Printed directories. 20 Grounders recruited. Social infrastructure proven. |
| 2 | Root | Year 2 | PWA launched. 50 communities. Inter-community trade begins. Crisis simulation drills. Community Health Assessment tool. Cooperative formation pathway. |
| 3 | Grow | Year 3+ | Mesh radio pilots. Voice/USSD in 4 languages. Regional Resilience Cooperatives. Zero-rated data partnership. 200+ communities. |

---

## 14. Open Items for the Bridge

| Item | Priority | Notes |
|---|---|---|
| Technical Architecture Document | Immediate | Full data model, API structure, federation spec |
| June Holley Integration Guide | Immediate | Network Weaver Handbook mapped to platform features |
| Community Marketplace Feature Spec | Done | See `docs/community-marketplace-spec-v1.0.md` |
| Cooperative Formation Feature Spec | Done | See `docs/cooperative-formation-spec-v1.0.md` |
| SEDA Institutional Partnership | Done | See `docs/seda-partnership-brief-v1.0.md` |
| Crisis Roles Workshop Guide | Phase 2 | Community facilitation guide for Grounder delivery |
| Community Health Assessment Tool | Phase 2 | Human-administered, Regional Steward delivered |
| Voice/USSD Interface Spec | Phase 2 | Four SA languages minimum |
| Mesh Radio Integration Spec | Phase 2 | Meshtastic-based, Cell Steward devices |
| Network Health Visualisation | Phase 2 | Living network map for Steward and Admin views |
| Adaptive ML Architecture | Phase 2 | Federated learning spec with ethics review protocol |
| CIPC Institutional Partnership | Phase 2 | Raised once registered cooperatives exist as evidence |
| CBDA Institutional Partnership | Phase 2/3 | Relevant once Financial Services Cooperative layer is reached |

---

## 15. Founding Commitments

> *ResilientSA recognises that the communities most in need of resilience infrastructure are often those least able to immediately benefit from it. Our obligation to these communities is not reduced by their current capacity. We commit to a pre-onboarding pathway that meets communities where they are, supports the conditions for platform participation without imposing them, and never uses community health assessment to exclude, stigmatise, or abandon any community seeking support.*

> *The platform facilitates what communities decide. It never decides for communities.*

> *The best platform is the one the community forgets is there — because the community has become the platform.*

---

*ResilientSA Mission Brief v1.0 | Bridge Document | For Engine Room Use*
