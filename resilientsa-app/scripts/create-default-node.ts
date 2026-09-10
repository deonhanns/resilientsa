import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var required')
  process.exit(1)
}

async function main() {
  const c = new Client({ connectionString: DATABASE_URL })
  await c.connect()
  await c.query(
    `INSERT INTO nodes(id, name) VALUES('00000000-0000-0000-0000-000000000001', 'Default Node') ON CONFLICT(id) DO NOTHING`
  )
  console.log('Default node created')
  await c.end()
}

main().catch(e => { console.error(e.message); process.exit(1) })
