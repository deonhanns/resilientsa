import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { getSession } from '../../lib/session'
import { addToOutbox } from '../../lib/outbox'
import ListingCard from './ListingCard'
import PillarFilterRow from './PillarFilterRow'
import CreateListingSheet from './CreateListingSheet'

interface Listing {
  id: string
  type: 'offer' | 'need'
  pillarTags: string[]
  title: string
  description: string | null
  status: string
  userId: string
  nodeId: string
  cellId: string
  createdAt: string
}

export default function TradeExchange() {
  const { t } = useTranslation()
  const [filterType, setFilterType] = useState('all')
  const [filterPillar, setFilterPillar] = useState('all')
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [role, setRole] = useState<string>('member')
  const [cellId, setCellId] = useState<string | null>(null)

  useEffect(() => {
    getSession().then((s) => {
      if (s) setRole(s.role)
    })
  }, [])

  useEffect(() => {
    if (!cellId) return
    setLoading(true)
    api.get<any[]>(`/listings?cell_id=${cellId}`)
      .then((rows) => {
        setListings(rows)
        // Cache in IndexedDB for offline use
        import('../../lib/outbox').then(() => {})
      })
      .catch(() => setLoading(false))
  }, [cellId])

  // Get cell from session on mount
  useEffect(() => {
    const demo = new URLSearchParams(window.location.search).has('demo')
    if (demo) {
      setCellId('demo-cell')
      setLoading(false)
      return
    }
    api.get<{ nodeId?: string }>('/api/me')
      .then(() => {
        setCellId('default')
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = listings.filter((l) => {
    const typeMatch = filterType === 'all' || l.type === filterType
    const pillarMatch = filterPillar === 'all' || l.pillarTags.includes(filterPillar)
    return typeMatch && pillarMatch
  })

  async function handleCreate(data: { type: 'offer' | 'need'; pillar_tags: string[]; title: string }) {
    const payload = { ...data, description: '' }
    try {
      const created = await api.post<Listing>('/listings', payload)
      setListings((prev) => [created, ...prev])
    } catch {
      // Offline — add to outbox, show optimistically
      const tempId = crypto.randomUUID()
      await addToOutbox('/listings', 'POST', payload)
      setListings((prev) => [
        {
          id: tempId, type: data.type, pillarTags: data.pillar_tags,
          title: data.title, description: '', status: 'open',
          userId: 'pending', nodeId: '', cellId: '', createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    }
  }

  if (!cellId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-canvas-grey text-center">
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--bark-600)' }}>
          {t('exchange.no_cell_yet')}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
      {/* Filter tabs */}
      <div style={{ padding: '4px 20px 14px' }}>
        <div
          role="tablist"
          className="grid grid-cols-3 gap-1 p-1 rounded-md"
          style={{ backgroundColor: 'var(--surface-sunk)' }}
        >
          {[
            { key: 'all', label: t('exchange.filter_all'), icon: '' },
            { key: 'offer', label: t('exchange.filter_offer'), icon: '↑' },
            { key: 'need', label: t('exchange.filter_need'), icon: '↓' },
          ].map((opt) => {
            const active = filterType === opt.key
            return (
              <button
                key={opt.key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilterType(opt.key)}
                className="inline-flex items-center justify-center gap-2 py-2.5 rounded-sm text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--canvas-raised)' : 'transparent',
                  color: active
                    ? (opt.key === 'offer' ? 'var(--offer)' : opt.key === 'need' ? 'var(--need)' : 'var(--action-primary)')
                    : 'var(--bark-600)',
                  fontWeight: active ? 600 : 500,
                  boxShadow: active ? '0 1px 0 rgba(44,42,41,0.04)' : 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pillar filter row */}
      <PillarFilterRow value={filterPillar} onChange={setFilterPillar} />

      {/* Listing feed */}
      <div className="flex flex-col gap-3 px-5 pt-3.5">
        {loading ? (
          <p className="text-center py-8" style={{ color: 'var(--bark-400)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}>
            {listings.length === 0 ? t('exchange.empty_cell') : t('exchange.empty_offer')}
          </div>
        ) : (
          filtered.map((l) => (
            <ListingCard
              key={l.id}
              title={l.title}
              pillar={l.pillarTags[0] ?? 'skills'}
              type={l.type}
              member="Cell member"
              place="Cell"
              steward={role === 'cell_steward' && l.type === 'need'}
              pendingSync={l.userId === 'pending'}
              onAction={() => {}}
              onMatch={() => {}}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg text-2xl transition-transform hover:scale-105"
        style={{ backgroundColor: 'var(--action-primary)' }}
      >
        +
      </button>

      <CreateListingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
