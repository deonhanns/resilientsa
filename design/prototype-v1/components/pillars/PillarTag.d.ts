import * as React from 'react';

export type PillarKey = 'water' | 'food' | 'health' | 'safety' | 'energy' | 'skills';

/**
 * The colour+icon marker that names a listing's pillar. Meaning reads
 * before the word does — pillar identity is carried by hue and glyph.
 *
 * @startingPoint section="Pillars" subtitle="Colour+icon pillar marker" viewport="360x120"
 */
export interface PillarTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which of the six pillars. */
  pillar: PillarKey;
  /** solid = filled hue · soft = tinted (default) · glyph = icon-only circle. */
  variant?: 'solid' | 'soft' | 'glyph';
  /** Show the word alongside the icon. Default true (ignored by 'glyph'). */
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/** Colour+icon marker identifying a listing's pillar. */
export function PillarTag(props: PillarTagProps): JSX.Element;
