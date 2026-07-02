import pkg from 'pg'
const { Client } = pkg

const BASE = 'http://localhost:3001'
const DB_URL = 'postgresql://neondb_owner:npg_nWYCKt34Zueg@ep-weathered-rice-asce69wr-pooler.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require'

async function main() {
  await fetch(`${BASE}/auth/request-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '+27731234567' }),
  })

  const c = new Client({ connectionString: DB_URL })
  await c.connect()
  const { rows } = await c.query('SELECT code FROM otp_codes ORDER BY created_at DESC LIMIT 1')
  const code = rows[0]?.code
  await c.end()
  console.log('OTP:', code)

  const verifyRes = await fetch(`${BASE}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: '+27731234567', code }),
  })
  const { session_token } = await verifyRes.json() as any
  console.log('TOKEN:', session_token?.slice(0, 20) + '...')

  const authH = { Authorization: `Bearer ${session_token}` }

  // GET listings
  const listRes = await fetch(`${BASE}/listings`, { headers: authH })
  console.log('GET /listings:', listRes.status, listRes.ok ? 'OK' : await listRes.text())

  // POST listing
  const postRes = await fetch(`${BASE}/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authH },
    body: JSON.stringify({ type: 'offer', pillar_tags: ['food'], title: 'Fresh vegetables from my garden' }),
  })
  console.log('POST /listings:', postRes.status)
  const data = await postRes.json()
  console.log('Response:', JSON.stringify(data).slice(0, 200))
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
