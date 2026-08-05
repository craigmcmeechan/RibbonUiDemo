import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './RibbonTab.css';
import type { RibbonTabProps } from './RibbonTab.types';

export function RibbonTab({
  active,
  ariaControls,
  className,
  id,
  label,
  onSelect,
}: RibbonTabProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-ribbon-tab' : `ribbon-ui-ribbon-tab ${className}`;

  return (
    <button
      aria-controls={ariaControls}
      aria-selected={active}
      className={classes}
      data-active={active}
      data-ribbon-ui-component="ribbon-tab"
      id={id}
      onClick={onSelect}
      role="tab"
      tabIndex={active ? 0 : -1}
      type="button"
    >
      {label}
    </button>
  );
}
