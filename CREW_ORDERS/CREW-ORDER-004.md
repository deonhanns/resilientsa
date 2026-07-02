# CREW ORDER — 004
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-004
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-02
**Depends on:** CREW-ORDER-003 ✅ COMPLETE

---

## 1. STRATEGIC CONTEXT

The database is live with 25 tables and full RLS. ORDER 004 implements authentication — the gate through which every community member and Cell Steward enters the platform. Per the Mission Brief (Section 3.1), ResilientSA requires no password, no email, no ID number to join. Authentication is phone number + SMS one-time code via Africa's Talking. Nothing else.

This order also wires the session token into IndexedDB (not localStorage) so it survives browser restarts and works offline — consistent with the offline-first principle in Technical Architecture Section 5.

---

## 2. MISSION OBJECTIVE

Build the complete authentication flow: SMS OTP request and verification via Africa's Talking, 30-day session token stored in IndexedDB, session middleware on the Express API, and the PWA auth screens matching the approved Living Soil design.

---

## 3. BONES BRIEF

**Bones review required** — the auth screens are the first thing a new community member sees after the prototype.

The auth flow must feel like a neighbour asking for your number, not a platform demanding credentials.

**What is being reviewed:** OTP request screen and OTP verification screen.

**Who will encounter this:** A community member joining for the first time, likely on a basic Android phone, possibly with variable literacy.

**Context of encounter:** They've seen the prototype at a community meeting and decided to join. They're on their own phone now, at home or at a community space. This is their first real interaction with the platform.

**Emotional target:** "That was easy." No anxiety about what the platform will do with their number. No confusion about what step they're on.

**Anti-patterns to avoid:**
- Any mention of "account", "profile", "registration", or "sign up" — this is joining a community, not registering for a service
- Any fine print or terms link on the OTP screen
- Any field other than the phone number input — no name, no email, nothing else
- Countdown timer on the OTP screen that creates false urgency
- Generic "Enter verification code" language

**Suggested copy (all externalised to en.json and af.json):**
- Heading: "Join your community"
- Subheading: "We'll send a code to your phone"
- Input placeholder: "Your phone number"
- Button: "Send my code"
- OTP screen heading: "Check your messages"
- OTP subheading: "We sent a 6-digit code to {{number}}"
- Resend link: "Send again" (plain text link, no button, no timer)

**Brand references:** Living Soil palette. Canvas Grey background. Baobab Bark text. Fynbos Aloe primary action button. Ubuntu heading. Inter body.

---

## 4. WORF BRIEF

**Worf review required before merge.**

1. Phone number submitted to the API is never logged in plaintext — no `console.log(phoneNumber)` anywhere in the auth flow
2. Session tokens stored in IndexedDB only — never localStorage, never a cookie without HttpOnly + SameSite=Strict
3. OTP codes expire server-side after 10 minutes — not just client-side
4. OTP codes are single-use — a used code cannot be resubmitted successfully
5. Africa's Talking API key is in environment variables only — never hardcoded, never committed

Worf files findings in `WORF_ALERTS/`. O'Brien does not merge until Worf signs off.

---

## 5. DESIGN SYSTEM REFERENCE

`design/prototype-v1/` — Living Soil Design System. Auth screens are not in the ORDER 001 prototype so O'Brien builds from the Bones Brief above. Bones reviews the implementation before merge.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Africa's Talking Setup

```bash
npm install africastalking
```

Add to `.env.example`:
```
AT_API_KEY=your-africas-talking-api-key
AT_USERNAME=your-africas-talking-username
AT_SENDER_ID=ResilientSA
```

Add all three to Vercel environment variables.

### 6.2 Backend — API Routes

Create an Express (or Fastify) API server at `resilientsa-app/server/`:

```
server/
  index.ts
  routes/
    auth.ts
  middleware/
    session.ts
  lib/
    at.ts         — Africa's Talking client
    otp.ts        — OTP generation, storage, verification
    crypto.ts     — phone number encryption/decryption
```

**`server/lib/at.ts`:**

```typescript
import AfricasTalking from 'africastalking'

const at = AfricasTalking({
  apiKey:   process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
})

export const sms = at.SMS
```

**`server/lib/otp.ts`:**

```typescript
import { db } from '../db/client'
import { otpCodes } from '../db/schema/public/otp-codes'
import { eq, and, gt } from 'drizzle-orm'

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeCode(phoneHash: string, code: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  await db.delete(otpCodes).where(eq(otpCodes.phoneHash, phoneHash))
  await db.insert(otpCodes).values({ phoneHash, code, expiresAt })
}

export async function verifyCode(phoneHash: string, code: string): Promise<boolean> {
  const result = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.phoneHash, phoneHash),
        eq(otpCodes.code, code),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .limit(1)

  if (result.length === 0) return false

  // Delete immediately — single use
  await db.delete(otpCodes).where(eq(otpCodes.phoneHash, phoneHash))
  return true
}
```

**`server/lib/crypto.ts`:**

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const IV_LENGTH = 16

export function hashPhone(phone: string): string {
  return crypto
    .createHmac('sha256', ENCRYPTION_KEY)
    .update(normalisePhone(phone))
    .digest('hex')
}

export function encryptPhone(phone: string): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    iv
  )
  const encrypted = Buffer.concat([cipher.update(normalisePhone(phone)), cipher.final()])
  return Buffer.concat([iv, encrypted])
}

export function decryptPhone(data: Buffer): string {
  const iv = data.slice(0, IV_LENGTH)
  const encrypted = data.slice(IV_LENGTH)
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    iv
  )
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString()
}

export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 10) return `+27${digits.slice(1)}`
  if (digits.startsWith('27') && digits.length === 11) return `+${digits}`
  return phone.startsWith('+') ? phone : `+${digits}`
}
```

**`server/routes/auth.ts`:**

```typescript
import { Router } from 'express'
import { sms } from '../lib/at'
import { generateCode, storeCode, verifyCode } from '../lib/otp'
import { hashPhone, encryptPhone } from '../lib/crypto'
import { db } from '../db/client'
import { users } from '../db/schema/public/users'
import { sessionTokens } from '../db/schema/public/session-tokens'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

const router = Router()

// POST /auth/request-code
router.post('/request-code', async (req, res) => {
  const { phone_number } = req.body
  if (!phone_number) return res.status(400).json({ error: 'phone_number required' })

  const { normalisePhone } = await import('../lib/crypto')
  const normalised = normalisePhone(phone_number)
  const phoneHash  = hashPhone(normalised)
  const code       = generateCode()

  await storeCode(phoneHash, code)

  await sms.send({
    to:      [normalised],
    message: `Your ResilientSA code is ${code}. Valid for 10 minutes.`,
    from:    process.env.AT_SENDER_ID,
  })

  res.json({ message: 'Code sent' })
})

// POST /auth/verify-code
router.post('/verify-code', async (req, res) => {
  const { phone_number, code } = req.body
  if (!phone_number || !code) {
    return res.status(400).json({ error: 'phone_number and code required' })
  }

  const { normalisePhone } = await import('../lib/crypto')
  const normalised = normalisePhone(phone_number)
  const phoneHash  = hashPhone(normalised)
  const valid      = await verifyCode(phoneHash, code)

  if (!valid) return res.status(401).json({ error: 'Invalid or expired code' })

  const encryptedPhone = encryptPhone(normalised)

  let [user] = await db.select().from(users).where(eq(users.phoneNumber, encryptedPhone)).limit(1)

  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({
        displayName:       'Community member',
        phoneNumber:       encryptedPhone,
        role:              'member',
        preferredLanguage: req.body.preferred_language ?? 'en',
      })
      .returning()
  }

  const sessionToken = randomUUID()
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  await db.insert(sessionTokens).values({ token: sessionToken, userId: user.id, expiresAt })

  res.json({ session_token: sessionToken, user_id: user.id, role: user.role })
})

export default router
```

### 6.3 New Schema Tables

Add to `src/db/schema/public/` and run a new migration:

```typescript
// otp-codes.ts
export const otpCodes = pgTable('otp_codes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  phoneHash: text('phone_hash').notNull().unique(),
  code:      text('code').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// session-tokens.ts
export const sessionTokens = pgTable('session_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  token:     text('token').notNull().unique(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 6.4 Session Middleware

```typescript
// server/middleware/session.ts
import { Request, Response, NextFunction } from 'express'
import { db } from '../db/client'
import { sessionTokens } from '../db/schema/public/session-tokens'
import { users } from '../db/schema/public/users'
import { eq, and, gt } from 'drizzle-orm'

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No session token' })

  const [session] = await db
    .select({ userId: sessionTokens.userId, role: users.role, nodeId: users.nodeId })
    .from(sessionTokens)
    .innerJoin(users, eq(sessionTokens.userId, users.id))
    .where(and(eq(sessionTokens.token, token), gt(sessionTokens.expiresAt, new Date())))
    .limit(1)

  if (!session) return res.status(401).json({ error: 'Invalid or expired session' })

  await db.execute(`SET LOCAL app.current_node_id = '${session.nodeId}'`)
  await db.execute(`SET LOCAL app.current_role = '${session.role}'`)

  req.userId   = session.userId
  req.userRole = session.role
  req.nodeId   = session.nodeId

  next()
}

declare global {
  namespace Express {
    interface Request {
      userId:   string
      userRole: string
      nodeId:   string
    }
  }
}
```

Apply `requireSession` to all routes except `/auth/*`.

### 6.5 Frontend — Auth Screens

Two React components:
- `src/components/auth/PhoneInput.tsx` — phone number entry
- `src/components/auth/OtpInput.tsx` — 6-digit code entry

Both use Living Soil tokens. Key styling:
- `bg-canvas-grey` background, `text-baobab-bark` text
- `font-heading` (Ubuntu) for headings
- Primary button: `bg-action-primary text-white rounded-sm` (min height 52px)
- Input: `border border-baobab-bark/20 rounded-sm` at rest, `border-pillar-water` on focus
- All interactive elements minimum 44px tap target
- Phone input: `type="tel" inputMode="numeric"`
- OTP input: `type="text" inputMode="numeric" maxLength={6} pattern="[0-9]*"`

Add to `en.json` under `"auth"` key:
```json
{
  "join_heading": "Join your community",
  "join_subheading": "We'll send a code to your phone",
  "phone_placeholder": "Your phone number",
  "send_code_btn": "Send my code",
  "otp_heading": "Check your messages",
  "otp_subheading": "We sent a 6-digit code to {{number}}",
  "otp_placeholder": "6-digit code",
  "verify_btn": "Confirm",
  "resend_link": "Send again",
  "sending": "Sending...",
  "verifying": "Checking..."
}
```

Add equivalent keys to `af.json`.

### 6.6 Session Storage in IndexedDB

```typescript
// src/lib/session.ts
import { openDB } from 'idb'

const DB_NAME = 'resilientsa'
const STORE   = 'session'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    },
  })
}

export async function saveSession(token: string, userId: string, role: string): Promise<void> {
  const db = await getDB()
  await db.put(STORE, { token, userId, role, savedAt: Date.now() }, 'current')
}

export async function getSession(): Promise<{ token: string; userId: string; role: string } | null> {
  const db = await getDB()
  return db.get(STORE, 'current') ?? null
}

export async function clearSession(): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, 'current')
}
```

Update `getToken()` in `src/lib/api.ts` to read from IndexedDB via `getSession()` instead of localStorage.

---

## 8. MILESTONES

1. `POST /auth/request-code` with a real SA number sends SMS via Africa's Talking sandbox
2. `POST /auth/verify-code` with correct code returns session token
3. `POST /auth/verify-code` with wrong or expired code returns 401
4. Session token stored in IndexedDB — confirm via DevTools → Application → IndexedDB
5. API requests with valid `Authorization: Bearer` token succeed; without token return 401
6. Auth screens render correctly in English and Afrikaans
7. Bones verdict on both auth screens — PASS or CONDITIONAL PASS with changes applied
8. Worf sign-off — no open Critical or High alerts
9. `OBRIEN_STANDUP.md` entry committed

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits `OBRIEN_STANDUP.md` entry including:
- Africa's Talking sandbox message ID confirming SMS delivery
- IndexedDB session storage confirmation
- Bones verdict reference
- Worf sign-off status
- Any deviations and why

Then await CREW-ORDER-005 (Gifts Profile).

---

## 11. SAREK ESCALATION CLAUSE

Africa's Talking API integration and SA phone number normalisation are the most likely friction points. If AT sandbox is not sending after 3 attempts, escalate to Scotty. The crypto implementation (AES-256-CBC encryption, HMAC-SHA256 hashing) is non-negotiable — do not substitute simpler approaches. Worf will catch it.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-02*
