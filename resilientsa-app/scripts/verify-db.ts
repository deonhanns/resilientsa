import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = "postgresql://neondb_owner:npg_nWYCKt34Zueg@ep-weathered-rice-asce69wr-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const client = new Client({ connectionString: DATABASE_URL })

async function main() {
  await client.connect()
  console.log('Connected.\n')

  // 1. Schemas
  const schemas = await client.query(
    `SELECT schema_name FROM information_schema.schemata 
     WHERE schema_name IN ('coop_pii', 'public')`
  )
  console.log('SCHEMAS:', JSON.stringify(schemas.rows))

  // 2. All public tables
  const tables = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  console.log('PUBLIC TABLES:', JSON.stringify(tables.rows.map(r => r.tablename)))

  // 3. founding_members columns (check bytea)
  const fmCols = await client.query(
    `SELECT column_name, data_type, udt_name 
     FROM information_schema.columns 
     WHERE table_name = 'founding_members' AND table_schema = 'public'
     ORDER BY ordinal_position`
  )
  console.log('FOUNDING_MEMBERS COLUMNS:', JSON.stringify(fmCols.rows))

  // 4. Users columns (check phone_number bytea)
  const userCols = await client.query(
    `SELECT column_name, data_type, udt_name 
     FROM information_schema.columns 
     WHERE table_name = 'users' AND column_name IN ('phone_number', 'whatsapp_number') AND table_schema = 'public'`
  )
  console.log('USERS PII COLUMNS:', JSON.stringify(userCols.rows))

  // 5. RLS on listings
  const rls = await client.query(
    `SELECT relname, relrowsecurity 
     FROM pg_class 
     WHERE relname = 'listings'`
  )
  console.log('RLS ON LISTINGS:', JSON.stringify(rls.rows))

  // 6. Row counts
  const counts = await client.query(
    `SELECT count(*) as table_count FROM pg_tables WHERE schemaname = 'public'`
  )
  console.log('TOTAL PUBLIC TABLES:', counts.rows[0].table_count)

  await client.end()
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
