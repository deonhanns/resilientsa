import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PILLAR_COLOURS, PILLAR_TINTS, PILLAR_LABELS, PILLAR_ICONS, ALL_PILLARS } from '../../lib/pillars'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: { type: 'offer' | 'need'; pillar_tags: string[]; title: string }) => void
}

const ICON_MAP: Record<string, string> = {
  water: '💧', food: '🌿', health: '❤️', safety: '🛡️',
  energy: '☀️', skills: '🤝',
}

export default function CreateListingSheet({ open, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const [type, setType] = useState<'offer' | 'need'>('offer')
  const [pillar, setPillar] = useState<string | null>(null)
  const [title, setTitle] = useState('')

  if (!open) return null

  function handleSubmit() {
    if (!pillar || !title.trim()) return
    onSubmit({ type, pillar_tags: [pillar], title: title.trim() })
    setTitle('')
    setPillar(null)
    setType('offer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full rounded-t-xl px-5 pt-6 pb-8 animate-slide-up"
        style={{ backgroundColor: 'var(--canvas)', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <h2
          className="text-lg font-medium mb-5"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
        >
          {t('exchange.share_title')}
        </h2>

        {/* Type toggle: I'm offering / I need help */}
        <div className="flex mb-5 p-1 rounded-md" style={{ backgroundColor: 'var(--surface-sunk)' }}>
          <button
            onClick={() => setType('offer')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-medium transition-colors"
            style={{
              backgroundColor: type === 'offer' ? 'var(--canvas-raised)' : 'transparent',
              color: type === 'offer' ? 'var(--offer)' : 'var(--bark-600)',
              fontWeight: type === 'offer' ? 600 : 500,
              boxShadow: type === 'offer' ? '0 1px 0 rgba(44,42,41,0.04)' : 'none',
            }}
          >
            <span>↑</span> {t('exchange.im_offering')}
          </button>
          <button
            onClick={() => setType('need')}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-medium transition-colors"
            style={{
              backgroundColor: type === 'need' ? 'var(--canvas-raised)' : 'transparent',
              color: type === 'need' ? 'var(--need)' : 'var(--bark-600)',
              fontWeight: type === 'need' ? 600 : 500,
              boxShadow: type === 'need' ? '0 1px 0 rgba(44,42,41,0.04)' : 'none',
            }}
          >
            <span>↓</span> {t('exchange.i_need_help')}
          </button>
        </div>

        {/* 3×2 pillar grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {ALL_PILLARS.map((p) => (
            <button
              key={p}
              onClick={() => setPillar(p)}
              className="flex flex-col items-center gap-2 p-3 rounded-md border-2 transition-all"
              style={{
                borderColor: pillar === p ? PILLAR_COLOURS[p] : 'rgba(44,42,41,0.08)',
                backgroundColor: pillar === p ? PILLAR_TINTS[p] : 'var(--canvas-raised)',
              }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-lg"
                style={{
                  width: 40, height: 40,
                  backgroundColor: PILLAR_COLOURS[p],
                  color: 'var(--text-on-fill)',
                }}
              >
                {ICON_MAP[PILLAR_ICONS[p]] ?? '●'}
              </span>
              <span
                className="text-xs font-medium text-center"
                style={{ color: 'var(--bark-700)', fontFamily: 'var(--font-body)' }}
              >
                {PILLAR_LABELS[p]}
              </span>
            </button>
          ))}
        </div>

        {/* Description input */}
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'offer' ? t('exchange.what_offering') : t('exchange.what_needing')}
          autoFocus
          className="w-full min-h-20 rounded-md border p-4 outline-none resize-none text-base mb-4"
          style={{
            fontFamily: 'var(--font-body)',
            borderColor: 'rgba(44,42,41,0.2)',
            color: 'var(--bark-900)',
            backgroundColor: 'var(--canvas-raised)',
          }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!pillar || !title.trim()}
          className="w-full py-4 rounded-sm font-medium text-white text-sm transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: 'var(--action-primary)',
            fontFamily: 'var(--font-body)',
            minHeight: 52,
          }}
        >
          {t('exchange.post_to_cell')}
        </button>
      </div>
    </div>
  )
}
