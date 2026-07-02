import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * NetworkSummary — a plain-language sentence about the health of the cell's
 * connections. No graphs. It tells the Steward what is happening in words a
 * person would actually say, with one calm supporting signal.
 *
 * trend: 'growing' | 'steady' | 'thinning'
 */
const TREND = {
  growing:  { icon: 'sprout', color: 'var(--signal-success)', bg: 'var(--aloe-tint)' },
  steady:   { icon: 'users', color: 'var(--signal-info)', bg: 'var(--rain-tint)' },
  thinning: { icon: 'circle-alert', color: 'var(--signal-urgent)', bg: 'var(--ochre-tint)' },
};

export function NetworkSummary({ message, trend = 'growing', stat, style, ...rest }) {
  const t = TREND[trend] || TREND.growing;
  return (
    <div
      style={{
        display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start',
        padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
        background: t.bg, ...style,
      }}
      {...rest}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        width: 40, height: 40, borderRadius: '50%',
        background: 'var(--surface-card)', color: t.color,
      }}>
        <Icon name={t.icon} size={22} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ font: 'var(--role-body-strong)', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)' }}>{message}</div>
        {stat && <div style={{ font: 'var(--role-caption)', color: 'var(--text-secondary)' }}>{stat}</div>}
      </div>
    </div>
  );
}
