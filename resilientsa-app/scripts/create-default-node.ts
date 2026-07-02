import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = "postgresql://neondb_owner:npg_nWYCKt34Zueg@ep-weathered-rice-asce69wr-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

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
