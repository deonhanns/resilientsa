import * as React from 'react';

/**
 * A plain-language sentence about the cell's connection health — the words a
 * person would actually say, with one calm supporting signal. No graphs.
 *
 * @startingPoint section="Dashboard" subtitle="Plain-language network summary" viewport="360x110"
 */
export interface NetworkSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The human sentence, e.g. "More members are connecting directly." */
  message: string;
  trend?: 'growing' | 'steady' | 'thinning';
  /** Optional quiet supporting line. */
  stat?: string;
}

export function NetworkSummary(props: NetworkSummaryProps): JSX.Element;
