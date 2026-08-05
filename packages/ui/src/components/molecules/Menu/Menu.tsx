import { createContext, type Context, type KeyboardEvent, type ReactElement, useRef } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Menu.css';
import type { MenuProps } from './Menu.types';

export interface MenuContextValue {
  readonly requestClose: () => void;
}

export const MenuContext: Context<MenuContextValue> = createContext<MenuContextValue>({
  requestClose: () => undefined,
});

const itemSelector = '[data-ribbon-ui-component="menu-item"]:not([data-disabled="true"])';

function enabledItems(menu: HTMLElement | null): HTMLElement[] {
  if (menu === null) return [];
  return Array.from(menu.querySelectorAll<HTMLElement>(itemSelector));
}

export function Menu({
  ariaLabelledBy,
  children,
  className,
  id,
  label,
  onClose,
}: MenuProps): ReactElement {
  useRibbonTheme();
  const ref = useRef<HTMLDivElement>(null);
  const classes = className === undefined ? 'ribbon-ui-menu' : `ribbon-ui-menu ${className}`;
  const requestClose = () => onClose?.();

  function focusItem(item: HTMLElement | undefined): void {
    if (item !== undefined) item.focus();
  }

  function moveFocus(current: HTMLElement | null, delta: number): void {
    const items = enabledItems(ref.current);
    if (items.length === 0) return;
    const index = current === null ? -1 : items.indexOf(current);
    const next = (index + delta + items.length) % items.length;
    focusItem(items[next]);
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
        focusItem(enabledItems(ref.current)[0]);
        break;
      case 'End':
        event.preventDefault();
        {
          const items = enabledItems(ref.current);
          focusItem(items[items.length - 1]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        requestClose();
        break;
      case 'Tab':
        requestClose();
        break;
    }
  }

  function handleFocus(): void {
    const menu = ref.current;
    if (menu === null) return;
    const active = menu.ownerDocument.activeElement;
    if (active === menu) {
      focusItem(enabledItems(menu)[0]);
      return;
    }
    if (enabledItems(menu).some((item) => item === active)) return;
    focusItem(enabledItems(menu)[0]);
  }

  return (
    <MenuContext.Provider value={{ requestClose }}>
      <div
        aria-label={label}
        aria-labelledby={ariaLabelledBy}
        className={classes}
        data-ribbon-ui-component="menu"
        id={id}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="menu"
        tabIndex={-1}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}
