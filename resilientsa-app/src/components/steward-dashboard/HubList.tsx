// src/components/steward-dashboard/HubList.tsx
// Filtered view of high-connection-density members — ORDER 007 deferred sub-component
import { useEffect, useState } from 'react'
import { stewardApi } from '../../lib/api'
import type { HubMember } from '../../lib/types'

interface Props {
  cellId: string
}

const RISK_COLOURS: Record<string, string> = {
  none: '#4A7256',
  attention: '#E6A854',
  concern: '#C85A3C',
}

const RISK_LABELS: Record<string, string> = {
  none: 'Connecting well',
  attention: 'High load',
  concern: 'At risk of burnout',
}

export default function HubList({ cellId }: Props) {
  const [hubs, setHubs] = useState<HubMember[]>([])
  const [burnoutRisk, setBurnoutRisk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    stewardApi.hubs(cellId).then((data) => {
      setHubs(data.hubs)
      setBurnoutRisk(data.burnoutRisk)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [cellId])

  if (loading) return null
  if (hubs.length === 0 && !burnoutRisk) return null

  return (
    <section>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', border: 'none', cursor: 'pointer',
          background: '#F0F4EE', borderRadius: '12px',
          font: 'var(--role-body, 15px/1.5 sans-serif)',
          color: '#4A7256',
        }}
      >
        <span><strong>{hubs.length}</strong> key {hubs.length === 1 ? 'connector' : 'connectors'} in your cell</span>
        <span style={{ fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {burnoutRisk && (
            <div style={{
              padding: '10px 14px', background: '#F9EFDA', borderRadius: '10px',
              font: 'var(--role-caption, 12px/1.4 sans-serif)', color: '#8B6914',
            }}>
              You're one of the most connected members. Consider sharing the connecting role with others — the network depends on more than one hub.
            </div>
          )}
          {hubs.map((hub) => (
            <div key={hub.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--surface-card, #FBFBF9)',
              border: '1px solid var(--border-hairline, #e0e0e0)', borderRadius: '10px',
            }}>
              <div>
                <div style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-primary, #2C2A29)' }}>
                  {hub.displayName}
                </div>
                <div style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)' }}>
                  {hub.connectionCount} connection{hub.connectionCount === 1 ? '' : 's'}
                </div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '8px',
                background: `${RISK_COLOURS[hub.risk]}20`,
                color: RISK_COLOURS[hub.risk],
                font: 'var(--role-caption, 12px/1.4 sans-serif)',
              }}>
                {RISK_LABELS[hub.risk]}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
