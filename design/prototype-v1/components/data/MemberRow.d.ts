import * as React from 'react';

/**
 * One person in the Steward's member list. A calm status dot flags anyone
 * out of touch (isolate) with a warm "reach out" action — never punitive.
 *
 * @startingPoint section="Dashboard" subtitle="Member row with isolate flag" viewport="360x76"
 */
export interface MemberRowProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  place?: string;
  status?: 'active' | 'quiet' | 'isolate';
  /** Number of direct connections (shown for active/quiet). */
  connections?: number;
  onReach?: () => void;
}

export function MemberRow(props: MemberRowProps): JSX.Element;
