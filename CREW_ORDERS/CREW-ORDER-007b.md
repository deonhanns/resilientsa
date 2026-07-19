# CREW ORDER — 007b
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-007b
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-19
**Depends on:** CREW-ORDER-007 Session 1 ✅ (pushed)

---

## 1. STRATEGIC CONTEXT

The Express server (`server/`) runs locally but is not deployed to Vercel. Vercel only serves the React frontend. Every API call from the browser fails with "Failed to fetch" because there is no backend host. Nothing is demo-able on the Vercel preview until this is resolved — not the Trade Exchange, not the Steward Dashboard, not auth.

This order converts the Express routes to **Vercel Serverless Functions** — the correct architecture for a Vite + React app on Vercel. No separate server host needed. No new vendor. No extra cost. Vercel deploys API routes in `resilientsa-app/api/` automatically as serverless functions alongside the frontend.

This is a structural fix, not a feature. Once complete, every subsequent order's API routes are written as Vercel functions from the start.

---

## 2. MISSION OBJECTIVE

Convert all existing Express routes to Vercel Serverless Functions. The frontend `VITE_API_URL` points to `/api` (same origin — no CORS issues). The Express server becomes a local development convenience only, not the production architecture.

---

## 3. BONES BRIEF

No new human-facing UI in this order. Bones review not required.

Also completing the deferred Bones review for ORDER 007 Session 1 — O'Brien provides local screenshots of the StewardDashboard for Spock to review on the bridge.

---

## 4. WORF BRIEF

**Worf review required before merge.**

Serverless functions change the security boundary — each function is stateless and shares no memory between requests. Worf confirms:

1. `withRLSContext` still works correctly in serverless context — database connection is per-request, not pooled across requests
2. Session token validation (`requireSession`) runs correctly in each function invocation
3. No secrets are exposed in function response headers or error messages
4. `ENCRYPTION_KEY` and `DATABASE_URL` are set as Vercel environment variables — not hardcoded

---

## 5. DESIGN SYSTEM REFERENCE

Not applicable — backend restructure only.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 The Vercel Serverless Function Architecture

Vercel automatically deploys any file in `resilientsa-app/api/` as a serverless function. The file exports a default handler:

```typescript
// api/auth/request-code.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  // ... existing route logic
}
```

URL mapping is automatic:
- `api/auth/request-code.ts` → `POST /api/auth/request-code`
- `api/auth/verify-code.ts` → `POST /api/auth/verify-code`
- `api/listings/index.ts` → `GET/POST /api/listings`
- `api/listings/[id].ts` → `PATCH/DELETE /api/listings/:id`
- `api/gifts-profile/me.ts` → `GET/PUT /api/gifts-profile/me`
- etc.

### 6.2 Install Vercel Node Runtime

```bash
cd resilientsa-app
npm install @vercel/node
```

### 6.3 Update `vercel.json`

Replace the existing `vercel.json` with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 6.4 Shared Middleware — `api/_lib/`

Extract shared logic into `api/_lib/` (Vercel ignores files/folders prefixed with `_`):

```
api/
  _lib/
    db.ts          — database client (same as server/db/client.ts)
    session.ts     — requireSession logic adapted for VercelRequest
    db-context.ts  — withRLSContext (unchanged)
    crypto.ts      — phone encryption/hashing (unchanged)
    otp.ts         — OTP generation/verification (unchanged)
    at.ts          — Africa's Talking client (unchanged)
  auth/
    request-code.ts
    verify-code.ts
  gifts-profile/
    me.ts          — handles GET and PUT on same file
  listings/
    index.ts       — handles GET and POST
    [id].ts        — handles PATCH and DELETE
  matches/
    index.ts       — handles GET and POST
    [id]/
      confirm.ts
      decline.ts
  trade-completions/
    [match_id]/
      confirm-fairness.ts
  community-exchange-reference.ts
  steward/
    dashboard/
      [cell_id].ts
    isolates/
      [cell_id].ts
    hubs/
      [cell_id].ts
    network-summary/
      [cell_id].ts
    log-offline-trade.ts
```

### 6.5 Session Middleware Adapted for VercelRequest

```typescript
// api/_lib/session.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { db } from './db'
import { sessionTokens } from '../../src/db/schema/public/session-tokens'
import { users } from '../../src/db/schema/public/users'
import { eq, and, gt } from 'drizzle-orm'

export interface SessionContext {
  userId: string
  userRole: string
  nodeId: string
}

export async function getSession(req: VercelRequest): Promise<SessionContext | null> {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return null

  const [session] = await db
    .select({ userId: sessionTokens.userId, role: users.role, nodeId: users.nodeId })
    .from(sessionTokens)
    .innerJoin(users, eq(sessionTokens.userId, users.id))
    .where(and(eq(sessionTokens.token, token), gt(sessionTokens.expiresAt, new Date())))
    .limit(1)

  if (!session) return null

  return {
    userId:   session.userId,
    userRole: session.role ?? 'member',
    nodeId:   session.nodeId ?? '',
  }
}

export function unauthorized(res: VercelResponse) {
  return res.status(401).json({ error: 'Unauthorized' })
}

export function forbidden(res: VercelResponse) {
  return res.status(403).json({ error: 'Forbidden' })
}
```

### 6.6 Example Function — Auth Request Code

```typescript
// api/auth/request-code.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateCode, storeCode } from '../_lib/otp'
import { hashPhone, normalisePhone } from '../_lib/crypto'
import { sms } from '../_lib/at'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { phone_number } = req.body
  if (!phone_number) return res.status(400).json({ error: 'phone_number required' })

  const normalised = normalisePhone(phone_number)
  const phoneHash  = hashPhone(normalised)
  const code       = generateCode()

  await storeCode(phoneHash, code)

  await sms.send({
    to:      [normalised],
    message: `Your ResilientSA code is ${code}. Valid for 10 minutes.`,
    from:    process.env.AT_SENDER_ID,
  })

  return res.json({ message: 'Code sent' })
}
```

Follow the same pattern for every other route — extract the logic from `server/routes/` and wrap in a Vercel handler. The business logic is unchanged; only the request/response wrapper changes from Express to Vercel.

### 6.7 Update Frontend API Base URL

In `src/lib/api.ts`, update the base URL:

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
```

This means in production (Vercel) the frontend calls `/api/*` on the same origin — no CORS. In local development, set `VITE_API_URL=http://localhost:3001` in `.env.local` to keep using the Express server locally.

### 6.8 Keep the Express Server for Local Development

Do not delete `server/`. It remains useful for local development. Add a note to `.env.example`:

```
# Local development only — Vercel uses /api serverless functions in production
VITE_API_URL=http://localhost:3001
```

### 6.9 Vercel Environment Variables

Confirm these are set in Vercel project settings (they should already be from previous orders):
- `DATABASE_URL`
- `ENCRYPTION_KEY`
- `AT_API_KEY`
- `AT_USERNAME`
- `AT_SENDER_ID`

### 6.10 Deferred ORDER 007 Sub-Components

In the same session, build the three deferred sub-components from ORDER 007 Session 1:

**`IsolateList.tsx`** — filtered view of members with no recent ConnectionEvent. Uses `GET /api/steward/isolates/:cell_id`. Plain list, member name, last active date, "Reach out" nudge button (no action yet — Phase 2).

**`HubList.tsx`** — filtered view of high-connection-density members. Uses `GET /api/steward/hubs/:cell_id`. Shows hub member name, edge count, reciprocity flag if present.

**`LogOfflineTrade.tsx`** — simple form: select two members, select pillar, describe the trade, submit. Uses `POST /api/steward/log-offline-trade`. On success writes a `TradeCompletion` and two `ConnectionEvent` rows.

Wire all three into `StewardDashboard.tsx` as collapsible sections below the NeedsRadar.

---

## 8. MILESTONES

1. `api/auth/request-code.ts` deployed to Vercel — OTP SMS sends from Vercel preview ✅
2. `api/auth/verify-code.ts` deployed — session token returned from Vercel preview ✅
3. `api/gifts-profile/me.ts` deployed — GET/PUT work from Vercel preview ✅
4. `api/listings/index.ts` and `[id].ts` deployed — Trade Exchange loads on Vercel preview ✅
5. `api/steward/*` deployed — Steward Dashboard loads on `resilientsa.vercel.app/steward` ✅
6. `resilientsa.vercel.app` fully functional end-to-end — auth → gifts → trade → steward ✅
7. IsolateList, HubList, LogOfflineTrade built and wired into StewardDashboard ✅
8. O'Brien takes screenshots of StewardDashboard locally and shares with Spock for Bones review ✅
9. Worf sign-off ✅
10. `OBRIEN_STANDUP.md` and `CHANGELOG.md` entries committed ✅

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits `OBRIEN_STANDUP.md` and `CHANGELOG.md` entries including:
- Confirmation that `resilientsa.vercel.app` is fully functional end-to-end
- Screenshots of StewardDashboard (for Bones review on the bridge)
- Worf sign-off status
- Any deviations and why

Then Spock runs Bones verdict on the StewardDashboard screenshots. Once Bones passes, ORDER 007 is fully complete and ORDER 008 (Community Marketplace) begins.

---

## 11. SAREK ESCALATION CLAUSE

The most likely friction point is database connection behaviour in serverless context — Neon's serverless driver (`@neondatabase/serverless`) is better suited than `pg` for Vercel functions since it handles connection pooling correctly in a stateless environment. If database connection errors appear after deployment, switch `api/_lib/db.ts` to use `@neondatabase/serverless` instead of `pg`. This is a one-file change and does not affect any business logic.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-19*
