# SECURITY ALERTS — WORF
**Mission:** ResilientSA
**Custodian:** Worf — Security Oversight, Bridge ONLY

This directory holds one file per security finding, regardless of severity. Append-only — findings are never deleted, only marked resolved.

## Filing Convention

`WORF_ALERTS/YYYY-MM-DD-short-description.md`

## Required Fields Per Alert

```
# Alert: [short description]
**Date:** [date]
**Severity:** Critical / High / Medium / Low
**Build/Spec Reviewed:** [reference]
**Protocol Violated (if any):** [reference to CREW_MANIFEST.md Worf protocol list]

## Finding

## Captain Notified
☐ Yes — [date] / ☐ No — below threshold for immediate escalation

## Resolution
☐ Resolved — [how] / ☐ Open
```

## Escalation Threshold

Per `CREW_MANIFEST.md`: Critical or High severity findings are escalated to Captain immediately. Medium/Low findings are logged here and reviewed at the next Bridge session.

---

## Alerts on file

| Date | File | Status |
|---|---|---|
| 2026-07-02 | [`2026-07-02-order003-schema-review.md`](2026-07-02-order003-schema-review.md) | Resolved — ALL CLEAR |
| 2026-07-02 | [`2026-07-02-order004-auth-review.md`](2026-07-02-order004-auth-review.md) | Resolved — CONDITIONAL PASS |
| 2026-08-17 | [`2026-08-17-order008-hardcoded-db-url.md`](2026-08-17-order008-hardcoded-db-url.md) | Resolved 2026-09-10 — credential removed from source; inert in git history |
| 2026-09-10 | [`2026-09-10-second-hardcoded-credential-instance.md`](2026-09-10-second-hardcoded-credential-instance.md) | Resolved — scope corrected to six instances, ALL CLEAR for source |
| 2026-09-11 | [`2026-09-11-order009a-role-escalation-review.md`](2026-09-11-order009a-role-escalation-review.md) | **OPEN** — Critical (CRIT-001, platform-wide RLS) + Medium ×4 |
| 2026-09-11 | [`2026-09-11-catchall-routing-depth-failure.md`](2026-09-11-catchall-routing-depth-failure.md) | **OPEN** — **Critical.** Catch-all routes match only one segment; ORDER 007's dashboard API and ORDER 009a milestones 4–5 are unreachable in production |

*Index maintained by hand — add a row when filing a new alert. Corrected 2026-09-11: this section previously read "No alerts filed yet" while four alerts were on disk.*
