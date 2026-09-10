// src/components/admin/NodeAdmin.tsx
// Node & Cell Formation console (ORDER 009a). No McCoy prototype exists for
// this screen — built directly against Living Soil tokens, following the
// visual family already established in StewardDashboard.tsx (card-based
// sections, warm role-gate pattern, ochre for attention-without-alarm).

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { api, adminApi } from '../../lib/api'
import type { AdminNode, AdminCell, AdminMember } from '../../lib/types'

// ─── Shared card shell, matching StewardDashboard's section pattern ───
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--surface-card, #FBFBF9)',
      border: '1px solid var(--border-hairline, #e0e0e0)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-card, 0 2px 8px rgba(0,0,0,0.04))',
      padding: '16px 18px',
    }}>
      {children}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ font: 'var(--role-heading, 16px/1.4 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: '0 0 10px', fontWeight: 600 }}>
      {children}
    </h3>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 10,
  border: '1px solid var(--border-hairline, #e0e0e0)',
  font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-primary, #2C2A29)',
  marginBottom: 10, boxSizing: 'border-box',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px', borderRadius: 10, border: 'none',
  background: 'var(--action-primary, #4A7256)', color: '#fff',
  font: 'var(--role-body, 15px/1.5 sans-serif)', fontWeight: 500, cursor: 'pointer',
}

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle, background: 'var(--surface-sunk, #F1EFEA)', color: 'var(--text-primary, #2C2A29)',
}

// ─── Role-gate message — same warm pattern as /steward's RoleGateMessage ───
function RoleGateMessage({ message }: { message: string }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
      <p style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', color: 'var(--text-secondary, #555)', margin: 0 }}>
        {message}
      </p>
    </div>
  )
}

// ─── Regional Steward: create + list nodes ───
function RegionalConsole() {
  const { t } = useTranslation()
  const [nodes, setNodes] = useState<AdminNode[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [raCpfName, setRaCpfName] = useState('')
  const [initialAdminUserId, setInitialAdminUserId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    adminApi.listNodes().then((r) => setNodes(r.nodes)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function handleCreate() {
    setError(null)
    if (!name.trim() || !initialAdminUserId.trim()) {
      setError('Node name and the initial admin\u2019s user ID are both required.')
      return
    }
    setSubmitting(true)
    try {
      await adminApi.createNode({
        name: name.trim(),
        raCpfName: raCpfName.trim() || undefined,
        initialAdminUserId: initialAdminUserId.trim(),
      })
      setName(''); setRaCpfName(''); setInitialAdminUserId('')
      refresh()
    } catch (err: any) {
      setError(err.message?.includes('409')
        ? 'That user already holds an administrative role elsewhere.'
        : err.message?.includes('404')
          ? 'No user found with that ID.'
          : 'Could not create the node. Check the details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <SectionHeading>{t('admin.createNodeHeading', 'Create a node')}</SectionHeading>
        <input style={inputStyle} placeholder="Node name (e.g. Delft)" value={name} onChange={(e) => setName(e.target.value)} />
        <input style={inputStyle} placeholder="Resident Association / CPF name (optional)" value={raCpfName} onChange={(e) => setRaCpfName(e.target.value)} />
        <input style={inputStyle} placeholder="Initial Node Admin's user ID" value={initialAdminUserId} onChange={(e) => setInitialAdminUserId(e.target.value)} />
        {error && <p style={{ color: '#C85A3C', font: 'var(--role-caption, 12px/1.4 sans-serif)', marginBottom: 10 }}>{error}</p>}
        <button style={buttonStyle} onClick={handleCreate} disabled={submitting}>
          {submitting ? 'Creating…' : t('admin.createNodeHeading', 'Create a node')}
        </button>
      </Card>

      <section>
        <SectionHeading>{t('admin.nodesHeading', 'Your nodes')}</SectionHeading>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
        ) : nodes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No nodes yet — create the first one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nodes.map((n) => (
              <Card key={n.id}>
                <div style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', fontWeight: 500 }}>{n.name}</div>
                {n.raCpfName && (
                  <div style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)', color: 'var(--text-muted, #6B6B6B)', marginTop: 2 }}>
                    {n.raCpfName}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Node Admin: create cells, assign members, promote stewards ───
function NodeAdminConsole() {
  const { t } = useTranslation()
  const [cells, setCells] = useState<AdminCell[]>([])
  const [members, setMembers] = useState<AdminMember[]>([])
  const [loading, setLoading] = useState(true)
  const [cellName, setCellName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    Promise.all([adminApi.listCells(), adminApi.listMembers()])
      .then(([c, m]) => { setCells(c.cells); setMembers(m.members) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  async function handleCreateCell() {
    setError(null)
    if (!cellName.trim()) { setError('Cell name is required.'); return }
    setSubmitting(true)
    try {
      await adminApi.createCell(cellName.trim())
      setCellName('')
      refresh()
    } catch {
      setError('Could not create the cell. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAssignCell(userId: string, cellId: string) {
    if (!cellId) return
    await adminApi.assignCell(userId, cellId)
    refresh()
  }

  async function handleToggleSteward(userId: string, currentlyIsSteward: boolean) {
    await adminApi.setMemberRole(userId, currentlyIsSteward ? 'member' : 'cell_steward')
    refresh()
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: 24, textAlign: 'center' }}>Loading…</p>

  const unassigned = members.filter((m) => !m.cellId)
  const membersByCell = (cellId: string) => members.filter((m) => m.cellId === cellId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card>
        <SectionHeading>{t('admin.createCellHeading', 'Create a cell')}</SectionHeading>
        <input style={inputStyle} placeholder="Cell name (e.g. Cell 5 — Voorbrug)" value={cellName} onChange={(e) => setCellName(e.target.value)} />
        {error && <p style={{ color: '#C85A3C', font: 'var(--role-caption, 12px/1.4 sans-serif)', marginBottom: 10 }}>{error}</p>}
        <button style={buttonStyle} onClick={handleCreateCell} disabled={submitting}>
          {submitting ? 'Creating…' : t('admin.createCellHeading', 'Create a cell')}
        </button>
      </Card>

      {unassigned.length > 0 && (
        <section>
          <SectionHeading>{t('admin.unassignedHeading', 'Not yet in a cell')}</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unassigned.map((m) => (
              <Card key={m.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ font: 'var(--role-body, 15px/1.5 sans-serif)' }}>{m.displayName}</span>
                  <select
                    style={{ ...inputStyle, marginBottom: 0, width: 'auto' }}
                    defaultValue=""
                    onChange={(e) => handleAssignCell(m.id, e.target.value)}
                  >
                    <option value="" disabled>Assign to a cell…</option>
                    {cells.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeading>{t('admin.cellsHeading', 'Your cells')}</SectionHeading>
        {cells.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No cells yet — create the first one above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {cells.map((c) => (
              <Card key={c.id}>
                <div style={{ font: 'var(--role-body, 15px/1.5 sans-serif)', fontWeight: 500, marginBottom: 8 }}>{c.name}</div>
                {membersByCell(c.id).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', font: 'var(--role-caption, 12px/1.4 sans-serif)' }}>No members yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {membersByCell(c.id).map((m) => {
                      const isSteward = m.role === 'cell_steward'
                      return (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <span style={{ font: 'var(--role-caption, 12px/1.4 sans-serif)' }}>
                            {m.displayName}{isSteward && ' \u2014 Cell Steward'}
                          </span>
                          <button
                            style={{ ...secondaryButtonStyle, padding: '6px 10px', fontSize: 12 }}
                            onClick={() => handleToggleSteward(m.id, isSteward)}
                          >
                            {isSteward ? 'Remove as Steward' : t('admin.makeSteward', 'Make Cell Steward')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ─── MAIN COMPONENT ───
export default function NodeAdmin() {
  const { t } = useTranslation()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ role: string }>('/me')
      .then((me) => setRole(me.role))
      .catch(() => setRole(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>

  if (role !== 'regional_steward' && role !== 'node_admin') {
    return <RoleGateMessage message={t('admin.roleGateMessage', 'This area is for Node and Regional coordination.')} />
  }

  return (
    <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ font: 'var(--role-title, 18px/1.3 sans-serif)', color: 'var(--text-primary, #2C2A29)', margin: '8px 0 6px', fontWeight: 700 }}>
        {role === 'regional_steward' ? t('admin.nodesHeading', 'Your nodes') : t('admin.cellsHeading', 'Your cells')}
      </h2>
      {role === 'regional_steward' ? <RegionalConsole /> : <NodeAdminConsole />}
    </div>
  )
}
