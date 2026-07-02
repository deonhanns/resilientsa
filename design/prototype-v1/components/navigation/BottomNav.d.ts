import * as React from 'react';
import type { IconName } from '../foundation/Icon';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
}

/**
 * Primary bottom navigation — icon + label so it reads without the words.
 *
 * @startingPoint section="Navigation" subtitle="App bottom navigation" viewport="360x80"
 */
export interface BottomNavProps extends React.HTMLAttributes<HTMLElement> {
  items: NavItem[];
  active: string;
  onChange?: (key: string) => void;
}

export function BottomNav(props: BottomNavProps): JSX.Element;
