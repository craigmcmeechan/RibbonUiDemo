import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './TextArea.css';
import type { TextAreaProps } from './TextArea.types';

export function TextArea({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  className,
  cols,
  disabled = false,
  id,
  maxLength,
  name,
  onBlur,
  onChange,
  onFocus,
  placeholder,
  readonly = false,
  required = false,
  resize = 'vertical',
  rows = 3,
  size = 'medium',
  value = '',
}: TextAreaProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-text-area' : `ribbon-ui-text-area ${className}`;

  return (
    <textarea
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classes}
      cols={cols}
      data-ribbon-ui-component="text-area"
      data-resize={resize}
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
      rows={rows}
      value={value}
    />
  );
}
