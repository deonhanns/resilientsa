# Security Rules — ResilientSA

This is a standing rule file. It loads automatically into every session via `kilo.jsonc`. These rules act as a guardrail, not a suggestion.

## Restricted Files

Files matching these patterns contain sensitive configuration. They MUST NOT be read, printed, or included in any output, even if explicitly requested:

- `.env`
- `.env.*`
- `*secret*`
- `*credentials*`
- Any file containing `id_number`, `founding_member`, or raw PII sample data used for testing

## Data Handling Rules — Non-Negotiable

These map directly to `docs/cooperative-formation-spec-v1.0.md` Section 2 and 9, and Mission Brief Section 12.3. They are restated here because rules buried only in prose specs get missed under build pressure.

1. **PII fields are encrypted at rest, always.** This applies to any `id_number`, `address`, `full_name`, `surname`, or `email` field on a `FoundingMember` or equivalent entity. No exceptions for "just testing."

2. **Founding member data is purged on registration confirmation.** Do not build any feature that retains this data past the `registered` status transition defined in the `Cooperative` data model, unless the community has explicitly not yet confirmed registration.

3. **No individual member data crosses the node tier boundary.** Aggregate-only above the node level. This applies to Grounders, Regional Stewards, and any analytics or intelligence layer feature.

4. **Crisis mode never broadcasts identifiable vulnerability.** Any feature touching the Crisis Roster, Needs Radar, or isolation monitoring (Mission Brief Section 7.5) must route through Cell Stewards — never surface a specific person's location or need directly to anyone outside their own cell.

5. **Community health state designations are private.** Never expose a community's health state classification (Mission Brief Section 6.3) to any party outside that community's own leadership.

## If You Are Uncertain

If a build task seems to touch any of the above and you are not certain whether it's compliant, do not proceed and guess. File the question in `WORF_ALERTS/` as a finding with severity `Medium`, note it in `OBRIEN_STANDUP.md`, and continue with the parts of the task that are unambiguous. This is the correct behaviour, not a failure to complete the task.

## Severity Guide for WORF_ALERTS Filing

- **Critical** — PII actively exposed, unencrypted, or accessible beyond its authorised tier in a live or near-live build. Escalates to Captain immediately per `CREW_MANIFEST.md`.
- **High** — A design or implementation choice that would create the above if shipped, caught before merge.
- **Medium** — Uncertainty about whether a rule applies; ambiguous spec; needs Spock or Captain clarification.
- **Low** — Style/hygiene issue with no direct data exposure risk (e.g. a log statement that's overly verbose but doesn't include PII).

## Verification

You can check this file is loading correctly by being asked: "List three things you are not allowed to do in this codebase." A correct cold-start answer should include PII encryption, the no-cross-tier-data rule, and the restricted files list above.
