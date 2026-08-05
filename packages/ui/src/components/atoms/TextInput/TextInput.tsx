import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './TextInput.css';
import type { TextInputProps } from './TextInput.types';

export function TextInput({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  className,
  disabled = false,
  id,
  inputType = 'text',
  maxLength,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  readonly = false,
  required = false,
  size = 'medium',
  value = '',
}: TextInputProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-text-input' : `ribbon-ui-text-input ${className}`;

  return (
    <input
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classes}
      data-ribbon-ui-component="text-input"
      data-size={size}
      disabled={disabled}
      id={id}
      maxLength={maxLength}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      placeholder={placeholder}
      readOnly={readonly}
      required={required}
      type={inputType}
      value={value}
    />
  );
}
