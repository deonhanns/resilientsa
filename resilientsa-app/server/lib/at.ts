// server/lib/at.ts
// Africa's Talking SMS client — identical to api/_lib/at.ts
//
// Lazily constructed: the africastalking SDK validates its config
// synchronously and throws if apiKey/username are undefined. Lazy
// construction means importing this module never crashes the process
// even when AT credentials aren't configured — only calling sms.send()
// does, and that's caught by the caller. See SCOTTY_PATTERNS.md Pattern 005.
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
