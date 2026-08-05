import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Select.css';
import type { SelectProps } from './Select.types';

export function Select({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  className,
  disabled = false,
  id,
  name,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder,
  required = false,
  size = 'medium',
  value = '',
}: SelectProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-select' : `ribbon-ui-select ${className}`;

  return (
    <select
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classes}
      data-ribbon-ui-component="select"
      data-size={size}
      disabled={disabled}
      id={id}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      required={required}
      value={value}
    >
      {placeholder !== undefined ? (
        <option disabled value="">
          {placeholder}
        </option>
      ) : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
