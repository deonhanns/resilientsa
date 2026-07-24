// scripts/seed-grounder.ts
// Seed: links a test grounder org to a test user with role 'grounder'
// Run: npx tsx scripts/seed-grounder.ts
// Prerequisites: default node (00000000-0000-0000-0000-000000000001) must exist
import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var required')
  process.exit(1)
}

const DEFAULT_NODE_ID = '00000000-0000-0000-0000-000000000001'
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111'
const TEST_GROUNDER_ID = '22222222-2222-2222-2222-222222222222'

async function main() {
  const c = new Client({ connectionString: DATABASE_URL })
  await c.connect()

  // 1. Ensure default node exists
  await c.query(
    `INSERT INTO nodes(id, name) VALUES($1, 'Default Node') ON CONFLICT(id) DO NOTHING`,
    [DEFAULT_NODE_ID]
  )
  console.log('[1/4] Default node ensured')

  // 2. Create test grounder user
  await c.query(
    `INSERT INTO users(id, node_id, display_name, role, phone_hash)
     VALUES($1, $2, 'Test Grounder', 'grounder', 'test-grounder-hash')
     ON CONFLICT(id) DO UPDATE SET role = 'grounder'`,
    [TEST_USER_ID, DEFAULT_NODE_ID]
  )
  console.log('[2/4] Test grounder user created/updated (role=grounder)')

  // 3. Create grounder org linked to the test user
  await c.query(
    `INSERT INTO grounders(id, user_id, organisation_name, verification_status)
     VALUES($1, $2, 'ResilientSA Test Grounder Org', 'verified')
     ON CONFLICT(id) DO UPDATE SET user_id = $2, verification_status = 'verified'`,
    [TEST_GROUNDER_ID, TEST_USER_ID]
  )
  console.log('[3/4] Grounder org created/updated (verified, linked to test user)')

  // 4. Verify
  const { rows } = await c.query(
    `SELECT g.id, g.organisation_name, g.verification_status, g.user_id,
            u.display_name, u.role
     FROM grounders g
     JOIN users u ON g.user_id = u.id
     WHERE g.id = $1`,
    [TEST_GROUNDER_ID]
  )
  console.log('[4/4] Verification:', JSON.stringify(rows[0], null, 2))

  await c.end()
  console.log('\nSeed complete. Test grounder user + org ready for marketplace flow.')
}

main().catch(e => { console.error(e.message); process.exit(1) })
