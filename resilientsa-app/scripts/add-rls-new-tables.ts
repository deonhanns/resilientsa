import pkg from 'pg'
const { Client } = pkg

const DATABASE_URL = "postgresql://neondb_owner:npg_nWYCKt34Zueg@ep-weathered-rice-asce69wr-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function main() {
  const c = new Client({ connectionString: DATABASE_URL })
  await c.connect()

  await c.query('ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY')
  await c.query('ALTER TABLE session_tokens ENABLE ROW LEVEL SECURITY')
  
  // Drop existing policies if they exist, then recreate
  await c.query('DROP POLICY IF EXISTS otp_codes_anon_insert ON otp_codes')
  await c.query('DROP POLICY IF EXISTS otp_codes_anon_select ON otp_codes')
  await c.query('DROP POLICY IF EXISTS session_tokens_user_isolation ON session_tokens')

  await c.query('CREATE POLICY otp_codes_anon_insert ON otp_codes FOR INSERT WITH CHECK (true)')
  await c.query('CREATE POLICY otp_codes_anon_select ON otp_codes FOR SELECT USING (true)')
  await c.query(`CREATE POLICY session_tokens_user_isolation ON session_tokens 
    USING (user_id IN (SELECT id FROM users))`)

  const rls = await c.query(`SELECT relname, relrowsecurity FROM pg_class 
    WHERE relname IN ('otp_codes','session_tokens')`)
  console.log('RLS:', JSON.stringify(rls.rows))

  await c.end()
  console.log('Done.')
}

main().catch(e => { console.error(e.message); process.exit(1) })
