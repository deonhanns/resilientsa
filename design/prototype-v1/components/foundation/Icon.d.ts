import * as React from 'react';

export type IconName =
  | 'water' | 'food' | 'health' | 'safety' | 'energy' | 'skills'
  | 'plus' | 'search' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down' | 'check' | 'bell'
  | 'users' | 'map-pin' | 'filter' | 'chevron-right' | 'x' | 'hand-heart'
  | 'user-round' | 'circle-alert' | 'sprout' | 'home' | 'message-circle'
  | 'clock' | 'circle-check';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  /** Glyph name from the Living Soil set. */
  name: IconName;
  /** Pixel size (width & height). Default 22. */
  size?: number;
  /** Stroke weight. Default 1.75 to echo the seed-in-hand linework. */
  strokeWidth?: number;
  /** Stroke colour. Default currentColor. */
  color?: string;
  /** Accessible label. Omit for decorative icons (aria-hidden applied). */
  label?: string;
}

/** A single line glyph from the Living Soil icon set. */
export function Icon(props: IconProps): JSX.Element;

export const ICON_PATHS: Record<IconName, string>;
