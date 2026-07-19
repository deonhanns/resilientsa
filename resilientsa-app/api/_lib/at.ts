// api/_lib/at.ts
// Africa's Talking SMS client — identical to server/lib/at.ts
import AfricasTalking from 'africastalking'

const at = AfricasTalking({
  apiKey: process.env.AT_API_KEY!,
  username: process.env.AT_USERNAME!,
})

export const sms = at.SMS
