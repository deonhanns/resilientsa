import React from 'react';
import { Card } from './Card.jsx';
import { Badge } from '../feedback/Badge.jsx';
import { Button } from '../forms/Button.jsx';
import { PillarTag } from '../pillars/PillarTag.jsx';
import { Icon } from '../foundation/Icon.jsx';
import { PILLARS } from '../pillars/pillarMeta.js';

/**
 * ListingCard — the core Trade Exchange unit. A member's offer or need.
 * A coloured pillar strip runs down the left so the pillar reads instantly,
 * even with the labels covered. Steward mode adds a "facilitate a match" row.
 *
 * kind: 'offer' | 'need'
 */
export function ListingCard({
  title, pillar, kind = 'offer', member, place, steward = false,
  onAction, onMatch, actionLabel, style, ...rest
}) {
  const p = PILLARS[pillar];
  const accent = kind === 'offer' ? 'var(--offer)' : 'var(--need)';
  const defaultAction = kind === 'offer' ? 'I want this' : 'I can help';
  return (
    <Card padding="0" style={{ overflow: 'hidden', ...style }} {...rest}>
      <div style={{ display: 'flex' }}>
        {/* Pillar colour strip — meaning without text */}
        <div style={{ width: 6, flexShrink: 0, background: p ? p.color : 'var(--border-hairline)' }} />
        <div style={{ flex: 1, padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Badge tone={kind}>{kind === 'offer' ? 'Offering' : 'Needed'}</Badge>
              <div style={{ font: 'var(--role-heading)', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)' }}>{title}</div>
            </div>
            <PillarTag pillar={pillar} variant="glyph" />
          </div>

          {(member || place) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', font: 'var(--role-caption)', color: 'var(--text-muted)' }}>
              {member && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="user-round" size={14} />{member}
                </span>
              )}
              {place && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Icon name="map-pin" size={14} />{place}
                </span>
              )}
            </div>
          )}

          <Button variant={kind === 'offer' ? 'primary' : 'secondary'} size="md" fullWidth
            style={kind === 'need' ? { borderColor: accent, color: accent } : undefined}
            onClick={onAction}>
            {actionLabel || defaultAction}
          </Button>

          {steward && (
            <button type="button" onClick={onMatch}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                width: '100%', minHeight: 40, marginTop: -4,
                border: '1.5px dashed var(--border-strong)', borderRadius: 'var(--radius-md)',
                background: 'transparent', color: 'var(--text-secondary)',
                font: 'var(--role-label)', cursor: 'pointer',
              }}>
              <Icon name="users" size={17} />
              Match a member
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
