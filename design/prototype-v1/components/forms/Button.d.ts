import * as React from 'react';
import type { IconName } from '../foundation/Icon';

/**
 * The Living Soil action button. Primary is Fynbos Aloe; urgent is Ochre
 * Earth. Warm, solid, generous tap area.
 *
 * @startingPoint section="Forms" subtitle="Buttons — primary, secondary, ghost, urgent" viewport="360x180"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'urgent';
  size?: 'md' | 'lg';
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
  fullWidth?: boolean;
}

/** Primary action control. */
export function Button(props: ButtonProps): JSX.Element;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Accessible label — required, icon-only control. */
  label: string;
  variant?: 'quiet' | 'soft';
  size?: number;
}

/** Square icon-only button for bars and quick actions. */
export function IconButton(props: IconButtonProps): JSX.Element;
