// api/_lib/with-app-connection.ts
//
// CREW-ORDER-011 §4.2 — wraps the default export of every route that reaches the
// RLS-enforcing app pool, so a missing POSTGRES_URL_APP becomes a clean 503 instead
// of an unhandled throw (which on Vercel surfaces as FUNCTION_INVOCATION_FAILED and
// an HTML error page — the same opaque signature that made the 2026-09-14 incident
// hard to read in the first place).
//
// This wrapper changes NOTHING except the one typed error: anything else is
// re-thrown exactly as before, so existing behaviour is preserved.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAppConnectionUnavailable } from './db-app'

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown> | unknown

export function withAppConnection(handler: Handler): Handler {
  return async function wrapped(req: VercelRequest, res: VercelResponse) {
    try {
      return await handler(req, res)
    } catch (err) {
      if (isAppConnectionUnavailable(err)) {
        // Fail closed, loudly, and do not touch the privileged pool.
        console.error(
          `[APP_CONNECTION_UNAVAILABLE] ${req.method} ${req.url} — POSTGRES_URL_APP is unset. ` +
            'Refusing to fall back to the privileged connection (fail-closed, by design).',
        )
        return res.status(503).json({ error: 'Service unavailable' })
      }
      throw err
    }
  }
}
