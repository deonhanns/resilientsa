import * as React from 'react';
import type { PillarKey } from '../pillars/PillarTag';

/**
 * A calm radial read of unmet needs by pillar — six discs around a hub,
 * emphasis and count growing with need. Not a table, not a raw graph;
 * scannable in seconds.
 *
 * @startingPoint section="Dashboard" subtitle="Unmet-needs radar by pillar" viewport="300x300"
 */
export interface NeedsRadarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unmet-need count per pillar. */
  needs?: Partial<Record<PillarKey, number>>;
  /** Overall pixel diameter. Default 260. */
  size?: number;
  onPillar?: (pillar: PillarKey) => void;
}

export function NeedsRadar(props: NeedsRadarProps): JSX.Element;
