import * as React from 'react';
import type { PillarKey } from '../pillars/PillarTag';

/**
 * A Community Marketplace offering — browsing for help, not a directory.
 * Leads with plain-language purpose, the pillar it serves, a proof signal,
 * and a quiet provider credit.
 *
 * @startingPoint section="Cards" subtitle="Marketplace programme offering" viewport="360x260"
 */
export interface ProgrammeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  pillar: PillarKey;
  /** Plain-language description, no jargon. */
  summary?: string;
  /** Proof signal — how many communities have used it. */
  communitiesCount?: number;
  /** Provider name (secondary, small). */
  provider?: string;
  requestLabel?: string;
  onRequest?: () => void;
}

export function ProgrammeCard(props: ProgrammeCardProps): JSX.Element;
