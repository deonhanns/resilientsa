import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * MemberRow — one person in the Steward's member list. A simple, calm signal
 * flags anyone who has drifted out of contact (the "isolate" flag) so the
 * Steward can reach out — warm, never punitive.
 *
 * status: 'active' | 'quiet' | 'isolate'
 */
const STATUS = {
  active:  { dot: 'var(--signal-success)', label: 'Connecting well' },
  quiet:   { dot: 'var(--signal-pending)', label: 'Quieter lately' },
  isolate: { dot: 'var(--signal-urgent)',  label: 'Out of touch' },
};

export function MemberRow({ name, place, status = 'active', connections, onReach, style, ...rest }) {
  const s = STATUS[status] || STATUS.active;
  const flag = status === 'isolate';
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: flag ? 'var(--ochre-tint)' : 'var(--surface-card)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md)', ...style,
      }}
      {...rest}
    >
      {/* avatar with status dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--surface-sunk)', color: 'var(--text-secondary)',
        }}>
          <Icon name="user-round" size={22} />
        </span>
        <span style={{
          position: 'absolute', right: -1, bottom: -1, width: 13, height: 13,
          borderRadius: '50%', background: s.dot, border: '2.5px solid var(--surface-card)',
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: 'var(--role-body-strong)', color: 'var(--text-primary)' }}>{name}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--role-caption)', color: flag ? 'var(--ochre-deep)' : 'var(--text-muted)' }}>
          {flag && <Icon name="circle-alert" size={13} />}
          {s.label}{place ? ` · ${place}` : ''}
          {!flag && connections != null && (
            <span style={{ color: 'var(--text-muted)' }}>· {connections} links</span>
          )}
        </span>
      </div>

      {flag && (
        <button type="button" onClick={onReach}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
            minHeight: 36, padding: '0 var(--space-3)', borderRadius: 'var(--radius-pill)',
            border: 'none', background: 'var(--signal-urgent)', color: 'var(--text-on-fill)',
            font: 'var(--role-label)', fontSize: 'var(--text-xs)', cursor: 'pointer',
          }}>
          <Icon name="hand-heart" size={15} />
          Reach out
        </button>
      )}
    </div>
  );
}
