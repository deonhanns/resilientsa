import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { giftsProfileApi } from '../../lib/api'

export default function GiftsCapture() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(['', '', ''])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Load existing profile on mount
  useEffect(() => {
    giftsProfileApi.get()
      .then((profile) => {
        if (profile) {
          setAnswers([
            profile.lovesToDo || '',
            profile.naturallyGoodAt || '',
            profile.caresDeeplyAbout || '',
          ])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const questions = [
    { heading: t('gifts.q1_heading'), subtext: t('gifts.q1_subtext') },
    { heading: t('gifts.q2_heading'), subtext: t('gifts.q2_subtext') },
    { heading: t('gifts.q3_heading'), subtext: t('gifts.q3_subtext') },
  ]

  function handleNext() {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await giftsProfileApi.put({
        lovesToDo:       answers[0],
        naturallyGoodAt: answers[1],
        caresDeeplyAbout: answers[2],
      })
      setSubmitted(true)
      setTimeout(() => navigate('/trade'), 2000)
    } catch {
      // silently fail — user can retry
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  // Completion state
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas-grey text-center">
        <div className="w-full max-w-sm">
          <p
            className="text-xl leading-snug"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bark-900)',
            }}
          >
            {t('gifts.completion_message')}
          </p>
        </div>
      </div>
    )
  }

  const q = questions[step]

  return (
    <div className="min-h-screen flex flex-col px-5 bg-canvas-grey">
      {/* Minimal top bar with back arrow */}
      <div className="flex items-center h-14">
        {step > 0 && (
          <button
            onClick={handleBack}
            aria-label={t('gifts.back_btn')}
            className="flex items-center gap-1 text-sm cursor-pointer"
            style={{
              color: 'var(--bark-600)',
              fontFamily: 'var(--font-body)',
              minHeight: '44px',
            }}
          >
            ← {t('gifts.back_btn')}
          </button>
        )}
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto">
        <h1
          className="text-2xl leading-snug mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bark-900)',
          }}
        >
          {q.heading}
        </h1>
        <p
          className="text-sm mb-8"
          style={{
            color: 'rgba(44,42,41,0.6)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {q.subtext}
        </p>

        <textarea
          value={answers[step]}
          onChange={(e) => {
            const next = [...answers]
            next[step] = e.target.value
            setAnswers(next)
          }}
          placeholder=""
          autoFocus
          className="w-full min-h-32 rounded-md border p-4 outline-none resize-none text-base"
          style={{
            fontFamily: 'var(--font-body)',
            borderColor: 'rgba(44,42,41,0.2)',
            color: 'var(--bark-900)',
            backgroundColor: 'var(--canvas-raised)',
          }}
        />

        <button
          onClick={handleNext}
          disabled={!answers[step].trim() || saving}
          className="w-full mt-8 py-4 rounded-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: 'var(--action-primary)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            minHeight: '52px',
          }}
        >
          {step < 2 ? t('gifts.next_btn') : saving ? t('auth.sending') : t('gifts.submit_btn')}
        </button>
      </div>
    </div>
  )
}
