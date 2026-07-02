import * as React from 'react';

/** Top bar of a phone screen — optional back, Ubuntu title, trailing action. */
export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  /** Show a back button and handle it. */
  onBack?: () => void;
  /** Trailing node (e.g. an IconButton). */
  trailing?: React.ReactNode;
}

export function AppBar(props: AppBarProps): JSX.Element;
