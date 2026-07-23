// src/components/marketplace/GrounderOfferings.tsx
// Grounder's own offering management view
import { useState, useEffect } from 'react'
import { marketplaceApi } from '../../lib/api'
import type { GrounderOffering } from '../../lib/types'

export default function GrounderOfferings() {
  const [offerings, setOfferings] = useState<GrounderOffering[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formPillars, setFormPillars] = useState<string[]>([])
  const [formSubmitting, setFormSubmitting] = useState(false)

  async function fetchOfferings() {
    setLoading(true)
    setError(null)
    try {
      const res = await marketplaceApi.myOfferings()
      setOfferings(res.offerings)
    } catch {
      setError('Could not load your offerings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOfferings() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!formName || formPillars.length === 0) return
    setFormSubmitting(true)
    try {
      await marketplaceApi.createOffering({
        name: formName,
        shortDescription: formDesc,
        pillarTags: formPillars,
      })
      setShowCreate(false)
      setFormName('')
      setFormDesc('')
      setFormPillars([])
      fetchOfferings()
    } catch {
      setError('Failed to create offering.')
    } finally {
      setFormSubmitting(false)
    }
  }

  const PILLARS = ['water', 'food', 'health', 'safety', 'energy', 'skills']

  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
        >
          Your Programme Offerings
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-sm text-sm font-medium text-white"
          style={{
            fontFamily: 'var(--font-body)',
            backgroundColor: 'var(--aloe)',
            minHeight: 44,
          }}
        >
          + New Offering
        </button>
      </div>

      {error && (
        <p className="px-5 text-sm" style={{ color: 'var(--protea)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center py-8" style={{ color: 'var(--bark-400)' }}>
          Loading...
        </p>
      ) : offerings.length === 0 ? (
        <p className="text-center py-8 px-5" style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}>
          You haven't created any offerings yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-2">
          {offerings.map((o) => (
            <div
              key={o.id}
              className="rounded-md p-4 flex flex-col gap-2"
              style={{
                backgroundColor: 'var(--canvas-raised)',
                boxShadow: '0 1px 2px rgba(44,42,41,0.05)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)', fontSize: '1rem' }}>
                    {o.name}
                  </h3>
                  {o.shortDescription && (
                    <p className="text-sm mt-1" style={{ color: 'var(--bark-500)' }}>{o.shortDescription}</p>
                  )}
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: o.status === 'active' ? 'var(--aloe-tint)' : 'var(--clay-tint)',
                    color: o.status === 'active' ? 'var(--aloe)' : 'var(--clay)',
                  }}
                >
                  {o.status}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {o.pillarTags.map((p) => (
                  <span
                    key={p}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: 'var(--surface-sunk)', color: 'var(--bark-500)' }}
                  >
                    {p}
                  </span>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'var(--bark-400)' }}>
                {o.engagementCount} {o.engagementCount === 1 ? 'engagement' : 'engagements'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create form modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreate(false)} />
          <div
            className="relative w-full sm:max-w-md rounded-t-xl sm:rounded-xl px-5 pt-6 pb-8 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--canvas)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)', fontSize: '1.125rem' }}>
              New Programme Offering
            </h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="Offering name"
                className="w-full px-3 py-2.5 rounded-md text-sm"
                style={{
                  fontFamily: 'var(--font-body)',
                  border: '1.5px solid var(--border-strong)',
                  backgroundColor: 'var(--canvas-raised)',
                }}
              />
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={2}
                placeholder="Short description"
                className="w-full px-3 py-2.5 rounded-md text-sm resize-none"
                style={{
                  fontFamily: 'var(--font-body)',
                  border: '1.5px solid var(--border-strong)',
                  backgroundColor: 'var(--canvas-raised)',
                }}
              />
              <div>
                <p className="text-sm mb-2" style={{ color: 'var(--bark-600)' }}>Pillars (select at least one):</p>
                <div className="flex flex-wrap gap-2">
                  {PILLARS.map((p) => {
                    const active = formPillars.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormPillars((prev) =>
                          active ? prev.filter((x) => x !== p) : [...prev, p]
                        )}
                        className="px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer"
                        style={{
                          backgroundColor: active ? 'var(--pillar-' + p + ')' : 'var(--surface-sunk)',
                          color: active ? '#fff' : 'var(--bark-500)',
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-sm text-sm font-medium"
                  style={{ border: '1.5px solid var(--border-strong)', backgroundColor: 'transparent', color: 'var(--bark-600)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting || !formName || formPillars.length === 0}
                  className="flex-1 py-3 rounded-sm text-sm font-medium text-white"
                  style={{ backgroundColor: formName ? 'var(--aloe)' : 'var(--bark-200)' }}>
                  {formSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
