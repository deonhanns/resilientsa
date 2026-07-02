import React from 'react';
import { Icon } from '../foundation/Icon.jsx';
import { PILLARS } from './pillarMeta.js';

/**
 * PillarTag — the colour+icon marker that identifies which pillar a listing,
 * programme, or need belongs to. Meaning survives with the label covered.
 *
 * variants:
 *  - 'solid'  filled hue, light glyph (strong identity — card headers)
 *  - 'soft'   tinted background, hue glyph+text (default — inline on cards)
 *  - 'glyph'  icon-only chip in a tinted circle (space-tight rows)
 */
export function PillarTag({ pillar, variant = 'soft', showLabel = true, size = 'md', style, ...rest }) {
  const p = PILLARS[pillar];
  if (!p) return null;

  const dims = size === 'sm'
    ? { pad: '3px 9px', gap: 5, icon: 14, font: 'var(--text-xs)', circle: 26 }
    : { pad: '5px 11px', gap: 6, icon: 17, font: 'var(--text-sm)', circle: 34 };

  if (variant === 'glyph') {
    return (
      <span
        title={p.label}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: dims.circle, height: dims.circle, borderRadius: 'var(--radius-pill)',
          background: p.tint, color: p.color, flexShrink: 0, ...style,
        }}
        {...rest}
      >
        <Icon name={p.icon} size={dims.icon} label={p.label} />
      </span>
    );
  }

  const solid = variant === 'solid';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: dims.gap,
        padding: dims.pad, borderRadius: 'var(--radius-pill)',
        background: solid ? p.color : p.tint,
        color: solid ? 'var(--text-on-fill)' : p.color,
        font: 'var(--role-label)', fontSize: dims.font,
        fontWeight: 'var(--weight-medium)', lineHeight: 1, whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >
      <Icon name={p.icon} size={dims.icon} label={showLabel ? undefined : p.label} />
      {showLabel && p.label}
    </span>
  );
}
