// src/components/steward-dashboard/LogOfflineTrade.tsx
// Manual ledger entry for face-to-face trades — ORDER 007 deferred sub-component
import { useState, useEffect } from 'react'
import { stewardApi } from '../../lib/api'
import { ALL_PILLARS, PILLAR_LABELS, PILLAR_COLOURS, type Pillar } from '../../lib/pillars'
import type { MemberRow } from '../../lib/types'

interface Props {
  members: MemberRow[]
  cellId: string
}

export default function LogOfflineTrade({ members, cellId }: Props) {
  const [open, setOpen] = useState(false)
  const [offeringParty, setOfferingParty] = useState('')
  const [needingParty, setNeedingParty] = useState('')
  const [pillar, setPillar] = useState<Pillar | ''>('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setDone(false), 3000)
      return () => clearTimeout(t)
    }
  }, [done])

  const submit = async () => {
    if (!offeringParty || !needingParty || !pillar || !description) return
    setSubmitting(true)
    try {
      await stewardApi.logOfflineTrade({ cellId, description, pillar, offeringParty, needingParty })
      setDone(true)
      setOpen(false)
      setOfferingParty('')
      setNeedingParty('')
      setPillar('')
      setDescription('')
    } catch (err) {
      console.error('Failed to log offline trade:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      {done && (
        <div style={{
          padding: '10px 14px', background: '#E8F0EA', borderRadius: '10px',
          font: 'var(--role-caption, 12px/1.4 sans-serif)', color: '#4A7256',
          marginBottom: 8,
        }}>
          Trade logged — your cell's connections are up to date.
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '12px 16px', border: '2px dashed #ccc', cursor: 'pointer',
          background: 'transparent', borderRadius: '12px',
          font: 'var(--role-body, 15px/1.5 sans-serif)',
          color: 'var(--text-muted, #6B6B6B)',
        }}
      >
        <span>+ Log a trade that happened face-to-face</span>
      </button>

      {open && (
        <div style={{
          marginTop: 10, padding: '16px',
          background: 'var(--surface-card, #FBFBF9)',
          border: '1px solid var(--border-hairline, #e0e0e0)',
          borderRadius: '12px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <label style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', display: 'block', marginBottom: 4 }}>
              Who offered?
            </label>
            <select value={offeringParty} onChange={(e) => setOfferingParty(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', font: 'var(--role-body, 15px/1.5 sans-serif)' }}>
              <option value="">Select a member</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', display: 'block', marginBottom: 4 }}>
              Who received?
            </label>
            <select value={needingParty} onChange={(e) => setNeedingParty(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', font: 'var(--role-body, 15px/1.5 sans-serif)' }}>
              <option value="">Select a member</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
            </select>
          </div>

          <div>
            <label style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', display: 'block', marginBottom: 4 }}>
              What pillar?
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {ALL_PILLARS.map((p) => (
                <button key={p} onClick={() => setPillar(p)}
                  style={{
                    padding: '6px 12px', borderRadius: '8px', border: pillar === p ? `2px solid ${PILLAR_COLOURS[p]}` : '1px solid #ccc',
                    background: pillar === p ? `${PILLAR_COLOURS[p]}18` : 'white',
                    font: 'var(--role-caption, 12px/1.4 sans-serif)', cursor: 'pointer',
                    color: pillar === p ? PILLAR_COLOURS[p] : 'var(--text-muted)',
                  }}>
                  {PILLAR_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', display: 'block', marginBottom: 4 }}>
              Describe what was traded
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. Nomsa gave Thabo 20L of water during last week's outage"
              style={{
                width: '100%', minHeight: 60, padding: '8px 12px', borderRadius: '8px',
                border: '1px solid #ccc', font: 'var(--role-body, 15px/1.5 sans-serif)',
                resize: 'vertical',
              }} />
          </div>

          <button onClick={submit} disabled={submitting || !offeringParty || !needingParty || !pillar || !description}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: 'none',
              background: submitting ? '#ccc' : '#4A7256', color: 'white',
              font: 'var(--role-body, 15px/1.5 sans-serif)', cursor: submitting ? 'default' : 'pointer',
            }}>
            {submitting ? 'Logging...' : 'Log trade'}
          </button>
        </div>
      )}
    </section>
  )
}
