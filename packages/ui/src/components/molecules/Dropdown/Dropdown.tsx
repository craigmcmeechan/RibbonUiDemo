import { useState, type ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import { Menu } from '../Menu';
import { Popover } from '../Popover';
import './Dropdown.css';
import type { DropdownProps } from './Dropdown.types';

export function Dropdown({
  ariaLabel,
  children,
  className,
  disabled = false,
  id,
  label,
  placement = 'bottom',
}: DropdownProps): ReactElement {
  useRibbonTheme();
  const [open, setOpen] = useState(false);
  const triggerId = `${id}-trigger`;
  const menuId = `${id}-menu`;
  const popoverId = `${id}-popover`;
  const wrapperClasses =
    className === undefined ? 'ribbon-ui-dropdown' : `ribbon-ui-dropdown ${className}`;

  return (
    <div className={wrapperClasses} data-ribbon-ui-component="dropdown">
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={ariaLabel}
        className="ribbon-ui-dropdown__trigger"
        data-ribbon-ui-component="dropdown-trigger"
        disabled={disabled}
        id={triggerId}
        onClick={() => {
          if (disabled) return;
          setOpen((value) => !value);
        }}
        type="button"
      >
        {label}
        <span aria-hidden="true" className="ribbon-ui-dropdown__caret">
          ▾
        </span>
      </button>
      <Popover
        anchorId={triggerId}
        id={popoverId}
        onClose={() => {
          setOpen(false);
        }}
        open={open}
        placement={placement}
      >
        <Menu
          id={menuId}
          label={ariaLabel ?? label}
          onClose={() => {
            setOpen(false);
          }}
        >
          {children}
        </Menu>
      </Popover>
    </div>
  );
}
