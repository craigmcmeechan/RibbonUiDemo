import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import { getRibbonControlEntry, renderDiagnostic } from './ribbonControlRegistry';
import './RibbonControl.css';
import type { RibbonControlProps } from './RibbonControl.types';

export function RibbonControl({
  className,
  controlState,
  definition,
  onCommand,
  onControlChange,
}: RibbonControlProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-ribbon-control' : `ribbon-ui-ribbon-control ${className}`;
  const entry = getRibbonControlEntry(definition.type);
  const rendered =
    entry === undefined
      ? renderDiagnostic(`Unknown control: ${definition.type}`)
      : entry.render(definition, { controlState, onCommand, onControlChange });

  return (
    <span className={classes} data-ribbon-ui-component="ribbon-control">
      {rendered}
    </span>
  );
}
