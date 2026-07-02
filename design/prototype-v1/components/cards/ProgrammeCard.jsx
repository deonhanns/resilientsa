import React from 'react';
import { Card } from './Card.jsx';
import { Button } from '../forms/Button.jsx';
import { PillarTag } from '../pillars/PillarTag.jsx';
import { Icon } from '../foundation/Icon.jsx';
import { PILLARS } from '../pillars/pillarMeta.js';

/**
 * ProgrammeCard — a Community Marketplace offering. Browsing for help, not a
 * directory. Leads with what it is in plain language, the pillar it serves,
 * a proof signal (how many communities used it), and who provides it (quiet).
 */
export function ProgrammeCard({
  title, pillar, summary, communitiesCount, provider, onRequest, requestLabel, style, ...rest
}) {
  const p = PILLARS[pillar];
  return (
    <Card padding="var(--space-4)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
          background: p ? p.tint : 'var(--surface-sunk)', color: p ? p.color : 'var(--text-muted)',
        }}>
          <Icon name={p ? p.icon : 'sprout'} size={24} />
        </span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ font: 'var(--role-heading)', color: 'var(--text-primary)', lineHeight: 'var(--leading-snug)' }}>{title}</div>
          <PillarTag pillar={pillar} size="sm" />
        </div>
      </div>

      {summary && (
        <div style={{ font: 'var(--role-body)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>{summary}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {communitiesCount != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--role-label)', color: 'var(--signal-success)' }}>
            <Icon name="users" size={16} />
            {communitiesCount} communities used this
          </span>
        )}
        {provider && (
          <span style={{ font: 'var(--role-caption)', color: 'var(--text-muted)' }}>by {provider}</span>
        )}
      </div>

      <Button variant="primary" fullWidth iconRight="arrow-right" onClick={onRequest}>
        {requestLabel || 'Request for our community'}
      </Button>
    </Card>
  );
}
