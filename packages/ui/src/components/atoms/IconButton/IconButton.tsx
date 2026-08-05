import type { ReactElement, ReactNode } from 'react';

import { useRibbonTheme } from '../../../theme';
import './IconButton.css';
import type { IconButtonProps } from './IconButton.types';

function getIconPaths(icon: IconButtonProps['icon']): ReactNode {
  switch (icon) {
    case 'save':
      return (
        <>
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v5h7V4" />
          <rect height="6" width="8" x="8" y="13" />
        </>
      );
    case 'undo':
      return (
        <>
          <path d="M9 7 4 12l5 5" />
          <path d="M4 12h10a6 6 0 0 1 0 12h-1" />
        </>
      );
    case 'redo':
      return (
        <>
          <path d="m15 7 5 5-5 5" />
          <path d="M20 12H10a6 6 0 0 0 0 12h1" />
        </>
      );
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.3-4.3" />
        </>
      );
    case 'close':
      return (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      );
    case 'more':
      return (
        <>
          <circle cx="6" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18" cy="12" r="1.4" />
        </>
      );
  }
}

export function IconButton({
  ariaDescribedBy,
  className,
  disabled = false,
  icon,
  id,
  label,
  onPress,
  size = 'medium',
  variant = 'neutral',
}: IconButtonProps): ReactElement {
  useRibbonTheme();
  const classes =
    className === undefined ? 'ribbon-ui-icon-button' : `ribbon-ui-icon-button ${className}`;

  return (
    <button
      aria-describedby={ariaDescribedBy}
      aria-label={label}
      className={classes}
      data-ribbon-ui-component="icon-button"
      data-size={size}
      data-variant={variant}
      disabled={disabled}
      id={id}
      onClick={onPress}
      type="button"
    >
      <svg aria-hidden="true" data-icon={icon} focusable="false" viewBox="0 0 24 24">
        {getIconPaths(icon)}
      </svg>
    </button>
  );
}
