import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './ColorSwatch.css';
import type { ColorSwatchProps } from './ColorSwatch.types';

export function ColorSwatch({
  className,
  color,
  id,
  label,
  shape = 'square',
  size = 'medium',
}: ColorSwatchProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-color-swatch' : `ribbon-ui-color-swatch ${className}`;

  return (
    <span
      aria-hidden={label === undefined ? 'true' : undefined}
      aria-label={label}
      className={classes}
      data-ribbon-ui-component="color-swatch"
      data-shape={shape}
      data-size={size}
      id={id}
      role={label === undefined ? undefined : 'img'}
      style={{ backgroundColor: color }}
    />
  );
}
