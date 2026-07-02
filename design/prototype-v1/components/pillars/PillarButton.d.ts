import * as React from 'react';
import type { PillarKey } from './PillarTag';

/**
 * A large, icon-forward pillar selector. The main way a member picks a
 * kind of support — readable without text, tap target well over 44px.
 *
 * @startingPoint section="Pillars" subtitle="Six-pillar selector grid" viewport="360x260"
 */
export interface PillarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pillar: PillarKey;
  selected?: boolean;
}

/** One large tappable pillar tile. */
export function PillarButton(props: PillarButtonProps): JSX.Element;

export interface PillarGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Currently selected pillar key, if any. */
  selected?: PillarKey;
  onSelect?: (pillar: PillarKey) => void;
  /** Grid columns. Default 3 (a 3×2 of the six pillars). */
  columns?: number;
}

/** The canonical six-pillar grid. */
export function PillarGrid(props: PillarGridProps): JSX.Element;
