import React from 'react';
import { Icon } from '../foundation/Icon.jsx';
import { PILLARS, PILLAR_LIST } from './pillarMeta.js';

/**
 * PillarButton — a large, tappable pillar selector. The primary way a
 * community member answers "what kind of support?". Icon-forward so it
 * works without reading. Meets the 44px+ tap-target rule with room to spare.
 */
export function PillarButton({ pillar, selected = false, onClick, style, ...rest }) {
  const p = PILLARS[pillar];
  if (!p) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={p.label}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--space-2)', width: '100%', minHeight: 104,
        padding: 'var(--space-4) var(--space-3)',
        border: selected ? `2px solid ${p.color}` : '1.5px solid var(--border-hairline)',
        borderRadius: 'var(--radius-lg)',
        background: p.tint,
        color: 'var(--text-primary)', cursor: 'pointer',
        boxShadow: selected ? 'var(--shadow-card)' : 'var(--shadow-flat)',
        transition: 'background .15s ease, border-color .15s ease, transform .1s ease',
        ...style,
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      {...rest}
    >
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 'var(--radius-pill)',
          background: p.color, color: 'var(--text-on-fill)',
          boxShadow: '0 2px 6px ' + p.color + '38',
        }}
      >
        <Icon name={p.icon} size={30} />
      </span>
      <span style={{ font: 'var(--role-label)', fontSize: 'var(--text-sm)', fontWeight: selected ? 'var(--weight-semibold)' : 'var(--weight-medium)', textAlign: 'center' }}>{p.label}</span>
    </button>
  );
}

/**
 * PillarGrid — the canonical 6-up grid of pillar buttons.
 */
export function PillarGrid({ selected, onSelect, columns = 3, style, ...rest }) {
  return (
    <div
      role="group"
      style={{
        display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 'var(--space-3)', ...style,
      }}
      {...rest}
    >
      {PILLAR_LIST.map((p) => (
        <PillarButton
          key={p.key}
          pillar={p.key}
          selected={selected === p.key}
          onClick={() => onSelect && onSelect(p.key)}
        />
      ))}
    </div>
  );
}
