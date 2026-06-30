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

*No alerts filed yet.*
