import fs from 'fs'
import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = process.env.DATABASE_URL!
if (!DATABASE_URL) {
  console.error('DATABASE_URL env var required')
  process.exit(1)
}

const sql = fs.readFileSync('drizzle/migrations/0001_custom_setup.sql', 'utf-8')

const client = new Client({ connectionString: DATABASE_URL })

async function main() {
  await client.connect()
  console.log('Applying custom migration...')
  await client.query(sql)
  console.log('Custom migration applied successfully.')
  
  // Verify
  const schemas = await client.query(`SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('coop_pii', 'public')`)
  console.log('SCHEMAS:', JSON.stringify(schemas.rows))
  
  const coopTables = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'coop_pii'`)
  console.log('COOP_PII TABLES:', JSON.stringify(coopTables.rows.map(r => r.tablename)))
  
  const rls = await client.query(`SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'listings'`)
  console.log('RLS ON LISTINGS:', JSON.stringify(rls.rows))
  
  const idNumberType = await client.query(`SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'founding_members' AND table_schema = 'coop_pii' AND column_name = 'id_number'`)
  console.log('FOUNDING_MEMBERS.ID_NUMBER (coop_pii):', JSON.stringify(idNumberType.rows))
  
  await client.end()
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
