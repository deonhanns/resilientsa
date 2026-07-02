import * as React from 'react';
import type { PillarKey } from '../pillars/PillarTag';

/**
 * The core Trade Exchange unit — a member's offer or need. A left colour
 * strip and glyph make the pillar read before any word does. Steward mode
 * reveals a "match a member" action.
 *
 * @startingPoint section="Cards" subtitle="Trade Exchange listing (offer/need)" viewport="360x220"
 */
export interface ListingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  pillar: PillarKey;
  kind?: 'offer' | 'need';
  /** Member name (secondary). */
  member?: string;
  /** Place / cell (secondary). */
  place?: string;
  /** Steward view — adds facilitate-a-match action. */
  steward?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  onMatch?: () => void;
}

export function ListingCard(props: ListingCardProps): JSX.Element;
