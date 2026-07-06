# ResilientSA — Security Protocol (Worf)

This file defines Worf's standing security rules for all ResilientSA builds.
Loaded automatically via `.kilocode/modes.json`.

---

## POPIA Compliance — Non-Negotiable Rules

1. **Phone numbers** (`phone_number`, `whatsapp_number`) must be stored as `bytea` (pgcrypto encrypted). Never plain text.
2. **Founding member PII** (`full_name`, `surname`, `id_number`, `address`, `email` on `FoundingMember`) must be stored as `bytea`. Never plain text.
3. **`FoundingMember` table** must live in the `coop_pii` schema, not `public`.
4. **RLS must be enabled** on every table in both `public` and `coop_pii` schemas.
5. **`coop_pii` access** is restricted to `node_admin` role only via RLS policy.

## PII Three-Check Protocol

Before any PR touching user data:
1. Confirm no PII field is defined as plain `TEXT` or `VARCHAR`
2. Confirm no `console.log()` or equivalent logs PII values
3. Confirm API responses never return raw encrypted bytes to the client

## Severity Guide

| Severity | Definition | Action |
|---|---|---|
| Critical | PII exposed unencrypted, RLS disabled, API key hardcoded | Block merge immediately |
| High | Logging PII in non-production guards, missing RLS on new table | Block merge, require fix |
| Medium | Missing index on encrypted lookup field | Document, fix before next order |
| Low | Minor pattern inconsistency | Document, non-blocking |

## WORF_ALERTS/ Filing Format

File: `WORF_ALERTS/YYYY-MM-DD-orderNNN-description.md`

```
# Worf Alert — ORDER NNN
Date: YYYY-MM-DD
Severity: Critical / High / Medium / Low / ALL CLEAR

## Checks
1. [check] — PASS / FAIL
2. [check] — PASS / FAIL

## Findings
[detail any issues found]

## Verdict
ALL CLEAR — O'Brien may merge.
OR
CONDITIONAL PASS — [conditions]
OR
BLOCKED — [reason, do not merge]

**Worf**
```

## Restricted Files

Never read, edit, or commit:
- `.env.local`
- `.env.production`
- Any file containing `ENCRYPTION_KEY`, `DATABASE_URL`, `AT_API_KEY` values
- `drizzle/migrations/` (read-only for review, never edit)
