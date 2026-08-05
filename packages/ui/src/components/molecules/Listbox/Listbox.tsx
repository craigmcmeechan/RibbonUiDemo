import { createContext, type Context, type KeyboardEvent, type ReactElement, useRef } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Listbox.css';
import type { ListboxProps } from './Listbox.types';

export interface ListboxContextValue {
  readonly selectedValue: string | undefined;
  readonly requestSelect: (value: string) => void;
}

export const ListboxContext: Context<ListboxContextValue> = createContext<ListboxContextValue>({
  requestSelect: () => undefined,
  selectedValue: undefined,
});

const optionSelector = '[data-ribbon-ui-component="option"]:not([data-disabled="true"])';

function enabledOptions(listbox: HTMLElement | null): HTMLElement[] {
  if (listbox === null) return [];
  return Array.from(listbox.querySelectorAll<HTMLElement>(optionSelector));
}

export function Listbox({
  ariaLabelledBy,
  children,
  className,
  id,
  label,
  onSelect,
  value,
}: ListboxProps): ReactElement {
  useRibbonTheme();
  const ref = useRef<HTMLDivElement>(null);
  const classes = className === undefined ? 'ribbon-ui-listbox' : `ribbon-ui-listbox ${className}`;
  const requestSelect = (next: string) => onSelect?.(next);

  function selectItem(item: HTMLElement | undefined): void {
    if (item === undefined) return;
    item.focus();
    const optionValue = item.dataset['optionValue'];
    if (optionValue !== undefined) requestSelect(optionValue);
  }

  function moveFocus(current: HTMLElement | null, delta: number): void {
    const options = enabledOptions(ref.current);
    if (options.length === 0) return;
    const index = current === null ? -1 : options.indexOf(current);
    const next = (index + delta + options.length) % options.length;
    selectItem(options[next]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
    const doc = ref.current?.ownerDocument ?? null;
    const current = doc === null ? null : (doc.activeElement as HTMLElement | null);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(current, 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(current, -1);
        break;
      case 'Home':
        event.preventDefault();
        selectItem(enabledOptions(ref.current)[0]);
        break;
      case 'End':
        event.preventDefault();
        {
          const options = enabledOptions(ref.current);
          selectItem(options[options.length - 1]);
        }
        break;
    }
  }

  function handleFocus(): void {
    const listbox = ref.current;
    if (listbox === null) return;
    const active = listbox.ownerDocument.activeElement;
    const options = enabledOptions(listbox);
    if (options.some((option) => option === active)) return;
    const selected =
      value === undefined
        ? undefined
        : options.find((option) => option.dataset['optionValue'] === value);
    selectItem(selected ?? options[0]);
  }

  return (
    <ListboxContext.Provider value={{ requestSelect, selectedValue: value }}>
      <div
        aria-label={label}
        aria-labelledby={ariaLabelledBy}
        className={classes}
        data-ribbon-ui-component="listbox"
        id={id}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="listbox"
        tabIndex={-1}
      >
        {children}
      </div>
    </ListboxContext.Provider>
  );
}
