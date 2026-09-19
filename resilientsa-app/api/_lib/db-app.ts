// api/_lib/db-app.ts
//
// CREW-ORDER-011 §4.2 — the APPLICATION-ROLE connection pool.
// On this pool, ROW LEVEL SECURITY IS ENFORCED.
//
// Approved design: CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-draft.md §2,
// approved in full by CREW-ORDERS/CREW-ORDER-011-section-4.2-REDESIGN-approval.md
// (Spock, 2026-09-18). Two connection identities:
//
//   POSTGRES_URL      (./db)      → table owner, carries BYPASSRLS.
//                                   Pre-authentication and structurally cross-node
//                                   work ONLY. See the classification in the draft §2.1.
//   POSTGRES_URL_APP  (this file) → `resilientsa_app`, NOBYPASSRLS, not the owner.
//                                   Every node-scoped data path, via withRLSContext.
//
// FAIL CLOSED — NON-NEGOTIABLE (approval answer 6)
// If POSTGRES_URL_APP is unset this THROWS on first use rather than falling back to
// the privileged pool. A silent fallback would look "configured" while enforcing
// nothing, which is the exact false-confidence failure this whole redesign exists to
// prevent — the same class of lie as the old verify-rls.ts reporting PASS against an
// empty table. Routes that hit this surface a clean 503 (see with-app-connection.ts).
//
// LAZY BY DESIGN, deliberately (SCOTTY_PATTERNS.md Pattern 005)
// The pool is NOT constructed at module scope. Pattern 005's lesson: a client that
// validates config eagerly at import time turns a configuration gap into an
// import-time crash, which is invisible to every caller's try/catch. Throwing from
// inside getDbApp() means the failure lands in the caller's request path, where a
// route can answer with a real status code.
import { createPool } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from '../../src/db/index'

/**
 * Thrown when the app-role connection string is not configured.
 * Typed so route wrappers can map it to 503 without pattern-matching a message.
 */
export class AppConnectionUnavailableError extends Error {
  readonly code = 'APP_CONNECTION_UNAVAILABLE'
  constructor() {
    super(
      'POSTGRES_URL_APP is not set. Node-scoped routes require the non-owner ' +
        'application role; there is intentionally no fallback to the privileged connection.',
    )
    this.name = 'AppConnectionUnavailableError'
  }
}

function build() {
  const connectionString = process.env.POSTGRES_URL_APP
  if (!connectionString) throw new AppConnectionUnavailableError()
  const pool = createPool({ connectionString })
  return drizzle(pool, { schema })
}

type AppDb = ReturnType<typeof build>

let cached: AppDb | null = null

/**
 * The RLS-enforcing pool. Throws AppConnectionUnavailableError if POSTGRES_URL_APP
 * is unset — never returns something that silently lacks enforcement.
 */
export function getDbApp(): AppDb {
  if (!cached) cached = build()
  return cached
}

export function isAppConnectionUnavailable(err: unknown): boolean {
  return err instanceof AppConnectionUnavailableError
}
