import pkg from 'pg'
const { Client } = pkg

const DB_URL = 'postgresql://neondb_owner:npg_nWYCKt34Zueg@ep-weathered-rice-asce69wr-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require'

async function main() {
  const c = new Client({ connectionString: DB_URL })
  await c.connect()

  // Create cell
  await c.query(`INSERT INTO cells(id, node_id, name) VALUES('c0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Cell 4') ON CONFLICT DO NOTHING`)

  // Assign latest user to cell
  await c.query(`UPDATE users SET cell_id = 'c0000000-0000-0000-0000-000000000001' WHERE id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1)`)

  console.log('Cell created and user assigned.')
  await c.end()
}

main().catch(e => { console.error(e.message); process.exit(1) })
