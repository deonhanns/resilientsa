import React from 'react';
import { Icon } from '../foundation/Icon.jsx';

/**
 * Badge — a small status marker. Offer/Need are the core pair (Aloe/Ochre);
 * also used for pending, verified, count signals. Icon optional so it can
 * read without text.
 *
 * tone: 'offer' | 'need' | 'success' | 'pending' | 'info' | 'neutral'
 */
const TONES = {
  offer:   { fg: 'var(--offer)',  bg: 'var(--aloe-tint)',  icon: 'arrow-up' },
  need:    { fg: 'var(--need)',   bg: 'var(--ochre-tint)', icon: 'arrow-down' },
  success: { fg: 'var(--signal-success)', bg: 'var(--aloe-tint)',  icon: 'circle-check' },
  pending: { fg: 'var(--clay-deep)', bg: 'var(--clay-tint)', icon: 'clock' },
  info:    { fg: 'var(--signal-info)', bg: 'var(--rain-tint)', icon: 'circle-alert' },
  neutral: { fg: 'var(--text-secondary)', bg: 'var(--surface-sunk)', icon: null },
};

export function Badge({ tone = 'neutral', children, icon, showIcon = true, style, ...rest }) {
  const t = TONES[tone] || TONES.neutral;
  const glyph = icon || (showIcon ? t.icon : null);
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 9px', borderRadius: 'var(--radius-pill)',
        background: t.bg, color: t.fg,
        font: 'var(--role-caption)', fontWeight: 'var(--weight-semibold)',
        fontSize: 'var(--text-xs)', lineHeight: 1.2, whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      {glyph && <Icon name={glyph} size={13} />}
      {children}
    </span>
  );
}
