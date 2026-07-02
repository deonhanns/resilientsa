import React from 'react';
import { Icon } from '../foundation/Icon.jsx';
import { PILLARS, PILLAR_ORDER } from '../pillars/pillarMeta.js';

/**
 * NeedsRadar — a calm, radial read of which pillars have unmet needs right
 * now. Not a table, not a raw graph. Six pillar discs sit around a hub; a
 * disc with high unmet need fills its ring in the pillar hue and shows a
 * count. Scannable in seconds — where is the colour pooling?
 *
 * needs: { water: n, food: n, health: n, safety: n, energy: n, skills: n }
 * Level thresholds: 0 = calm, 1–2 = some, 3+ = high (ring + emphasis).
 */
export function NeedsRadar({ needs = {}, size = 260, onPillar, style, ...rest }) {
  const R = size / 2;
  const ring = R - 34;            // radius of the disc centres
  const disc = 58;
  const hub = 62;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', ...style }} {...rest}>
      {/* faint guide ring */}
      <div style={{
        position: 'absolute', inset: 34, borderRadius: '50%',
        border: '1.5px dashed var(--border-hairline)',
      }} />
      {/* hub */}
      <div style={{
        position: 'absolute', left: R - hub / 2, top: R - hub / 2, width: hub, height: hub,
        borderRadius: '50%', background: 'var(--surface-card)', border: '1px solid var(--border-hairline)',
        boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: 'var(--aloe)',
      }}>
        <Icon name="sprout" size={22} />
        <span style={{ font: 'var(--role-caption)', fontSize: 'var(--text-2xs)', color: 'var(--text-muted)', marginTop: 1 }}>cell</span>
      </div>

      {PILLAR_ORDER.map((key, i) => {
        const p = PILLARS[key];
        const count = needs[key] || 0;
        const high = count >= 3;
        const some = count >= 1;
        const angle = (-90 + i * 60) * (Math.PI / 180); // start at top, clockwise
        const cx = R + ring * Math.cos(angle) - disc / 2;
        const cy = R + ring * Math.sin(angle) - disc / 2;
        return (
          <button
            key={key} type="button" aria-label={`${p.label}: ${count} unmet`}
            onClick={() => onPillar && onPillar(key)}
            style={{
              position: 'absolute', left: cx, top: cy, width: disc, height: disc,
              borderRadius: '50%', cursor: onPillar ? 'pointer' : 'default', padding: 0,
              background: some ? p.tint : 'var(--surface-card)',
              border: high ? `2.5px solid ${p.color}` : `1.5px solid var(--border-hairline)`,
              color: some ? p.color : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: high ? 'var(--shadow-card)' : 'var(--shadow-flat)',
            }}
          >
            <Icon name={p.icon} size={26} strokeWidth={high ? 2 : 1.75} />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20,
                padding: '0 5px', borderRadius: 'var(--radius-pill)',
                background: high ? 'var(--signal-urgent)' : p.color, color: 'var(--text-on-fill)',
                font: 'var(--role-caption)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-2xs)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-page)',
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
