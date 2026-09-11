// src/components/steward-dashboard/StewardDashboard.tsx
// Cell Steward Dashboard — main screen (ORDER 007)

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, stewardApi } from '../../lib/api'
import type { StewardDashboard as DashboardData, NetworkSummary as NetworkSummaryData } from '../../lib/types'
import { PILLAR_COLOURS, PILLAR_TINTS, PILLAR_LABELS, ALL_PILLARS, type Pillar } from '../../lib/pillars'
import IsolateList from './IsolateList'
import HubList from './HubList'
import LogOfflineTrade from './LogOfflineTrade'

// Ochre — the Bones Brief's mandated colour for "attention without alarm"
// (isolate/out-of-touch flags). Never the red/rust used for real errors.
const OCHRE = '#E6A854'
const OCHRE_TINT = '#F9EFDA'

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
// Per Bones Brief: "communicate urgency without numbers — larger, ringed
// circles demand attention." No raw counts render on the circles; size
// alone carries the signal. Title attribute still exposes the count for
// accessibility/tooltip purposes without putting it in the visual itself.
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
            aria-label={`${PILLAR_LABELS[pillar]}: ${count}`}
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
            }}
          />
        )
      })}
    </div>
  )
}

// ─── Sub-component: MemberRow ───
function MemberRow({ member }: { member: DashboardData['members'][number] }) {
  const statusColor = member.recentConnections === 0 ? OCHRE :
    member.recentConnections < 3 ? OCHRE : '#4A7256'
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
        background: statusColor === OCHRE ? OCHRE_TINT : '#E4EBE5',
      }}>
        {statusLabel}
      </span>
    </div>
  )
}

// ─── Sub-component: role-gate / no-cell-yet message ───
// Per Bones Brief: a non-Steward at /steward should see a warm message,
// not a technical error. Distinct from the generic network-error state.
function InfoMessage({ message }: { message: string }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
      <p style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-secondary, #555)', margin: 0 }}>
        {message}
      </p>
    </div>
  )
}

// ─── MAIN COMPONENT ───
const DEMO_DATA: DashboardData = {
  cellName: 'Khayelitsha Cell A',
  members: [
    { id: '1', displayName: 'Thandi M.', role: 'member', recentConnections: 5, giftsProfile: { lovesToDo: 'Teaching children to read', caresDeeplyAbout: 'Clean water access' } },
    { id: '2', displayName: 'Sipho K.', role: 'member', recentConnections: 12, giftsProfile: { lovesToDo: 'Fixing things around the house', caresDeeplyAbout: 'Youth employment' } },
    { id: '3', displayName: 'Nomsa D.', role: 'member', recentConnections: 0, giftsProfile: { lovesToDo: 'Growing vegetables', caresDeeplyAbout: 'Food security for elders' } },
    { id: '4', displayName: 'Lungile P.', role: 'cell_steward', recentConnections: 8, giftsProfile: { lovesToDo: 'Connecting neighbours', caresDeeplyAbout: 'Community safety' } },
    { id: '5', displayName: 'Bongani Z.', role: 'member', recentConnections: 3, giftsProfile: null },
    { id: '6', displayName: 'Zanele R.', role: 'member', recentConnections: 0, giftsProfile: { lovesToDo: 'Cooking for large groups', caresDeeplyAbout: 'Elder care' } },
    { id: '7', displayName: 'Themba N.', role: 'member', recentConnections: 1, giftsProfile: null },
  ],
  needsRadar: { water: 4, food: 7, health: 2, safety: 1, energy: 3, skills: 0 },
  recentActivity: { newListings: 12, completedTrades: 5, newConnections: 8 },
  reciprocityFlags: [
    { memberId: '2', name: 'Sipho K.', direction: 'giving', ratio: 4 },
  ],
}

const DEMO_NETWORK_SUMMARY: NetworkSummaryData = {
  phase: 'scattered',
  trend: 'stable',
  message: "Your cell is just getting started — most members haven't connected yet.",
  stat: '8 connections this month',
  lastUpdated: new Date().toISOString(),
}

export default function StewardDashboard() {
  const { t } = useTranslation()
  const [data, setData] = useState<DashboardData | null>(null)
  const [summary, setSummary] = useState<NetworkSummaryData | null>(null)
  const [cellId, setCellId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleGated, setRoleGated] = useState(false)
  const [noCellYet, setNoCellYet] = useState(false)
  const demo = new URLSearchParams(window.location.search).has('demo')

  useEffect(() => {
    if (demo) {
      setCellId('c0000000-0000-0000-0000-000000000000')
      setData(DEMO_DATA)
      setSummary(DEMO_NETWORK_SUMMARY)
      setLoading(false)
      return
    }

    // Fetch the real cellId first — this was previously hardcoded to a
    // demo-only sentinel value even in the non-demo path, which meant
    // every real user's dashboard call targeted a cell that didn't exist
    // for them, 404'ing every time. Found via live testing 2026-09-11.
    api.get<{ role: string; cellId: string | null }>('/me')
      .then((me) => {
        if (!me.cellId) {
          setNoCellYet(true)
          setLoading(false)
          return
        }
        setCellId(me.cellId)
        return Promise.all([
          stewardApi.dashboard(me.cellId),
          stewardApi.networkSummary(me.cellId),
        ]).then(([dashboardData, summaryData]) => {
          setData(dashboardData)
          setSummary(summaryData)
        })
      })
      .catch((err) => {
        if (err.message?.includes('403')) {
          setRoleGated(true)
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [demo])

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  if (roleGated) return <InfoMessage message={t('steward.roleGateMessage', 'This area is for your Cell Steward.')} />
  if (noCellYet) return <InfoMessage message="You're not in a cell yet — once your Node Admin adds you to one, this screen will show what's happening there." />
  if (error) return <div style={{ padding: 24, color: '#C85A3C' }}>Could not load dashboard. {error}</div>
  if (!data || !cellId) return <div style={{ padding: 24, color: 'var(--text-muted)' }}>No dashboard data available.</div>

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

      {/* Network Summary — real data from /steward/network-summary/:cellId, not hardcoded */}
      {summary && (
        <NetworkSummaryCard trend={summary.trend} message={summary.message} stat={summary.stat} />
      )}

      {/* Needs Radar */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ font: 'var(--role-heading, 16px/1.4 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: 0, fontWeight: 600 }}>
            {t('steward.needs_title', 'Where the need is')}
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
            // MVP: pillar tap visual feedback only — see title/aria-label for the count
          }} />
          <p style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', textAlign: 'center', margin: '6px 0 0' }}>
            {t('steward.needsInstruction', "Tap an area to see what's unmet. Bigger circles need you most.")}
          </p>
        </div>
      </section>

      {/* Deferred sub-components: Isolates, Hubs, Log Trade */}
      <IsolateList cellId={cellId} />
      <HubList cellId={cellId} />
      <LogOfflineTrade members={data.members} cellId={cellId} />

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
            {t('steward.members_title', 'Your members')}
          </h3>
          {isolates.length > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              font: 'var(--role-caption, 12px/1.4 sans-serif)',
              color: OCHRE,
              background: OCHRE_TINT,
              padding: '2px 8px',
              borderRadius: '12px',
            }}>
              {t('steward.out_of_touch', '{{count}} out of touch', { count: isolates.length })}
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
