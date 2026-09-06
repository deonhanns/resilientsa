// api/_lib/at.ts
// Africa's Talking SMS client — identical to server/lib/at.ts
//
// Lazily constructed: the africastalking SDK validates its config
// synchronously and THROWS if apiKey/username are undefined — and it did
// so at module import time, which crashed the entire Vercel function
// process before the request handler (and its try/catch around
// sms.send()) ever ran. See SCOTTY_PATTERNS.md Pattern 005.
//
// exports.sms.send() is now a safe no-op when AT credentials aren't
// configured: it rejects with a clear, catchable error instead of
// crashing the process, so the caller's existing try/catch (which
// already falls back to OTP_DEBUG_LOG) works as intended.
import AfricasTalking from 'africastalking'

let client: ReturnType<typeof AfricasTalking> | null = null

function getClient() {
  if (client) return client
  const apiKey = process.env.AT_API_KEY
  const username = process.env.AT_USERNAME
  if (!apiKey || !username) {
    throw new Error('AT_API_KEY/AT_USERNAME not configured')
  }
  client = AfricasTalking({ apiKey, username })
  return client
}

export const sms = {
  send: async (opts: { to: string[]; message: string; from?: string }) => {
    return getClient().SMS.send(opts)
  },
}
