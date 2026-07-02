import React from 'react';
import { IconButton } from '../forms/Button.jsx';

/**
 * AppBar — the top bar of a phone screen. Warm, quiet. Optional back button,
 * title (Ubuntu), and a trailing action (e.g. notifications).
 */
export function AppBar({ title, onBack, trailing, style, ...rest }) {
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        minHeight: 56, padding: '0 var(--space-3)',
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border-hairline)', ...style,
      }}
      {...rest}
    >
      {onBack && <IconButton icon="arrow-left" label="Back" onClick={onBack} />}
      <div style={{
        flex: 1, font: 'var(--role-title)', fontSize: 'var(--text-xl)',
        color: 'var(--text-primary)',
        paddingLeft: onBack ? 0 : 'var(--space-2)', textAlign: onBack ? 'center' : 'left',
      }}>
        {title}
      </div>
      <div style={{ minWidth: onBack ? 44 : undefined, display: 'flex', justifyContent: 'flex-end' }}>
        {trailing}
      </div>
    </header>
  );
}
