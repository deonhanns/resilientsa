# CREW ORDER — 003
**Mission:** ResilientSA
**Order ID:** CREW-ORDER-003
**Issued by:** Spock
**Assigned to:** O'Brien
**Status:** READY — awaiting O'Brien
**Date issued:** 2026-07-02
**Depends on:** CREW-ORDER-002 ✅ COMPLETE

---

## 1. STRATEGIC CONTEXT

The PWA scaffold is live on Vercel. ORDER 003 establishes the data layer — the PostgreSQL schema that every subsequent order's API endpoints read from and write to. This is the most security-sensitive order in the MVP sequence. Worf reviews before anything is merged.

The schema follows the Technical Architecture Document (`docs/technical-architecture-v1.0.md`) exactly. All tables are created now — including Phase 2 entities — so the migration history is clean and no future order requires destructive schema changes.

---

## 2. MISSION OBJECTIVE

Create the complete PostgreSQL schema via a versioned Drizzle migration, with row-level security policies enforcing `node_id` tenant isolation at the database layer, and the `coop_pii` schema namespace for founding member data with pgcrypto column encryption.

---

## 3. BONES BRIEF

No human-facing output. Bones review not required.

---

## 4. WORF BRIEF

**Worf review required before merge.**

Before the migration PR is opened, Worf confirms:

1. `phone_number` on `User` is `bytea` (pgcrypto encrypted) — not plain `TEXT`
2. `FoundingMember` lives in `coop_pii` schema, not `public`
3. RLS is ENABLED on every table in both `public` and `coop_pii`
4. `coop_pii.founding_members` has a stricter RLS policy — Node Admin role only
5. No PII field (`phone_number`, `id_number`, `address`, `full_name`, `surname`, `email`) is plain unencrypted text

Worf files findings in `WORF_ALERTS/` per `WORF_ALERTS/README.md`. O'Brien does not merge until Worf signs off.

---

## 5. DESIGN SYSTEM REFERENCE

Not applicable — backend schema only.

---

## 6. O'BRIEN BRIEF — TECHNICAL SPECIFICATION

### 6.1 Database and Migration Tool Setup

Use **Drizzle ORM** for schema definition and migrations.

```bash
cd resilientsa-app
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

Schema files at `resilientsa-app/src/db/`:

```
src/db/
  schema/
    public/
      nodes.ts
      cells.ts
      users.ts
      gifts-profiles.ts
      listings.ts
      matches.ts
      trade-completions.ts
      community-exchange-reference.ts
      value-charters.ts
      grounders.ts
      programme-offerings.ts
      offering-engagements.ts
      offering-endorsements.ts
      connection-events.ts
      network-phase-snapshots.ts
      crisis-mode.ts
      external-signals.ts
      internal-forecasts.ts
      anticipatory-alerts.ts
      multi-signal-alerts.ts
      community-health-assessments.ts
      notification-log.ts
    coop_pii/
      cooperatives.ts
      founding-members.ts
      cooperative-status-events.ts
  index.ts
  client.ts
drizzle.config.ts
```

`drizzle.config.ts`:

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema/**/*.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

### 6.2 Encryption Strategy for PII

Enable pgcrypto and store PII fields as `bytea`, encrypted with `pgp_sym_encrypt(value, key)` at the application layer using `ENCRYPTION_KEY` from environment variables.

Add to `.env.example`:
```
DATABASE_URL=postgresql://...
ENCRYPTION_KEY=minimum-32-character-random-key-here
```

### 6.3 Schema Definitions

Implement all tables exactly as specified in `docs/technical-architecture-v1.0.md` Section 3. Key tables below — implement all faithfully.

**Core entities (Section 3.1):**

```typescript
// nodes.ts
export const nodes = pgTable('nodes', {
  id:               uuid('id').primaryKey().defaultRandom(),
  name:             text('name').notNull(),
  locationLat:      real('location_lat'),
  locationLng:      real('location_lng'),
  raCpfName:        text('ra_cpf_name'),
  healthState:      text('health_state', {
                      enum: ['generative','stressed','fragile','collapsed']
                    }).default('generative'),
  healthStateSetBy: uuid('health_state_set_by'),
  healthStateSetAt: timestamp('health_state_set_at', { withTimezone: true }),
  healthStateNotes: text('health_state_notes'), // PRIVATE — RLS enforced
  createdAt:        timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

```typescript
// users.ts — phone_number is bytea (encrypted)
export const users = pgTable('users', {
  id:                uuid('id').primaryKey().defaultRandom(),
  nodeId:            uuid('node_id').notNull().references(() => nodes.id),
  cellId:            uuid('cell_id').references(() => cells.id),
  displayName:       text('display_name').notNull(),
  phoneNumber:       customType<{ data: string; driverData: Buffer }>({
                       dataType() { return 'bytea' }
                     })('phone_number'),
  role:              text('role', {
                       enum: ['member','cell_steward','node_admin','regional_steward']
                     }).default('member'),
  invitedBy:         uuid('invited_by'),
  preferredLanguage: text('preferred_language').default('en'),
  whatsappOptedIn:   boolean('whatsapp_opted_in').default(false),
  whatsappNumber:    customType<{ data: string; driverData: Buffer }>({
                       dataType() { return 'bytea' }
                     })('whatsapp_number'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow(),
})
```

```typescript
// listings.ts
export const listings = pgTable('listings', {
  id:          uuid('id').primaryKey().defaultRandom(),
  nodeId:      uuid('node_id').notNull().references(() => nodes.id),
  cellId:      uuid('cell_id').notNull().references(() => cells.id),
  userId:      uuid('user_id').notNull().references(() => users.id),
  type:        text('type', { enum: ['offer','need'] }).notNull(),
  pillarTags:  text('pillar_tags').array().notNull(),
  title:       text('title').notNull(),
  description: text('description'),
  photoUrl:    text('photo_url'),
  status:      text('status', {
                 enum: ['open','matched','completed','withdrawn']
               }).default('open'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})
```

**Network health (Section 3.4):**

```typescript
// network-phase-snapshots.ts — append-only
export const networkPhaseSnapshots = pgTable('network_phase_snapshots', {
  id:         uuid('id').primaryKey().defaultRandom(),
  nodeId:     uuid('node_id').notNull().references(() => nodes.id),
  cellId:     uuid('cell_id').references(() => cells.id),
  phase:      text('phase', {
                enum: ['scattered_fragments','hub_and_spoke','multi_hub','core_periphery']
              }).notNull(),
  computedAt: timestamp('computed_at', { withTimezone: true }).defaultNow(),
  metrics:    jsonb('metrics').default({}),
})
```

**Anticipatory intelligence (from `docs/anticipatory-intelligence-spec-v1.0.md`):**

```typescript
// external-signals.ts
export const externalSignals = pgTable('external_signals', {
  id:             uuid('id').primaryKey().defaultRandom(),
  signalType:     text('signal_type', {
                    enum: ['load_shedding_escalation','weather_warning',
                           'water_disruption_notice','unrest_signal','health_outbreak_notice']
                  }).notNull(),
  source:         text('source').notNull(),
  affectedRegion: text('affected_region'),
  severity:       text('severity', { enum: ['watch','warning','severe'] }).notNull(),
  reportedAt:     timestamp('reported_at', { withTimezone: true }).defaultNow(),
  expiresAt:      timestamp('expires_at', { withTimezone: true }),
  loggedBy:       text('logged_by').default('uhura'),
  notes:          text('notes'),
})
```

**`coop_pii` schema — ALL fields on founding_members are bytea encrypted:**

```typescript
// coop_pii/founding-members.ts
// PURGE on registration confirmation per cooperative-formation-spec-v1.0.md Section 2
export const foundingMembers = pgTable('founding_members', {
  id:            uuid('id').primaryKey().defaultRandom(),
  cooperativeId: uuid('cooperative_id').notNull(),
  fullName:      customType<{ data: string; driverData: Buffer }>({
                   dataType() { return 'bytea' }
                 })('full_name'),
  surname:       customType<{ data: string; driverData: Buffer }>({
                   dataType() { return 'bytea' }
                 })('surname'),
  address:       customType<{ data: string; driverData: Buffer }>({
                   dataType() { return 'bytea' }
                 })('address'),
  idNumber:      customType<{ data: string; driverData: Buffer }>({
                   dataType() { return 'bytea' }
                 })('id_number'),
  email:         customType<{ data: string; driverData: Buffer }>({
                   dataType() { return 'bytea' }
                 })('email'),
  isDirector:    boolean('is_director').default(false),
}, () => ({ schema: 'coop_pii' }))
```

Implement all remaining tables from `docs/technical-architecture-v1.0.md` Section 3 in full — cells, gifts-profiles, matches, trade-completions, community-exchange-reference, value-charters, grounders, programme-offerings, offering-engagements, offering-endorsements, connection-events, crisis-mode, internal-forecasts, anticipatory-alerts, multi-signal-alerts, community-health-assessments, notification-log, cooperatives, cooperative-status-events.

### 6.4 Row-Level Security

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS coop_pii;

-- Enable RLS on all public tables
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
-- repeat for every public table

-- Node isolation policy
CREATE POLICY node_isolation ON listings
  USING (node_id = current_setting('app.current_node_id')::uuid);

-- coop_pii — node_admin only
ALTER TABLE coop_pii.founding_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY coop_pii_node_admin_only ON coop_pii.founding_members
  USING (
    cooperative_id IN (
      SELECT id FROM coop_pii.cooperatives
      WHERE node_id = current_setting('app.current_node_id')::uuid
    )
    AND current_setting('app.current_role') = 'node_admin'
  );
```

Application sets `app.current_node_id` and `app.current_role` via `SET LOCAL` at transaction start.

### 6.5 Key Indexes

```sql
CREATE INDEX idx_listings_node_id ON listings(node_id);
CREATE INDEX idx_listings_pillar_tags ON listings USING GIN(pillar_tags);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_connection_events_node_id ON connection_events(node_id);
CREATE INDEX idx_network_phase_snapshots_node_id ON network_phase_snapshots(node_id);
CREATE INDEX idx_anticipatory_alerts_node_id ON anticipatory_alerts(node_id);
CREATE INDEX idx_notification_log_user_id ON notification_log(user_id);
```

### 6.6 Environment and Database

Use **Neon** (serverless Postgres, free tier, excellent Vercel integration) for hosted Postgres. Add to `.env.local`:

```
DATABASE_URL=postgresql://...@neon.tech/resilientsa
ENCRYPTION_KEY=minimum-32-character-random-key
```

Add both to Vercel environment variables.

### 6.7 Running the Migration

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## 8. MILESTONES

1. `npx drizzle-kit generate` runs — migration SQL files created in `drizzle/migrations/`
2. `npx drizzle-kit migrate` runs against Neon — all tables created
3. `coop_pii` schema exists — confirm via `\dn` in psql
4. `founding_members.id_number` is type `bytea` — confirm via `\d coop_pii.founding_members`
5. RLS enabled on `listings` — confirm via `SELECT relrowsecurity FROM pg_class WHERE relname = 'listings'`
6. Worf review complete — no open Critical or High alerts in `WORF_ALERTS/`
7. `OBRIEN_STANDUP.md` entry committed with Neon dashboard link and all 5 confirmations

---

## 9. UHURA INTELLIGENCE REQUIRED

None for this order.

---

## 10. REPORTING BACK

O'Brien commits `OBRIEN_STANDUP.md` entry including Neon dashboard link, all 5 milestone confirmations, Worf sign-off status, and any deviations. Then await CREW-ORDER-004 (Authentication).

---

## 11. SAREK ESCALATION CLAUSE

RLS policy implementation and pgcrypto encryption setup are the most likely escalation points. If blocked 3 attempts on either, file in `ENGINEERING_ESCALATIONS/`. Do not ship unencrypted PII fields as a workaround — Worf will block the merge regardless.

---

**ORDER STATUS: READY — awaiting O'Brien**

*Issued by Spock — 2026-07-02*
