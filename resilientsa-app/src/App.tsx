import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ALL_PILLARS, PILLAR_LABELS } from './lib/pillars'

// ORDER 002 verification: log ALL_PILLARS on mount
console.log('ORDER 002 VERIFY — ALL_PILLARS:', ALL_PILLARS)
console.log('ORDER 002 VERIFY — PILLAR_LABELS:', PILLAR_LABELS)

function HomePage() {
  const { t, i18n } = useTranslation()

  console.log('ORDER 002 VERIFY — i18n language:', i18n.language)
  console.log('ORDER 002 VERIFY — t("nav.exchange"):', t('nav.exchange'))

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Tailwind utility check: bg-pillar-water should be #3D6B8C */}
      <div className="bg-pillar-water text-white p-4 rounded-lg mb-4">
        <h1 className="font-heading text-lg font-bold">
          Community Hub — ORDER 002 scaffold
        </h1>
        <p className="font-body text-sm mt-2">
          bg-pillar-water utility check (should be Rainwater Blue #3D6B8C)
        </p>
      </div>

      {/* CSS token check: --pillar-health should be #B24C63 */}
      <div
        className="p-4 rounded-lg mb-4 text-white"
        style={{ backgroundColor: 'var(--pillar-health)' }}
      >
        <p className="font-body">
          --pillar-health token check (should be Protea Rose #B24C63)
        </p>
      </div>

      {/* i18n check */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <p className="font-body text-sm" style={{ color: 'var(--bark-900)' }}>
          i18n check — nav.exchange: <strong>{t('nav.exchange')}</strong>
        </p>
        <p className="font-body text-sm mt-1" style={{ color: 'var(--bark-600)' }}>
          Language: {i18n.language}
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/trade"   element={<div>Trade Exchange — ORDER 006</div>} />
        <Route path="/support" element={<div>Community Marketplace — ORDER 008</div>} />
        <Route path="/profile" element={<div>Gifts Profile — ORDER 005</div>} />
        <Route path="/steward" element={<div>Steward Dashboard — ORDER 007</div>} />
        <Route path="/admin"   element={<div>Node Admin — Phase 2</div>} />
      </Routes>
    </BrowserRouter>
  )
}
