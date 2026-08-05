import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Label.css';
import type { LabelProps } from './Label.types';

export function Label({
  className,
  htmlFor,
  id,
  text,
  variant = 'default',
}: LabelProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-label' : `ribbon-ui-label ${className}`;
  const body = text;

  if (htmlFor !== undefined) {
    return (
      <label
        className={classes}
        data-ribbon-ui-component="label"
        data-variant={variant}
        htmlFor={htmlFor}
        id={id}
      >
        {body}
      </label>
    );
  }

  return (
    <span className={classes} data-ribbon-ui-component="label" data-variant={variant} id={id}>
      {body}
    </span>
  );
}
