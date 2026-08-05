import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Checkbox.css';
import type { CheckboxProps } from './Checkbox.types';

export function Checkbox({
  ariaDescribedBy,
  checked,
  className,
  disabled = false,
  id,
  label,
  name,
  onChange,
  required = false,
}: CheckboxProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-checkbox' : `ribbon-ui-checkbox ${className}`;

  return (
    <label className={classes} data-disabled={disabled} data-ribbon-ui-component="checkbox">
      <input
        aria-describedby={ariaDescribedBy}
        checked={checked}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        required={required}
        type="checkbox"
      />
      <span>{label}</span>
    </label>
  );
}
