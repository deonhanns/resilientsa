import * as React from 'react';

/** Base Living Soil surface — soft raised card on Canvas Grey. */
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  /** CSS padding value. Default var(--space-4). */
  padding?: string;
  /** Adds press feedback + pointer cursor. */
  interactive?: boolean;
}

export function Card(props: CardProps): JSX.Element;
