import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var required')
  process.exit(1)
}

// Target user is passed explicitly, not inferred from "most recently
// created" — that heuristic breaks the moment any other user (e.g. the
// seed-grounder.ts test user) is created after the intended target.
const TARGET_USER_ID = process.argv[2]
if (!TARGET_USER_ID) {
  console.error('Usage: npx tsx scripts/assign-cell.ts <target-user-id> [cell-id] [cell-name]')
  process.exit(1)
}

const CELL_ID = process.argv[3] ?? 'c0000000-0000-0000-0000-000000000001'
const CELL_NAME = process.argv[4] ?? 'Cell 4'
const DEFAULT_NODE_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  const c = new Client({ connectionString: DATABASE_URL })
  await c.connect()

  // Create cell (idempotent)
  await c.query(
    `INSERT INTO cells(id, node_id, name) VALUES($1, $2, $3) ON CONFLICT DO NOTHING`,
    [CELL_ID, DEFAULT_NODE_ID, CELL_NAME]
  )

  // Assign the explicitly-named user to the cell — never "latest created"
  const { rowCount, rows } = await c.query(
    `UPDATE users SET cell_id = $1 WHERE id = $2 RETURNING id, display_name, cell_id`,
    [CELL_ID, TARGET_USER_ID]
  )

  if (rowCount === 0) {
    console.error(`No user found with id ${TARGET_USER_ID} — nothing updated.`)
    await c.end()
    process.exit(1)
  }

  console.log('Cell ensured and user assigned:', JSON.stringify(rows[0]))
  await c.end()
}

main().catch(e => { console.error(e.message); process.exit(1) })
