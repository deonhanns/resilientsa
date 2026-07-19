// api/_lib/db.ts
// Database client for Vercel serverless functions
// Uses @neondatabase/serverless — Neon's HTTP-based driver for serverless
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../../src/db/index'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
