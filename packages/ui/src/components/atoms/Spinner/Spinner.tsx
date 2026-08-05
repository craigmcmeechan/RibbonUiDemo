import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Spinner.css';
import type { SpinnerProps } from './Spinner.types';

export function Spinner({ className, id, label, size = 'medium' }: SpinnerProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-spinner' : `ribbon-ui-spinner ${className}`;

  return (
    <span
      aria-hidden={label === undefined ? 'true' : undefined}
      aria-label={label}
      className={classes}
      data-ribbon-ui-component="spinner"
      data-size={size}
      id={id}
      role={label === undefined ? undefined : 'status'}
    >
      <span className="ribbon-ui-spinner__ring" />
    </span>
  );
}
