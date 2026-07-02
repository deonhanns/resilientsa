import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * BottomNav — the app's primary navigation. Icon + label per destination so
 * it reads without relying on the words. Active item uses Fynbos Aloe.
 *
 * items: [{ key, label, icon }]
 */
export function BottomNav({ items, active, onChange, style, ...rest }) {
  return (
    <nav
      style={{
        display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--border-hairline)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)', ...style,
      }}
      {...rest}
    >
      {items.map((it) => {
        const on = it.key === active;
        return (
          <button
            key={it.key} type="button" aria-current={on ? 'page' : undefined} aria-label={it.label}
            onClick={() => onChange && onChange(it.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: 'var(--space-2) var(--space-1) var(--space-3)', minHeight: 58,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: on ? 'var(--action-primary)' : 'var(--text-muted)',
            }}
          >
            <Icon name={it.icon} size={23} strokeWidth={on ? 2 : 1.75} />
            <span style={{ font: 'var(--role-caption)', fontWeight: on ? 'var(--weight-semibold)' : 'var(--weight-medium)' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
