import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Button.css';
import type { ButtonProps } from './Button.types';

export function Button({
  ariaDescribedBy,
  className,
  disabled = false,
  id,
  label,
  onPress,
  size = 'medium',
  variant = 'neutral',
}: ButtonProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-button' : `ribbon-ui-button ${className}`;

  return (
    <button
      aria-describedby={ariaDescribedBy}
      className={classes}
      data-ribbon-ui-component="button"
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      id={id}
      onClick={onPress}
      type="button"
    >
      {label}
    </button>
  );
}
