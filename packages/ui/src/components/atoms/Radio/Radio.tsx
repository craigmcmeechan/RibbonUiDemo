import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Radio.css';
import type { RadioProps } from './Radio.types';

export function Radio({
  ariaDescribedBy,
  checked,
  className,
  disabled = false,
  id,
  label,
  name,
  onChange,
  required = false,
  value,
}: RadioProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-radio' : `ribbon-ui-radio ${className}`;

  return (
    <label className={classes} data-disabled={disabled} data-ribbon-ui-component="radio">
      <input
        aria-describedby={ariaDescribedBy}
        checked={checked}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        required={required}
        type="radio"
        value={value}
      />
      <span>{label}</span>
    </label>
  );
}
