import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * Input / SearchField — plain, calm text entry. Nothing that reads as a
 * government form: soft surface, hairline border, roomy padding.
 */
export function Input({ label, icon, hint, value, style, id, ...rest }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <label htmlFor={inputId} style={{ display: 'block', ...style }}>
      {label && (
        <span style={{ display: 'block', font: 'var(--role-label)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
          {label}
        </span>
      )}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--text-muted)', display: 'inline-flex' }}>
            <Icon name={icon} size={19} />
          </span>
        )}
        <input
          id={inputId} value={value}
          style={{
            width: '100%', minHeight: 48, boxSizing: 'border-box',
            padding: icon ? '0 var(--space-4) 0 42px' : '0 var(--space-4)',
            borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-hairline)',
            background: 'var(--surface-card)', color: 'var(--text-primary)',
            font: 'var(--role-body)', outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--signal-info)'; e.target.style.boxShadow = 'var(--focus-ring)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-hairline)'; e.target.style.boxShadow = 'none'; }}
          {...rest}
        />
      </span>
      {hint && <span style={{ display: 'block', font: 'var(--role-caption)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>{hint}</span>}
    </label>
  );
}

export function SearchField(props) {
  return <Input icon="search" placeholder="Search your cell…" aria-label="Search" {...props} />;
}
