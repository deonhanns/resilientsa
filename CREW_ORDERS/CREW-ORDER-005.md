# CREW ORDER — 005
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-005
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-03
**Depends on:** CREW-ORDER-004 ✅ COMPLETE

---

## 1. STRATEGIC CONTEXT

Authentication is live. A member can join their community and receive a session token. ORDER 005 builds the Gifts Profile — the first thing a member does after joining, and the foundation of everything the intelligence layer does later.

Per the June Holley Integration Guide (`docs/june-holley-integration-guide-v1.0.md` Section 3.2), gifts mapping is not a data entry task — it is a network activity. The platform requirement is explicit: on completion of a Gifts Profile, the Cell Steward must receive a contextual nudge if complementary gifts exist in the cell. The first experience of submitting a Gifts Profile must feel like a connection being made, not a form being filed.

**Inherited technical flag from ORDER 004:** The `SET LOCAL app.current_node_id` / `app.current_role` RLS context is not yet enforced at the database connection level — O'Brien noted this and deferred correctly. ORDER 005 resolves this by implementing a proper transaction-scoped connection helper that sets the RLS context before any query runs. This must be in place before ORDER 006 (Trade Exchange), where real multi-tenant data isolation is needed. Do not defer again.

---

## 2. MISSION OBJECTIVE

Build the Gifts Profile API endpoints, the three-question guided capture UI, and the Cell Steward notification that fires on profile completion when complementary gifts exist. Resolve the RLS connection context gap inherited from ORDER 004.

---

## 3. BONES BRIEF

**Bones review required** — the Gifts Profile is the first community member experience after auth, and the most philosophically important screen on the platform. It must feel like a conversation, not a form.

**What is being reviewed:** The three-question Gifts Profile capture screen.

**Who will encounter this:** A community member who has just joined. This is their second interaction with the platform. They are on their phone. They may have low literacy. They have never heard the word "Gifts Profile."

**Context of encounter:** Immediately after auth, the platform asks them three questions about themselves. This should feel like being welcomed into a community, not filling in a form.

**Emotional target:** "Someone is actually interested in what I can do." Not "I have to complete my profile."

**Anti-patterns to avoid:**
- The word "profile" anywhere on screen — this is not LinkedIn
- The word "gifts" used as a noun without context — say "what you're good at", not "your gifts"
- More than one question visible at a time — reveal questions sequentially, not as a list
- A progress bar that frames this as a task to complete
- Any hint that this is mandatory — it should feel like an invitation

**The three questions (each on its own screen or revealed step by step):**
1. "What do you love to do?" — subtext: "Even if no one pays you for it."
2. "What are you naturally good at?" — subtext: "What do people come to you for?"
3. "What do you care about most in your community?" — subtext: "What would you change if you could?"

**Completion state:** After the third answer, show a warm confirmation — not "Profile complete!" but something like "Thank you. We'll help connect you with people who need exactly what you have." Then route to the Trade Exchange.

**Brand references:** Living Soil palette. Canvas Grey background. Baobab Bark text. Fynbos Aloe primary action. Ubuntu heading. Inter body. Single large, open text input per step — not a multi-field form.

**Language:** All copy externalised to `en.json` and `af.json`. Bones reviews both.

---

## 4. WORF BRIEF

No PII in this order beyond what is already encrypted. The Gifts Profile data (loves_to_do, naturally_good_at, cares_about, free_text_gifts) is sensitive community data but not legally PII under POPIA — it is stored as plain text and is not subject to the bytea encryption requirement. Worf review is not required for this order, but O'Brien should confirm no accidental plaintext logging of user-identifiable data in the gifts profile submission path.

---

## 5. DESIGN SYSTEM REFERENCE

`design/prototype-v1/` — Living Soil Design System. The Gifts Profile screen is not in the ORDER 001 prototype. O'Brien builds from the Bones Brief above. Bones reviews before merge.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Resolve the RLS Connection Context Gap (from ORDER 004)

The `requireSession` middleware currently attaches `userId`, `userRole`, and `nodeId` to the request object but does NOT set the PostgreSQL session-level RLS variables (`app.current_node_id`, `app.current_role`) on the actual database connection used by Drizzle queries. This means RLS policies exist but are not being enforced. Fix this now, before any data API routes are built.

Create a connection helper that wraps every database operation in a transaction with the correct RLS context:

```typescript
// server/lib/db-context.ts
import { db } from '../../src/db/client'
import { sql } from 'drizzle-orm'

export async function withRLSContext<T>(
  nodeId: string,
  role: string,
  fn: () => Promise<T>
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_node_id = ${nodeId}`)
    await tx.execute(sql`SET LOCAL app.current_role = ${role}`)
    return fn()
  })
}
```

Update `requireSession` middleware to make `withRLSContext` available on the request, and update the auth routes to use it. Every data route from ORDER 005 onward must wrap its database calls in `withRLSContext(req.nodeId, req.userRole, ...)`. Do not skip this for ORDER 005 even though gifts profiles are per-user — it establishes the correct pattern for all subsequent orders.

### 6.2 Backend — API Routes

Add to `server/routes/gifts.ts`:

```typescript
import { Router } from 'express'
import { requireSession } from '../middleware/session'
import { db } from '../../src/db/client'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { users } from '../../src/db/schema/public/users'
import { cells } from '../../src/db/schema/public/cells'
import { eq } from 'drizzle-orm'
import { withRLSContext } from '../lib/db-context'

const router = Router()

// GET /gifts-profile/me
router.get('/me', requireSession, async (req, res) => {
  const profile = await withRLSContext(req.nodeId, req.userRole, () =>
    db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, req.userId)).limit(1)
  )
  res.json(profile[0] ?? null)
})

// PUT /gifts-profile/me
router.put('/me', requireSession, async (req, res) => {
  const { loves_to_do, naturally_good_at, cares_about, free_text_gifts } = req.body

  const existing = await withRLSContext(req.nodeId, req.userRole, () =>
    db.select().from(giftsProfiles).where(eq(giftsProfiles.userId, req.userId)).limit(1)
  )

  let profile
  if (existing.length > 0) {
    ;[profile] = await withRLSContext(req.nodeId, req.userRole, () =>
      db
        .update(giftsProfiles)
        .set({ lovesToDo: loves_to_do, naturallyGoodAt: naturally_good_at, caresAbout: cares_about, freeTextGifts: free_text_gifts, updatedAt: new Date() })
        .where(eq(giftsProfiles.userId, req.userId))
        .returning()
    )
  } else {
    ;[profile] = await withRLSContext(req.nodeId, req.userRole, () =>
      db
        .insert(giftsProfiles)
        .values({ userId: req.userId, lovesToDo: loves_to_do, naturallyGoodAt: naturally_good_at, caresAbout: cares_about, freeTextGifts: free_text_gifts })
        .returning()
    )

    // Fire complementary-gifts nudge to Cell Steward on first creation
    await fireComplementaryGiftsNudge(req.userId, req.nodeId)
  }

  res.json(profile)
})

export default router
```

### 6.3 Complementary Gifts Nudge

This implements the June Holley requirement: on first profile completion, if the cell has existing members with complementary gifts, the Cell Steward receives a notification.

```typescript
// server/lib/gifts-nudge.ts
import { db } from '../../src/db/client'
import { giftsProfiles } from '../../src/db/schema/public/gifts-profiles'
import { users } from '../../src/db/schema/public/users'
import { cells } from '../../src/db/schema/public/cells'
import { notificationLog } from '../../src/db/schema/public/notification-log'
import { eq, ne, and, isNotNull } from 'drizzle-orm'

export async function fireComplementaryGiftsNudge(
  newUserId: string,
  nodeId: string
): Promise<void> {
  // Get the new member's cell and Cell Steward
  const [member] = await db
    .select({ cellId: users.cellId, displayName: users.displayName })
    .from(users)
    .where(eq(users.id, newUserId))
    .limit(1)

  if (!member?.cellId) return // not yet assigned to a cell — skip

  const [cell] = await db
    .select({ stewardUserId: cells.stewardUserId })
    .from(cells)
    .where(eq(cells.id, member.cellId))
    .limit(1)

  if (!cell?.stewardUserId) return // no steward yet — skip

  // Check how many other members in this cell have completed a gifts profile
  const existingProfiles = await db
    .select({ userId: giftsProfiles.userId })
    .from(giftsProfiles)
    .innerJoin(users, eq(giftsProfiles.userId, users.id))
    .where(
      and(
        eq(users.cellId, member.cellId),
        ne(giftsProfiles.userId, newUserId),
        isNotNull(giftsProfiles.lovesToDo)
      )
    )

  if (existingProfiles.length === 0) return // no other profiles to compare — skip

  // Log the notification (SMS/WhatsApp dispatch is ORDER 009)
  await db.insert(notificationLog).values({
    userId:         cell.stewardUserId,
    channel:        'push', // in-app for now; SMS/WhatsApp added in ORDER 009
    messageType:    'steward_alert',
    deliveryStatus: 'sent',
  })

  // In-app nudge: surface to Steward dashboard (ORDER 007 will render this)
  // The notification log entry is sufficient for now — dashboard reads it
  console.info(`[gifts-nudge] Steward ${cell.stewardUserId} notified: ${member.displayName} completed gifts profile. ${existingProfiles.length} existing profiles in cell.`)
}
```

### 6.4 Frontend — Gifts Profile Screen

`src/components/gifts-profile/GiftsCapture.tsx` — three-step sequential question flow.

**Structure:**
- One question visible at a time
- Large open `<textarea>` per question (not a single-line input — these are reflective answers)
- "Next" button advances; back arrow goes to previous question
- Step 3 "Next" submits the profile via `PUT /gifts-profile/me`
- On success: show warm completion state for 2 seconds, then navigate to `/trade`
- On returning visit (profile already exists): pre-fill answers, allow editing, submission updates rather than creates

**Routing:** Wire to `/profile` route in `App.tsx`. After auth, check if gifts profile exists via `GET /gifts-profile/me` — if null, redirect to `/profile` before showing any other screen. If profile exists, `/profile` shows the edit view.

**i18n — add to `en.json` under `"gifts"` key:**
```json
{
  "q1_heading": "What do you love to do?",
  "q1_subtext": "Even if no one pays you for it.",
  "q2_heading": "What are you naturally good at?",
  "q2_subtext": "What do people come to you for?",
  "q3_heading": "What do you care about most in your community?",
  "q3_subtext": "What would you change if you could?",
  "next_btn": "Next",
  "back_btn": "Back",
  "submit_btn": "Share with my community",
  "completion_message": "Thank you. We'll help connect you with people who need exactly what you have.",
  "edit_heading": "Your gifts",
  "edit_subtext": "You can update these any time.",
  "save_btn": "Save changes"
}
```

Add equivalent keys to `af.json`.

**Key styling:**
- `bg-canvas-grey` full-screen background
- Question heading: `font-heading text-2xl text-baobab-bark` (Ubuntu, large)
- Subtext: `font-body text-sm text-baobab-bark/60` (Inter, muted)
- Textarea: `w-full min-h-32 rounded-md border border-baobab-bark/20 p-4 font-body text-baobab-bark bg-canvas-raised focus:border-pillar-skills outline-none resize-none`
- Primary button: `bg-action-primary text-white rounded-sm w-full py-4 font-body font-medium` (min height 52px)
- Completion state: centred, `font-heading text-xl text-baobab-bark`, Fynbos Aloe tick icon
- No progress bar — no step counter — no percentage complete

### 6.5 Register the Route

In `server/index.ts`, mount the gifts router:

```typescript
import giftsRouter from './routes/gifts'
app.use('/gifts-profile', giftsRouter)
```

In `src/lib/api.ts`, add typed methods:

```typescript
export const giftsProfileApi = {
  get: () => api.get<GiftsProfile | null>('/gifts-profile/me'),
  put: (data: Partial<GiftsProfile>) => api.put<GiftsProfile>('/gifts-profile/me', data),
}
```

Add `GiftsProfile` type to `src/lib/types.ts` (create if not exists):

```typescript
export interface GiftsProfile {
  id:               string
  userId:           string
  lovesToDo:        string | null
  naturallyGoodAt:  string | null
  caresAbout:       string | null
  freeTextGifts:    string | null
  updatedAt:        string
}
```

---

## 8. MILESTONES

1. `PUT /gifts-profile/me` creates a gifts profile for the authenticated user ✅
2. `GET /gifts-profile/me` returns the profile ✅
3. Second `PUT /gifts-profile/me` updates rather than creates ✅
4. `withRLSContext` wrapper confirmed active — `app.current_node_id` set on DB connection per request ✅
5. Complementary gifts nudge fires on first profile creation — notification_log row created ✅ (check with a member who has a cellId and a cell with an existing profile)
6. Three-question UI renders sequentially — only one question visible at a time ✅
7. Completion message shows then redirects to `/trade` ✅
8. Returning visit pre-fills existing answers ✅
9. All copy renders correctly in English and Afrikaans ✅
10. Bones verdict on the Gifts Capture screen — PASS or CONDITIONAL PASS with changes applied
11. `OBRIEN_STANDUP.md` entry committed

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits `OBRIEN_STANDUP.md` entry including:
- Confirmation that `withRLSContext` is active and resolves the ORDER 004 deviation
- Complementary gifts nudge test result (with cell/steward setup or without if no test data)
- Bones verdict reference
- Any deviations and why

Then await CREW-ORDER-006 (Trade Exchange).

---

## 11. SAREK ESCALATION CLAUSE

The `withRLSContext` implementation is the most technically sensitive part of this order. If Drizzle's transaction API does not support `SET LOCAL` in the expected way, escalate to Scotty before inventing a workaround — the RLS enforcement is non-negotiable for multi-tenant data isolation. The gifts capture UI is straightforward; if blocked on any front-end step for 3 attempts, check `design/prototype-v1/components/` for relevant component patterns from McCoy before escalating.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-03*
