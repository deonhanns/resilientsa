// api/listings.ts
//
// TEMPORARY PROTOTYPE — CREW-ORDER-013, the "plain file, method + query dispatch" design.
//
// Branch `order-013-plain-file-probe` ONLY. Not a fix, must not be merged as-is, and it
// deliberately sits ALONGSIDE the existing api/listings/[...path].ts so that coexistence on
// this deployment is tested too — if Vercel refuses a file and a directory of the same name,
// that is itself a finding (it would mean the real fix has to add the file and delete the
// directory in one atomic commit, which is what we would do anyway).
//
// THE QUESTION: can a domain avoid the whole catch-all problem by using a plain, non-dynamic
// filename? `api/listings.ts` has NO brackets and NO dynamic segments, so there is nothing for
// the router's bracket-parsing to mis-handle (SCOTTY_PATTERNS Pattern 006) and nothing that
// needs a segment count to match (ORDER 010's depth rules). If that works, then one file per
// domain can serve every request shape by dispatching on METHOD plus query/body instead of on
// URL path segments:
//
//   GET    /api/listings              -> browse        (was the depth-0 root case)
//   POST   /api/listings              -> create        (was the depth-0 root case)
//   PATCH  /api/listings?id=<uuid>    -> edit one      (was PATCH /api/listings/<id>)
//   DELETE /api/listings?id=<uuid>    -> delete one    (was DELETE /api/listings/<id>)
//
// Deliberately does NOT touch the database: this is a routing experiment, and coupling it to
// the app pool would conflate two questions. It echoes what the router actually delivered.
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query ?? {}) as Record<string, unknown>
  const id = typeof q.id === 'string' ? q.id : null
  const method = req.method ?? ''

  // Exercise every dispatch branch so the response proves dispatch, not just routing.
  if (method === 'GET') {
    return res.status(200).json({
      prototype: 'plain file, method + query dispatch',
      handled: id ? 'browse-one (was GET /api/listings/<id>)' : 'browse-collection (was GET /api/listings)',
      method,
      url: req.url,
      id,
      cell_id: q.cell_id ?? null,
      queryKeys: Object.keys(q),
      queryIsClean: Object.keys(q).every((k) => !k.includes('.') && !k.includes('[')),
    })
  }

  if (method === 'POST') {
    return res.status(200).json({
      prototype: 'plain file, method + query dispatch',
      handled: 'create (was POST /api/listings)',
      method,
      url: req.url,
      id,
      queryKeys: Object.keys(q),
      bodyReceived: req.body ?? null,
    })
  }

  if (method === 'PATCH' || method === 'DELETE') {
    if (!id) {
      return res.status(400).json({
        prototype: 'plain file, method + query dispatch',
        handled: 'rejected — id is required for PATCH/DELETE, and this proves the 400 path runs',
        method,
        url: req.url,
        queryKeys: Object.keys(q),
      })
    }
    return res.status(200).json({
      prototype: 'plain file, method + query dispatch',
      handled: method === 'PATCH' ? 'edit-one (was PATCH /api/listings/<id>)' : 'delete-one (was DELETE /api/listings/<id>)',
      method,
      url: req.url,
      id,
      queryKeys: Object.keys(q),
    })
  }

  return res.status(405).json({
    prototype: 'plain file, method + query dispatch',
    handled: 'method not allowed',
    method,
    allowed: ['GET', 'POST', 'PATCH', 'DELETE'],
  })
}
