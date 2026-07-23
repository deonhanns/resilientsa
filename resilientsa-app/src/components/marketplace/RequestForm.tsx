// src/components/marketplace/RequestForm.tsx
// Brief request form — auto-prefilled community info + free-text context field
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  offeringName: string
  onSubmit: (context: string) => void
  onCancel: () => void
  submitting?: boolean
  error?: string | null
}

export default function RequestForm({ offeringName, onSubmit, onCancel, submitting, error }: Props) {
  const { t } = useTranslation()
  const [context, setContext] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(context)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />

      {/* Sheet */}
      <div
        className="relative w-full sm:max-w-md rounded-t-xl sm:rounded-xl px-5 pt-6 pb-8 flex flex-col gap-4"
        style={{ backgroundColor: 'var(--canvas)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
        >
          {t('support.requestHeading', 'Request this support')}
        </h2>

        <p
          className="text-sm"
          style={{ fontFamily: 'var(--font-body)', color: 'var(--bark-500)' }}
        >
          {offeringName}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--bark-700)' }}
            >
              {t('support.requestContextLabel', 'What does your community need?')}
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              required
              placeholder={t('support.requestPlaceholder', 'Describe what your community needs and why this support would help.')}
              className="w-full px-3 py-2.5 rounded-md text-sm resize-none"
              style={{
                fontFamily: 'var(--font-body)',
                border: '1.5px solid var(--border-strong)',
                backgroundColor: 'var(--canvas-raised)',
                color: 'var(--bark-800)',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--protea)' }}
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-sm text-sm font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                border: '1.5px solid var(--border-strong)',
                backgroundColor: 'transparent',
                color: 'var(--bark-600)',
                minHeight: 44,
              }}
            >
              {t('support.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting || !context.trim()}
              className="flex-1 py-3 rounded-sm text-sm font-medium text-white transition-opacity"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: context.trim() ? 'var(--aloe)' : 'var(--bark-200)',
                minHeight: 44,
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? t('support.sending', 'Sending...') : t('support.sendRequest', 'Send request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
