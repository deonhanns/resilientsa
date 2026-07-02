import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * EmptyState — a calm, warm nudge when there is nothing to show. Uses the
 * sprout glyph by default (growth, not absence). Never scolding.
 */
export function EmptyState({ icon = 'sprout', title, body, action, style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        gap: 'var(--space-3)', padding: 'var(--space-8) var(--space-5)', ...style,
      }}
      {...rest}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 56, height: 56, borderRadius: 'var(--radius-pill)',
        background: 'var(--aloe-tint)', color: 'var(--aloe)',
      }}>
        <Icon name={icon} size={28} />
      </span>
      {title && <div style={{ font: 'var(--role-heading)', color: 'var(--text-primary)' }}>{title}</div>}
      {body && <div style={{ font: 'var(--role-body)', color: 'var(--text-secondary)', maxWidth: 280 }}>{body}</div>}
      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
}
