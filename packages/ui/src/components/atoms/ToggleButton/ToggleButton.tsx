import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './ToggleButton.css';
import type { ToggleButtonProps } from './ToggleButton.types';

export function ToggleButton({
  ariaDescribedBy,
  className,
  disabled = false,
  id,
  label,
  onPress,
  pressed,
  size = 'medium',
  variant = 'neutral',
}: ToggleButtonProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-toggle-button' : `ribbon-ui-toggle-button ${className}`;

  return (
    <button
      aria-describedby={ariaDescribedBy}
      aria-pressed={pressed}
      className={classes}
      data-ribbon-ui-component="toggle-button"
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
