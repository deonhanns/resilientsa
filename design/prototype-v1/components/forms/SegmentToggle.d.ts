import * as React from 'react';
import type { IconName } from '../foundation/Icon';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: IconName;
  /** Colour applied to the active segment (e.g. Ochre for "Need"). */
  activeColor?: string;
}

/** Two/three-way switch — chiefly the Offer/Need choice. */
export interface SegmentToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  options: SegmentOption[];
  value: string;
  onChange?: (value: string) => void;
}

export function SegmentToggle(props: SegmentToggleProps): JSX.Element;
