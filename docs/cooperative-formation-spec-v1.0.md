# ResilientSA — Cooperative Formation Feature Specification
## Bridge Document | Version 1.0
*Extends Section 8 (Cooperative Economy Layer) of the Mission Brief*

---

## 1. Purpose and Scope

This feature empowers a mature community node to form a legally registered **Community Resilience Cooperative (CRC)** under South Africa's Cooperatives Act 14 of 2005, without requiring legal expertise, without cost, and without leaving the trust structure of ResilientSA.

It does **not** integrate directly with CIPC. No public API for cooperative registration exists. CIPC operates a web portal for human filers requiring real-time Home Affairs identity verification, OTP-based authentication per individual, and certified document uploads — none of which can be automated or bypassed by a third-party system. This feature is therefore an **assisted filing tool**: it prepares everything a community needs to file correctly and quickly through CIPC's existing e-Services portal, and tracks progress once filed.

---

## 2. The Honest Boundary

| What ResilientSA Does | What ResilientSA Does Not Do |
|---|---|
| Assesses cooperative readiness | Approve or register the cooperative |
| Collects and validates member information | Verify identity against Home Affairs |
| Generates the constitution from model templates | Submit documents to CIPC automatically |
| Generates a completed Co-op1 form | Pay CIPC fees on the community's behalf |
| Produces a document checklist and package | Guarantee approval or timeline |
| Tracks status as the community updates it | Receive automated status updates from CIPC |
| Connects communities to registration Grounders | Replace the need for a human filer |

This boundary must be stated plainly to users at the start of the flow so expectations are accurate from the outset.

---

## 3. Entry Point: The Cooperative Readiness Assessment

Not a gate — a mirror. Available to any Node Admin at any time, but only surfaced proactively when behavioural signals suggest readiness (see Mission Brief 8.4 — frequent Community Emergency Pool conversions).

### Readiness Signals Displayed
- Months of active trade history in the node
- Number of active members
- Frequency and volume of Community Emergency Pool conversions (external rand purchases)
- Number of completed inter-community trades
- Whether a Value Charter has been ratified
- Whether Cell Stewards are established and stable

### Output
A plain-language readiness summary, e.g.:

> "Your community has been trading for 14 months with 62 active members. You've converted pool resources to rand 9 times in the past quarter, mostly for medicine and seeds. This pattern suggests a cooperative could give you better collective buying power. This is not a requirement — only a reflection of what we're seeing."

The community decides whether to proceed. No score, no pass/fail.

---

## 4. The Cooperative Type Selector

Based on CIPC's existing model constitutions, the wizard presents five options in plain language (not legal jargon):

| Model Constitution | ResilientSA Plain-Language Framing |
|---|---|
| Non-specific (General) | "We do a mix of things and don't fit one category" |
| Agricultural | "We mainly grow, farm, or produce food" |
| Social | "We mainly provide care, support, or community services" |
| Worker | "We are owned and run by the people who work in it" |
| Housing | "We manage or develop shared housing" |

Financial Services Cooperatives are **not offered** in this flow — flagged separately as a Phase 2/3 pathway requiring CBDA pre-approval before any CIPC involvement, consistent with the legal requirement that these cannot use the standard e-Services route at all.

The community's existing trade pillar data (which pillars dominate their activity) pre-suggests a likely type, but the community makes the final choice.

---

## 5. The Formation Wizard — Step by Step

### Step 1 — Formation Meeting Record
Communities must legally hold a formation meeting before registering. The wizard provides:
- A meeting agenda template
- A simple digital or printable attendance/resolution record
- Guidance on minimum founding member count (per the Act and model constitution chosen)

This step produces no CIPC document but is retained as the community's own record and referenced later.

### Step 2 — Founding Member Collection
For each founding member, the wizard collects:
- Full legal name and surname
- Physical address
- South African ID number (green bar-coded/smart ID — the wizard explicitly warns that passports are only accepted for non-resident foreign nationals, matching CIPC's requirement)
- Contact email (required individually per member, since CIPC sends OTPs and notifications to each member separately)
- Role (director nomination, if applicable)

**Privacy note:** This data is sensitive. It is stored only within the community's node-level data tier (per the federated architecture in the Mission Brief), never synced to the regional or platform layer, and is purged from ResilientSA once the community confirms successful CIPC registration — the legal record of truth becomes CIPC's own register, not ResilientSA's.

### Step 3 — Director Nomination
Per CIPC's CR2 form requirements, the wizard:
- Displays the minimum/maximum director count required by the chosen model constitution
- Lets the community nominate directors from the founding member list
- Generates the CR2 (List of Directors) document

### Step 4 — Constitution Generation
The wizard pre-fills the relevant CIPC model constitution (Non-specific, Agricultural, Social, Worker, or Housing) with:
- Cooperative name (subject to the Act's naming rule — must include "Co-operative," "Co-op," or end in "Limited"/"Ltd")
- Registered address (the community node's location)
- Founding member list
- Director list
- Object of the cooperative (drawn from the community's stated purpose — auto-suggested from their dominant trade pillars, editable)

Output: a complete, downloadable constitution document formatted to CIPC's requirements, ready for printing and physical signature by all founding members.

### Step 5 — Co-op1 Form Generation
The wizard auto-populates the Co-op1 form from data already collected in Steps 1–4, minimising re-entry. Output is a print-ready PDF requiring only physical signatures.

### Step 6 — Document Package and Checklist
A single downloadable package containing:
- Signed-page-ready Co-op1 form
- Generated constitution
- CR2 List of Directors
- A checklist of supporting items the community must gather themselves (certified ID copies for every founding member — explicitly flagged as something ResilientSA cannot certify or provide)
- Plain-language instructions for accessing CIPC's e-Services portal and creating a customer code, since this is a prerequisite the community must complete independently

### Step 7 — Filing Support
Three options presented to the community:
1. **Self-file** — the Node Admin or a designated member uses the generated package to file directly via CIPC e-Services
2. **Request a Cooperative Formation Grounder** — connects the community to a verified Grounder (legal practitioner, cooperative development consultant, or organisation like SEDA's cooperative support programme) who files on their behalf at no cost to the community, consistent with the Grounder model
3. **Defer** — save the package and readiness state for later; no expiry, no pressure

---

## 6. The Status Tracker

Because no CIPC API exists, status updates are **community-reported**, not automated. The tracker is intentionally simple:

| Status | Who Updates It | What It Means |
|---|---|---|
| Preparing | Auto-set when wizard begins | Documents being assembled |
| Documents Ready | Auto-set at Step 6 completion | Package generated, awaiting filing |
| Submitted to CIPC | Node Admin marks manually | Filed via e-Services or through a Grounder |
| Name Reserved | Node Admin marks manually | CIPC has reserved the cooperative name |
| Under CIPC Review | Node Admin marks manually | Awaiting CIPC back-office approval |
| Registered | Node Admin marks manually, registration number entered | Cooperative is legally formed |
| Returned / Needs Correction | Node Admin marks manually | CIPC requested changes — wizard reopens to the relevant step |

Once "Registered" is confirmed and a registration number is entered, the **Community Resilience Cooperative profile** activates on the platform (per Mission Brief Section 8), and the cooperative governance, collective purchasing, and Regional Resilience Cooperative features unlock.

---

## 7. The Cooperative Formation Grounder Category

A new, explicit Grounder subcategory:

**Cooperative Formation Grounders** — legal practitioners, cooperative development consultants, or organisations (SEDA cooperative support, university legal clinics, NGO legal aid programmes) verified by the Platform Steward Council specifically to assist communities through CIPC filing at no cost.

Their platform responsibilities:
- Receive formation requests from communities who choose "Request a Grounder" in Step 7
- File on the community's behalf using the generated document package
- Update the community's status tracker on their behalf (with the community's knowledge and consent)
- Cannot charge any fee — consistent with the platform-wide Grounder commitment

This is the realistic answer to "how does a community without legal access actually get registered" — solved through the existing trust network rather than through automation that doesn't exist.

---

## 8. UX Notes

- The entire flow must work for a Node Admin with no legal background. Every CIPC term (Co-op1, CR2, model constitution) is translated to plain language first, with the official term shown in smaller text alongside for when it's needed at the CIPC portal.
- Print-friendliness is mandatory — physical signatures are required by law, and many Node Admins will be working with limited connectivity.
- The flow must be interruptible and resumable at any step without data loss, given that founding member collection (Step 2) may take weeks to gather from busy community members.
- No dark patterns, no urgency messaging. This mirrors the platform-wide onboarding principle: the platform facilitates what communities decide, at the pace communities choose.

---

## 9. Data Model Additions (for O'Brien)

New entities required at the community node tier:

```
Cooperative {
  node_id
  cooperative_type (enum: general, agricultural, social, worker, housing)
  status (enum: preparing, documents_ready, submitted, name_reserved,
          under_review, registered, returned)
  registration_number (nullable, populated on registered status)
  registered_name
  formation_meeting_date
  constitution_document_id
  coop1_document_id
  cr2_document_id
}

FoundingMember {
  cooperative_id
  full_name
  surname
  address
  id_number (encrypted at rest, purged on registration confirmation)
  email
  is_director (boolean)
}

CooperativeStatusEvent {
  cooperative_id
  status
  updated_by (user_id)
  updated_at
  notes (free text, optional)
}
```

All `FoundingMember` PII fields are subject to the platform-wide data principle: stored only at the community node tier, never synced upward, and purged once the cooperative reaches `registered` status or the community explicitly cancels formation.

---

## 10. What This Unlocks (Phase 2 dependency)

Once a cooperative reaches `registered` status, the following Mission Brief features activate:
- Community Resilience Cooperative profile and governance tools (Section 8.3)
- Collective purchasing and sale coordination
- Eligibility to join or form a Regional Resilience Cooperative (Section 8.5)
- The intelligence layer's rand-equivalent translation mechanism becomes fully operational for that node (Section 8.6)

---

## 11. Open Question for the Bridge — RESOLVED

Should ResilientSA pursue a direct relationship with SEDA or CIPC (not an API, but a formal partnership)?

**Decision: Yes.** ResilientSA will pursue direct institutional relationships with SEDA first, CIPC second, and CBDA later — formal partnerships and referral pathways, not API integrations. See `docs/seda-partnership-brief-v1.0.md` for the SEDA institutional one-pager.

---

*ResilientSA Cooperative Formation Feature Spec v1.0 | Bridge Document | Extends Mission Brief Section 8 | For Engine Room Use*
