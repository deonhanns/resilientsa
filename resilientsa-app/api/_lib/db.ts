// api/_lib/db.ts
// Database client for Vercel serverless functions
import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from '../../src/db/index'

export const db = drizzle(sql, { schema })
