import * as React from 'react';
import type { IconName } from '../foundation/Icon';

/** Calm text entry — soft surface, hairline border, never form-like. */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Leading icon name. */
  icon?: IconName;
  /** Helper text below the field. */
  hint?: string;
}

/** Single-line text input. */
export function Input(props: InputProps): JSX.Element;

/** Input preset with a search glyph and cell placeholder. */
export function SearchField(props: InputProps): JSX.Element;
