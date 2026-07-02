import * as React from 'react';
import type { IconName } from '../foundation/Icon';

/** Warm, growth-framed empty state — never scolding. */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName;
  title?: string;
  body?: string;
  /** Optional action node (e.g. a Button). */
  action?: React.ReactNode;
}

export function EmptyState(props: EmptyStateProps): JSX.Element;
