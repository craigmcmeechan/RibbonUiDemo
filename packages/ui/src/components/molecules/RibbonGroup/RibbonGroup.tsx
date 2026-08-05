import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './RibbonGroup.css';
import type { RibbonGroupProps } from './RibbonGroup.types';

export function RibbonGroup({ children, className, id, label }: RibbonGroupProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-ribbon-group' : `ribbon-ui-ribbon-group ${className}`;

  return (
    <div
      aria-label={label}
      className={classes}
      data-ribbon-ui-component="ribbon-group"
      id={id}
      role="group"
    >
      <div className="ribbon-ui-ribbon-group__body">{children}</div>
      <span className="ribbon-ui-ribbon-group__label">{label}</span>
    </div>
  );
}
