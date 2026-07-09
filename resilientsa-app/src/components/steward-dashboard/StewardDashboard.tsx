// src/components/steward-dashboard/StewardDashboard.tsx
// Cell Steward Dashboard — main screen (ORDER 007)

import { useEffect, useState } from 'react'
import { stewardApi } from '../../lib/api'
import type { StewardDashboard as DashboardData } from '../../lib/types'
import { PILLAR_COLOURS, PILLAR_TINTS, PILLAR_LABELS, ALL_PILLARS, type Pillar } from '../../lib/pillars'

// ─── Sub-component: NetworkSummary ───
function NetworkSummaryCard({ trend, message, stat }: { trend: string; message: string; stat: string }) {
  const trendIcon = trend === 'growing' ? '↑' : trend === 'declining' ? '↓' : '→'
  const trendColor = trend === 'growing' ? '#4A7256' : trend === 'declining' ? '#C85A3C' : '#6B6B6B'
  return (
    <div style={{
      background: 'var(--surface-card, #FBFBF9)',
      border: '1px solid var(--border-hairline, #e0e0e0)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))',
      padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: '18px', color: trendColor }}>{trendIcon}</span>
        <span style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)' }}>
          {stat}
        </span>
      </div>
      <p style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: 0 }}>
        {message}
      </p>
    </div>
  )
}

// ─── Sub-component: NeedsRadar ───
function NeedsRadar({ needs, onPillar }: { needs: Record<string, number>; onPillar: (pillar: Pillar) => void }) {
  const maxNeed = Math.max(...Object.values(needs), 1)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 0' }}>
      {ALL_PILLARS.map((pillar) => {
        const count = needs[pillar] || 0
        const size = 42 + (count / maxNeed) * 38
        const hasNeed = count > 0
        return (
          <button
            key={pillar}
            onClick={() => onPillar(pillar)}
            title={`${PILLAR_LABELS[pillar]}: ${count}`}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: hasNeed ? PILLAR_COLOURS[pillar] : PILLAR_TINTS[pillar],
              border: hasNeed ? `3px solid ${PILLAR_COLOURS[pillar]}` : '2px dashed var(--border-hairline, #ccc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.15s',
              fontSize: '10px',
              fontWeight: 600,
              color: hasNeed ? '#fff' : 'var(--text-muted, #999)',
              lineHeight: 1.2,
              textAlign: 'center',
              padding: 4,
            }}
          >
            {hasNeed ? count : ''}
          </button>
        )
      })}
    </div>
  )
}

// ─── Sub-component: MemberRow ───
function MemberRow({ member }: { member: DashboardData['members'][number] }) {
  const statusColor = member.recentConnections === 0 ? '#C85A3C' :
    member.recentConnections < 3 ? '#E6A854' : '#4A7256'
  const statusLabel = member.recentConnections === 0 ? 'Out of touch' :
    member.recentConnections < 3 ? 'Quiet' : 'Active'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: 'var(--surface-card, #FBFBF9)',
      border: '1px solid var(--border-hairline, #e0e0e0)',
      borderRadius: '12px',
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        backgroundColor: statusColor, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-primary, #2C2A29)', fontWeight: 500 }}>
          {member.displayName}
        </div>
        {member.giftsProfile && (
          <div style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {member.giftsProfile.lovesToDo || member.giftsProfile.caresDeeplyAbout}
          </div>
        )}
      </div>
      <span style={{
        fontSize: '11px', color: statusColor, fontWeight: 500,
        padding: '2px 8px', borderRadius: '10px',
        background: statusColor === '#C85A3C' ? '#F5E3DC' : statusColor === '#E6A854' ? '#F9EFDA' : '#E4EBE5',
      }}>
        {statusLabel}
      </span>
    </div>
  )
}

// ─── MAIN COMPONENT ───
export default function StewardDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For MVP: hardcoded test cell ID. Real implementation gets cellId from user session.
    const testCellId = 'c0000000-0000-0000-0000-000000000000'
    stewardApi.dashboard(testCellId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (error) return <div style={{ padding: 24, color: '#C85A3C' }}>Could not load dashboard. {error}</div>
  if (!data) return <div style={{ padding: 24, color: 'var(--text-muted)' }}>No dashboard data available.</div>

  const isolates = data.members.filter((m) => m.recentConnections === 0)

  return (
    <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h2 style={{ font: 'var(--role-title, 18px/1.3 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: '8px 0 6px', fontWeight: 700 }}>
          {data.cellName}
        </h2>
        <p style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-secondary, #555)', margin: 0 }}>
          {data.recentActivity.newConnections} new connections · {data.recentActivity.completedTrades} trades this week
        </p>
      </div>

      {/* Network Summary */}
      <NetworkSummaryCard trend="stable" message="Your cell is just getting started — most members haven't connected yet." stat={`${data.recentActivity.newConnections} connections this month`} />

      {/* Needs Radar */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ font: 'var(--role-heading, 16px/1.4 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: 0, fontWeight: 600 }}>
            Where the need is
          </h3>
        </div>
        <div style={{
          background: 'var(--surface-card, #FBFBF9)',
          border: '1px solid var(--border-hairline, #e0e0e0)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))',
          padding: '18px 12px 12px',
        }}>
          <NeedsRadar needs={data.needsRadar} onPillar={(_p) => {
            // MVP: pillar tap visual feedback only — counts shown on circles
          }} />
          <p style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', textAlign: 'center', margin: '6px 0 0' }}>
            Tap an area to see what's unmet. Bigger circles need you most.
          </p>
        </div>
      </section>

      {/* Reciprocity Flags */}
      {data.reciprocityFlags.length > 0 && (
        <section>
          <h3 style={{ font: 'var(--role-heading, 16px/1.4 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: '0 0 8px', fontWeight: 600 }}>
            Balance check
          </h3>
          {data.reciprocityFlags.map((flag) => (
            <div key={flag.memberId} style={{
              padding: '10px 14px',
              background: '#F9EFDA',
              borderRadius: '10px',
              marginBottom: 6,
              font: 'var(--role-caption, 12px/1.4 sans-serif)',
              color: '#8B6914',
            }}>
              <strong>{flag.name}</strong> has been {flag.direction === 'giving' ? 'giving much more than receiving' : 'receiving much more than giving'}.
              {flag.direction === 'giving' && ' A gentle check-in may be appreciated.'}
            </div>
          ))}
        </section>
      )}

      {/* Members */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <h3 style={{ font: 'var(--role-heading, 16px/1.4 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: 0, fontWeight: 600 }}>
            Your members
          </h3>
          {isolates.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              font: 'var(--role-caption, 12px/1.4 sans-serif)',
              color: '#C85A3C',
              background: '#F5E3DC',
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {isolates.length} out of touch
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.members.map((m) => (
            <MemberRow key={m.id} member={m} />
          ))}
          {data.members.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
              No members yet — invite your community to join.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
