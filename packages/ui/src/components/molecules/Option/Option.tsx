import { type ReactElement, useContext } from 'react';

import { useRibbonTheme } from '../../../theme';
import { ListboxContext } from '../Listbox';
import './Option.css';
import type { OptionProps } from './Option.types';

export function Option({
  className,
  disabled = false,
  id,
  label,
  value,
}: OptionProps): ReactElement {
  useRibbonTheme();
  const { requestSelect, selectedValue } = useContext(ListboxContext);
  const selected = selectedValue === value;
  const classes = className === undefined ? 'ribbon-ui-option' : `ribbon-ui-option ${className}`;

  function handleActivate(): void {
    if (disabled) return;
    requestSelect(value);
  }

  return (
    <div
      aria-disabled={disabled}
      aria-selected={selected}
      className={classes}
      data-disabled={disabled}
      data-option-value={value}
      data-ribbon-ui-component="option"
      id={id}
      onClick={disabled ? undefined : handleActivate}
      role="option"
      tabIndex={-1}
    >
      {label}
    </div>
  );
}
