import { type KeyboardEvent, type ReactElement, useContext } from 'react';

import { useRibbonTheme } from '../../../theme';
import { MenuContext } from '../Menu';
import './MenuItem.css';
import type { MenuItemProps } from './MenuItem.types';

export function MenuItem({
  className,
  disabled = false,
  id,
  label,
  onSelect,
  shortcut,
}: MenuItemProps): ReactElement {
  useRibbonTheme();
  const { requestClose } = useContext(MenuContext);
  const classes =
    className === undefined ? 'ribbon-ui-menu-item' : `ribbon-ui-menu-item ${className}`;

  function activate(): void {
    if (disabled) return;
    onSelect?.();
    requestClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      activate();
    }
  }

  return (
    <div
      aria-disabled={disabled}
      className={classes}
      data-disabled={disabled}
      data-ribbon-ui-component="menu-item"
      id={id}
      onClick={disabled ? undefined : activate}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={-1}
    >
      <span className="ribbon-ui-menu-item__label">{label}</span>
      {shortcut !== undefined ? (
        <span className="ribbon-ui-menu-item__shortcut">{shortcut}</span>
      ) : null}
    </div>
  );
}
