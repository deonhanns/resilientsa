import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { saveSession } from '../../lib/session'

interface Props {
  onSuccess: (role: string) => void
}

export default function PhoneInput({ onSuccess }: Props) {
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    if (phone.length < 9) return
    setSending(true)
    setError('')
    try {
      await api.post('/auth/request-code', { phone_number: phone })
      setStep('otp')
    } catch {
      setError('Could not send code. Check your number and try again.')
    } finally {
      setSending(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (code.length !== 6) return
    setVerifying(true)
    setError('')
    try {
      const data = await api.post<{
        session_token: string
        user_id: string
        role: string
      }>('/auth/verify-code', {
        phone_number: phone,
        code,
        preferred_language: navigator.language?.startsWith('af') ? 'af' : 'en',
      })
      await saveSession(data.session_token, data.user_id, data.role)
      onSuccess(data.role)
    } catch {
      setError('Wrong code. Check your messages and try again.')
    } finally {
      setVerifying(false)
    }
  }

  async function handleResend() {
    setSending(true)
    try {
      await api.post('/auth/request-code', { phone_number: phone })
    } catch {
      // silently fail on resend
    } finally {
      setSending(false)
    }
  }

  // OTP step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas-grey">
        <div className="w-full max-w-sm">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
          >
            {t('auth.otp_heading')}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--bark-600)' }}>
            {t('auth.otp_subheading', { number: phone })}
          </p>

          <form onSubmit={handleVerify}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]*"
              placeholder={t('auth.otp_placeholder')}
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                if (v.length <= 6) setCode(v)
              }}
              className="w-full px-5 py-4 text-lg text-center tracking-widest rounded-sm border mb-6"
              style={{
                fontFamily: 'var(--font-body)',
                borderColor: 'rgba(44,42,41,0.2)',
                color: 'var(--bark-900)',
                backgroundColor: 'var(--canvas-raised)',
                minHeight: '52px',
              }}
              autoFocus
            />

            {error && (
              <p className="text-sm mb-4 text-center" style={{ color: 'var(--signal-urgent)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={code.length !== 6 || verifying}
              className="w-full text-white font-medium py-4 rounded-sm transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: 'var(--action-primary)',
                minHeight: '52px',
                fontFamily: 'var(--font-body)',
              }}
            >
              {verifying ? t('auth.verifying') : t('auth.verify_btn')}
            </button>
          </form>

          <p className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={sending}
              className="text-sm underline cursor-pointer disabled:opacity-50"
              style={{ color: 'var(--pillar-water)', fontFamily: 'var(--font-body)' }}
            >
              {t('auth.resend_link')}
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Phone input step
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas-grey">
      <div className="w-full max-w-sm">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
        >
          {t('auth.join_heading')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--bark-600)' }}>
          {t('auth.join_subheading')}
        </p>

        <form onSubmit={handleSendCode}>
          <input
            type="tel"
            inputMode="numeric"
            placeholder={t('auth.phone_placeholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-5 py-4 text-base rounded-sm border mb-6"
            style={{
              fontFamily: 'var(--font-body)',
              borderColor: 'rgba(44,42,41,0.2)',
              color: 'var(--bark-900)',
              backgroundColor: 'var(--canvas-raised)',
              minHeight: '52px',
            }}
            autoFocus
          />

          {error && (
            <p className="text-sm mb-4 text-center" style={{ color: 'var(--signal-urgent)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={phone.length < 9 || sending}
            className="w-full text-white font-medium py-4 rounded-sm transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: 'var(--action-primary)',
              minHeight: '52px',
              fontFamily: 'var(--font-body)',
            }}
          >
            {sending ? t('auth.sending') : t('auth.send_code_btn')}
          </button>
        </form>
      </div>
    </div>
  )
}
