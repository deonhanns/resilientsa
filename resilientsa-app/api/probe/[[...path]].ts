// api/probe/[[...path]].ts
//
// TEMPORARY EXPERIMENT — CREW-ORDER-013, option (a): does Vercel honour an OPTIONAL
// catch-all (`[[...path]]`) on this project, and if so, which depths does it match?
//
// This file lives on branch `order-013-optional-catchall-probe` ONLY. It is not part of
// any fix, it must not be merged, and it deliberately sits on a dedicated `probe` prefix so
// that it cannot affect the behaviour of any real route while the question is settled.
//
// WHY IT MATTERS: the §2 audit found a correct fix needs one file per distinct DEPTH per
// domain, because a file's path fixes its segment count — 16 functions against a Hobby
// limit of 12. If `[[...path]]` matches depth 0 and depth 2+ (unlike `[...path]`, which per
// CREW-ORDER-010 matches exactly ONE segment and never depth 0), then ONE file per domain
// covers every depth: about 11 functions total, and the whole audit's fix fits.
//
// It echoes what the router actually handed the function rather than assuming, because
// SCOTTY_PATTERNS Pattern 006 showed even the parameter NAME is non-standard here (the
// `[...path]` catch-all arrives as the literal key `'...path'`).
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const q = (req.query ?? {}) as Record<string, unknown>

  const raw = q.path ?? q['...path']
  const segments = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []

  return res.status(200).json({
    probe: 'optional catch-all [[...path]]',
    matched: true,
    url: req.url,
    depth: segments.length,
    segments,
    queryKeys: Object.keys(q),
    // Distinguish the key shapes so the fix knows what to read.
    key_path: q.path ?? null,
    key_dots_path: q['...path'] ?? null,
    key_literal: q['[[...path]]'] ?? null,
    pathIsArray: Array.isArray(q.path),
  })
}
