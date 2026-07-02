import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * SegmentToggle — a two- or three-way switch. Its main job in Living Soil is
 * the Offer / Need choice: a listing is either something given (Aloe) or
 * something asked for (Ochre). Colour reinforces the meaning.
 *
 * options: [{ value, label, icon?, activeColor? }]
 */
export function SegmentToggle({ options, value, onChange, style, ...rest }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        gap: 'var(--space-1)', padding: 'var(--space-1)',
        background: 'var(--surface-sunk)', borderRadius: 'var(--radius-md)', ...style,
      }}
      {...rest}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        const accent = opt.activeColor || 'var(--action-primary)';
        return (
          <button
            key={opt.value} type="button" role="tab" aria-selected={active}
            onClick={() => onChange && onChange(opt.value)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-2)', minHeight: 40, border: 'none', cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--surface-card)' : 'transparent',
              color: active ? accent : 'var(--text-secondary)',
              font: 'var(--role-label)', fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              boxShadow: active ? 'var(--shadow-flat)' : 'none',
              transition: 'color .15s ease, background .15s ease',
            }}
          >
            {opt.icon && <Icon name={opt.icon} size={17} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
