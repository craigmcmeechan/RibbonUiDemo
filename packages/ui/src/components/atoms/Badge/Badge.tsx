import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Badge.css';
import type { BadgeProps } from './Badge.types';

export function Badge({ className, id, label, tone = 'neutral' }: BadgeProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-badge' : `ribbon-ui-badge ${className}`;

  return (
    <span className={classes} data-ribbon-ui-component="badge" data-tone={tone} id={id}>
      {label}
    </span>
  );
}
