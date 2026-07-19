// api/_lib/db.ts
// Database client for Vercel serverless functions
// Uses pg Pool — if Neon connection errors occur in production,
// switch to @neondatabase/serverless per CREW-ORDER-007b Section 11
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '../../src/db/index'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })
