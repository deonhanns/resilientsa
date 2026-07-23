// src/components/marketplace/GrounderRequests.tsx
// Grounder's incoming requests inbox
import { useState, useEffect } from 'react'
import { marketplaceApi } from '../../lib/api'
import type { GrounderRequest } from '../../lib/types'

export default function GrounderRequests() {
  const [requests, setRequests] = useState<GrounderRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function fetchRequests() {
    setLoading(true)
    setError(null)
    try {
      const res = await marketplaceApi.requests()
      setRequests(res.requests)
    } catch {
      setError('Could not load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [])

  async function handleStatusChange(engagementId: string, newStatus: string) {
    setActionError(null)
    try {
      await marketplaceApi.updateEngagement(engagementId, newStatus)
      fetchRequests()
    } catch {
      setActionError('Failed to update engagement status.')
    }
  }

  return (
    <div className="min-h-screen pb-6" style={{ backgroundColor: 'var(--canvas)' }}>
      <div className="px-5 pt-4 pb-2">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)' }}
        >
          Community Requests
        </h2>
      </div>

      {actionError && (
        <p className="px-5 text-sm mb-2" style={{ color: 'var(--protea)', fontFamily: 'var(--font-body)' }}>
          {actionError}
        </p>
      )}
      {error && (
        <p className="px-5 text-sm mb-2" style={{ color: 'var(--protea)', fontFamily: 'var(--font-body)' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center py-8" style={{ color: 'var(--bark-400)' }}>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-center py-8 px-5" style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}>
          No community requests yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3 px-5 pt-2">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-md p-4 flex flex-col gap-3"
              style={{
                backgroundColor: 'var(--canvas-raised)',
                boxShadow: '0 1px 2px rgba(44,42,41,0.05)',
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--bark-900)', fontSize: '1rem' }}>
                    {r.offeringName}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--bark-500)', fontFamily: 'var(--font-body)' }}>
                    From: {r.nodeName}
                  </p>
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor:
                      r.status === 'requested' ? 'var(--clay-tint)' :
                      r.status === 'accepted' || r.status === 'active' ? 'var(--aloe-tint)' :
                      r.status === 'completed' ? 'var(--indigo-tint)' :
                      'var(--surface-sunk)',
                    color:
                      r.status === 'requested' ? 'var(--clay)' :
                      r.status === 'accepted' || r.status === 'active' ? 'var(--aloe)' :
                      r.status === 'completed' ? 'var(--indigo)' :
                      'var(--bark-500)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {r.status}
                </span>
              </div>

              {r.requestContext && (
                <p className="text-sm" style={{ color: 'var(--bark-600)', fontFamily: 'var(--font-body)' }}>
                  "{r.requestContext}"
                </p>
              )}

              <p className="text-xs" style={{ color: 'var(--bark-400)', fontFamily: 'var(--font-body)' }}>
                Requested: {new Date(r.requestedAt).toLocaleDateString()}
              </p>

              {/* Action buttons */}
              {r.status === 'requested' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(r.id, 'accepted')}
                    className="flex-1 py-2.5 rounded-sm text-sm font-medium text-white"
                    style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--aloe)', minHeight: 40 }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(r.id, 'declined')}
                    className="flex-1 py-2.5 rounded-sm text-sm font-medium"
                    style={{
                      fontFamily: 'var(--font-body)',
                      border: '1.5px solid var(--border-strong)',
                      backgroundColor: 'transparent',
                      color: 'var(--bark-600)',
                      minHeight: 40,
                    }}
                  >
                    Decline
                  </button>
                </div>
              )}
              {r.status === 'accepted' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(r.id, 'active')}
                    className="flex-1 py-2.5 rounded-sm text-sm font-medium text-white"
                    style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--aloe)', minHeight: 40 }}
                  >
                    Mark Active
                  </button>
                </div>
              )}
              {(r.status === 'active' || r.status === 'accepted') && (
                <button
                  onClick={() => handleStatusChange(r.id, 'completed')}
                  className="w-full py-2.5 rounded-sm text-sm font-medium"
                  style={{
                    fontFamily: 'var(--font-body)',
                    border: '1.5px solid var(--aloe)',
                    backgroundColor: 'transparent',
                    color: 'var(--aloe)',
                    minHeight: 40,
                  }}
                >
                  Mark Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
