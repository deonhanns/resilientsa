// scripts/verify-grounder-routes.ts
// ORDER 008 schema-fix verification — applies additive migration 0003 (if needed),
// links test grounder user <-> org, then invokes the real serverless handlers with
// mock req/res to confirm: grounder 200-path, non-grounder 403.
//
// DB URL: reads process.env.DATABASE_URL if set; otherwise falls back to the
// Captain-authorized committed connection string in scripts/test-listings-api.ts.
// No new secrets are introduced by this script.
//
// Run: npx tsx scripts/verify-grounder-routes.ts
import fs from 'fs'
import pkg from 'pg'
const { Client } = pkg

function resolveDbUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  const src = fs.readFileSync('scripts/test-listings-api.ts', 'utf8')
  const m = src.match(/DB_URL\s*=\s*'([^']+)'/)
  if (!m) throw new Error('DB_URL not found in scripts/test-listings-api.ts')
  return m[1]
}

const DB_URL = resolveDbUrl()
process.env.POSTGRES_URL = DB_URL // for @vercel/postgres in api/_lib/db.ts

const DEFAULT_NODE_ID = '00000000-0000-0000-0000-000000000001'
const GROUNDER_USER_ID = '11111111-1111-1111-1111-111111111111'
const GROUNDER_ORG_ID = '22222222-2222-2222-2222-222222222222'
const MEMBER_USER_ID = '33333333-3333-3333-3333-333333333333'
const GROUNDER_TOKEN = 'verify-grounder-token'
const MEMBER_TOKEN = 'verify-member-token'

function mockRes() {
  const state: { statusCode: number; body: unknown } = { statusCode: 200, body: null }
  const res: any = {
    status(code: number) {
      state.statusCode = code
      return res
    },
    json(body: unknown) {
      state.body = body
      return res
    },
  }
  return { res, state }
}

function mockReq(over: Record<string, unknown>) {
  return {
    method: 'GET',
    query: {},
    body: {},
    headers: {},
    ...over,
  }
}

async function main() {
  const c = new Client({ connectionString: DB_URL })
  await c.connect()
  console.log('CONNECTED to Neon')

  // ---- 1. Apply additive migration 0003 if not present (idempotent) ----
  const col = await c.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name='grounders' AND column_name='user_id'`
  )
  if (col.rows.length === 0) {
    console.log('Migration 0003 NOT applied — applying (additive only)...')
    await c.query(`ALTER TABLE grounders ADD COLUMN user_id uuid`)
    await c.query(
      `ALTER TABLE grounders ADD CONSTRAINT grounders_user_id_users_id_fk
       FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE no action ON UPDATE no action`
    )
    await c.query(`ALTER TABLE grounders ADD CONSTRAINT grounders_user_id_unique UNIQUE(user_id)`)
    console.log('Migration 0003 applied ✅')
  } else {
    console.log('Migration 0003 already applied ✅')
  }

  // ---- 2. Seed: default node + grounder user + grounder org (linked) ----
  await c.query(`INSERT INTO nodes(id, name) VALUES($1, 'Default Node') ON CONFLICT(id) DO NOTHING`, [DEFAULT_NODE_ID])
  await c.query(
    `INSERT INTO users(id, node_id, display_name, role, phone_hash)
     VALUES($1, $2, 'Test Grounder', 'grounder', 'test-grounder-hash')
     ON CONFLICT(id) DO UPDATE SET role='grounder'`,
    [GROUNDER_USER_ID, DEFAULT_NODE_ID]
  )
  await c.query(
    `INSERT INTO grounders(id, user_id, organisation_name, verification_status)
     VALUES($1, $2, 'ResilientSA Test Grounder Org', 'verified')
     ON CONFLICT(id) DO UPDATE SET user_id=$2, verification_status='verified'`,
    [GROUNDER_ORG_ID, GROUNDER_USER_ID]
  )
  console.log('Seed: grounder user + org linked ✅')

  // ---- 2b. Non-grounder member user (for 403 checks) ----
  await c.query(
    `INSERT INTO users(id, node_id, display_name, role, phone_hash)
     VALUES($1, $2, 'Test Member', 'member', 'test-member-hash')
     ON CONFLICT(id) DO UPDATE SET role='member'`,
    [MEMBER_USER_ID, DEFAULT_NODE_ID]
  )
  console.log('Seed: non-grounder member created ✅')

  // ---- 3. Session tokens ----
  const future = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  await c.query(
    `INSERT INTO session_tokens(token, user_id, expires_at)
     VALUES($1, $2, $3)
     ON CONFLICT(token) DO UPDATE SET user_id=$2, expires_at=$3`,
    [GROUNDER_TOKEN, GROUNDER_USER_ID, future]
  )
  await c.query(
    `INSERT INTO session_tokens(token, user_id, expires_at)
     VALUES($1, $2, $3)
     ON CONFLICT(token) DO UPDATE SET user_id=$2, expires_at=$3`,
    [MEMBER_TOKEN, MEMBER_USER_ID, future]
  )
  console.log('Session tokens created ✅')
  await c.end()

  // ---- 4. Invoke real handlers (consolidated marketplace catch-all) ----
  const { default: marketplaceHandler } = await import('../api/marketplace/[...path].ts')
  const offeringsHandler = marketplaceHandler
  const mineHandler = marketplaceHandler
  const requestsHandler = marketplaceHandler
  const engagementHandler = marketplaceHandler

  const authGrounder = { authorization: `Bearer ${GROUNDER_TOKEN}` }
  const authMember = { authorization: `Bearer ${MEMBER_TOKEN}` }
  let failures = 0
  let passes = 0

  function check(name: string, expected: number, actual: number, detail?: string) {
    const ok = actual === expected
    ok ? passes++ : failures++
    console.log(`${ok ? '✅' : '❌'} ${name}: expected ${expected}, got ${actual}${detail ? ' — ' + detail : ''}`)
  }

  // POST /marketplace/offerings — create offering
  const createGrounder = mockRes()
  await offeringsHandler(
    mockReq({
      method: 'POST',
      query: { path: ['offerings'] },
      headers: authGrounder,
      body: {
        name: 'Water Kiosk Programme',
        shortDescription: 'Community water access',
        pillarTags: ['water'],
      },
    }),
    createGrounder.res
  )
  check('POST /offerings (grounder)', 201, createGrounder.state.statusCode)
  const offeringId = (createGrounder.state.body as any)?.id

  const createMember = mockRes()
  await offeringsHandler(
    mockReq({ method: 'POST', query: { path: ['offerings'] }, headers: authMember, body: { name: 'X', pillarTags: ['food'] } }),
    createMember.res
  )
  check('POST /offerings (non-grounder)', 403, createMember.state.statusCode)

  // GET /marketplace/offerings/mine
  const mineGrounder = mockRes()
  await mineHandler(mockReq({ method: 'GET', query: { path: ['offerings', 'mine'] }, headers: authGrounder }), mineGrounder.res)
  check('GET /offerings/mine (grounder)', 200, mineGrounder.state.statusCode)

  const mineMember = mockRes()
  await mineHandler(mockReq({ method: 'GET', query: { path: ['offerings', 'mine'] }, headers: authMember }), mineMember.res)
  check('GET /offerings/mine (non-grounder)', 403, mineMember.state.statusCode)

  // GET /marketplace/requests
  const reqGrounder = mockRes()
  await requestsHandler(mockReq({ method: 'GET', query: { path: ['requests'] }, headers: authGrounder }), reqGrounder.res)
  check('GET /requests (grounder)', 200, reqGrounder.state.statusCode)

  const reqMember = mockRes()
  await requestsHandler(mockReq({ method: 'GET', query: { path: ['requests'] }, headers: authMember }), reqMember.res)
  check('GET /requests (non-grounder)', 403, reqMember.state.statusCode)

  // PATCH /marketplace/engagements/:id — need an engagement on the grounder's offering
  const c2 = new Client({ connectionString: DB_URL })
  await c2.connect()
  const engagementId = '44444444-4444-4444-4444-444444444444'
  if (offeringId) {
    await c2.query(
      `INSERT INTO offering_engagements(id, offering_id, node_id, status, request_context)
       VALUES($1, $2, $3, 'requested', '40 households need water')
       ON CONFLICT(id) DO UPDATE SET status='requested', started_at=NULL, completed_at=NULL`,
      [engagementId, offeringId, DEFAULT_NODE_ID]
    )
    console.log('Test engagement reset to requested for PATCH path ✅')
  }
  await c2.end()

  const engGrounder = mockRes()
  await engagementHandler(
    mockReq({ method: 'PATCH', query: { path: ['engagements', engagementId] }, headers: authGrounder, body: { status: 'accepted' } }),
    engGrounder.res
  )
  check('PATCH /engagements/:id (grounder)', 200, engGrounder.state.statusCode, JSON.stringify(engGrounder.state.body)?.slice(0, 120))

  const engMember = mockRes()
  await engagementHandler(
    mockReq({ method: 'PATCH', query: { path: ['engagements', engagementId] }, headers: authMember, body: { status: 'accepted' } }),
    engMember.res
  )
  check('PATCH /engagements/:id (non-grounder)', 403, engMember.state.statusCode)

  console.log('\n===== SUMMARY =====')
  console.log(`Passed: ${passes}  Failed: ${failures}`)
  if (failures > 0) process.exit(1)
  console.log('ALL GROUNDER ROUTE CHECKS PASSED ✅')
}

main().catch((e) => {
  console.error('VERIFY ERROR:', e?.message, e?.stack)
  process.exit(1)
})
