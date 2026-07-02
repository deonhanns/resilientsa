import * as React from 'react';
import type { IconName } from '../foundation/Icon';

/**
 * Small status marker. Offer/Need is the core pair; also pending, success,
 * info, count signals. Reads with or without its label.
 *
 * @startingPoint section="Feedback" subtitle="Offer / Need / status badges" viewport="360x120"
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'offer' | 'need' | 'success' | 'pending' | 'info' | 'neutral';
  /** Override the tone's default icon. */
  icon?: IconName;
  /** Hide the icon entirely. Default true. */
  showIcon?: boolean;
}

export function Badge(props: BadgeProps): JSX.Element;
