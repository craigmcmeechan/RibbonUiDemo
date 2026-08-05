import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Slider.css';
import type { SliderProps } from './Slider.types';

export function Slider({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  className,
  disabled = false,
  id,
  max = 100,
  min = 0,
  name,
  onBlur,
  onChange,
  onFocus,
  size = 'medium',
  step = 1,
  value = 0,
}: SliderProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-slider' : `ribbon-ui-slider ${className}`;

  return (
    <input
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={classes}
      data-ribbon-ui-component="slider"
      data-size={size}
      disabled={disabled}
      id={id}
      max={max}
      min={min}
      name={name}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      step={step}
      type="range"
      value={value}
    />
  );
}
