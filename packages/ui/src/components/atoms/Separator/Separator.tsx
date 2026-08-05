import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Separator.css';
import type { SeparatorProps } from './Separator.types';

export function Separator({
  className,
  id,
  orientation = 'vertical',
}: SeparatorProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-separator' : `ribbon-ui-separator ${className}`;

  return (
    <span
      aria-hidden="true"
      className={classes}
      data-ribbon-ui-component="separator"
      data-orientation={orientation}
      id={id}
    />
  );
}
