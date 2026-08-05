import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Switch.css';
import type { SwitchProps } from './Switch.types';

export function Switch({
  ariaDescribedBy,
  checked,
  className,
  disabled = false,
  id,
  label,
  onChange,
  size = 'medium',
}: SwitchProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-switch' : `ribbon-ui-switch ${className}`;

  return (
    <div
      className={classes}
      data-disabled={disabled}
      data-ribbon-ui-component="switch"
      data-size={size}
    >
      <span className="ribbon-ui-switch__label" id={`${id}-label`}>
        {label}
      </span>
      <button
        aria-checked={checked}
        aria-describedby={ariaDescribedBy}
        aria-labelledby={`${id}-label`}
        className="ribbon-ui-switch__control"
        data-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        role="switch"
        type="button"
      >
        <span className="ribbon-ui-switch__track">
          <span className="ribbon-ui-switch__thumb" />
        </span>
      </button>
    </div>
  );
}
