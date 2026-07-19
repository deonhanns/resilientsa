// src/components/steward-dashboard/IsolateList.tsx
// Filtered view of isolated members — ORDER 007 deferred sub-component
import { useEffect, useState } from 'react'
import { stewardApi } from '../../lib/api'
import type { IsolateMember } from '../../lib/types'

interface Props {
  cellId: string
}

export default function IsolateList({ cellId }: Props) {
  const [isolates, setIsolates] = useState<IsolateMember[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    stewardApi.isolates(cellId).then((data) => {
      setIsolates(data.isolates)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [cellId])

  if (loading) return null
  if (isolates.length === 0) return null

  return (
    <section>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer',
          background: '#FDF4ED', borderRadius: '12px',
          font: 'var(--role-body, 15px/1.5 sans-serif)',
          color: '#C85A3C',
        }}
      >
        <span><strong>{isolates.length}</strong> {isolates.length === 1 ? 'member' : 'members'} out of touch</span>
        <span style={{ fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isolates.map((m) => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--surface-card, #FBFBF9)',
              border: '1px solid var(--border-hairline, #e0e0e0)', borderRadius: '10px',
            }}>
              <div>
                <div style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-primary, #2C2A29)' }}>
                  {m.displayName}
                </div>
                <div style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)' }}>
                  {m.daysSinceLastConnection >= 999
                    ? 'No connections yet'
                    : `Last connected ${m.daysSinceLastConnection} day${m.daysSinceLastConnection === 1 ? '' : 's'} ago`}
                </div>
              </div>
              <button style={{
                padding: '6px 12px', border: '1px solid #C85A3C', borderRadius: '8px',
                background: 'transparent', color: '#C85A3C', cursor: 'pointer',
                font: 'var(--role-caption, 12px/1.4 sans-serif)',
              }}>
                Reach out
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
