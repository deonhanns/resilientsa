import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * Button — the Living Soil action. Primary uses Fynbos Aloe. Warm, solid,
 * generous. Never pure black or white. Min tap height 44px (lg = 52px).
 *
 * variants: 'primary' | 'secondary' | 'ghost' | 'urgent'
 * sizes:    'md' | 'lg'
 */
export function Button({
  children, variant = 'primary', size = 'md', icon, iconRight,
  fullWidth = false, disabled = false, style, ...rest
}) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 'var(--space-2)', width: fullWidth ? '100%' : undefined,
    minHeight: size === 'lg' ? 52 : 44,
    padding: size === 'lg' ? '0 var(--space-6)' : '0 var(--space-5)',
    borderRadius: 'var(--radius-md)',
    font: 'var(--role-body-strong)', fontSize: size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
    cursor: disabled ? 'not-allowed' : 'pointer', border: '1.5px solid transparent',
    transition: 'background .15s ease, border-color .15s ease, transform .08s ease, opacity .15s ease',
    opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap', userSelect: 'none',
  };
  const skins = {
    primary:   { background: 'var(--action-primary)', color: 'var(--text-on-fill)' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', borderColor: 'var(--border-strong)' },
    ghost:     { background: 'transparent', color: 'var(--action-primary)' },
    urgent:    { background: 'var(--signal-urgent)', color: 'var(--text-on-fill)' },
  };
  const press = (e, down) => { if (!disabled) e.currentTarget.style.transform = down ? 'scale(0.97)' : 'scale(1)'; };
  return (
    <button
      type="button" disabled={disabled}
      style={{ ...base, ...skins[variant], ...style }}
      onMouseDown={(e) => press(e, true)}
      onMouseUp={(e) => press(e, false)}
      onMouseLeave={(e) => press(e, false)}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 20 : 18} />}
    </button>
  );
}

/**
 * IconButton — square tappable icon. For app bars, dismissals, quick actions.
 */
export function IconButton({ icon, label, variant = 'quiet', size = 44, style, ...rest }) {
  const skins = {
    quiet: { background: 'transparent', color: 'var(--text-primary)' },
    soft:  { background: 'var(--surface-sunk)', color: 'var(--text-primary)' },
  };
  return (
    <button
      type="button" aria-label={label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: size, height: size, borderRadius: 'var(--radius-pill)',
        border: 'none', cursor: 'pointer', flexShrink: 0, ...skins[variant], ...style,
      }}
      {...rest}
    >
      <Icon name={icon} size={22} label={label} />
    </button>
  );
}
