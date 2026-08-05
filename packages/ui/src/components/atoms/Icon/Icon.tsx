import type { ReactElement, ReactNode } from 'react';

import { useRibbonTheme } from '../../../theme';
import './Icon.css';
import type { IconProps } from './Icon.types';

function getIconPaths(icon: IconProps['icon']): ReactNode {
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

export function Icon({ className, icon, id, size = 'medium' }: IconProps): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-icon' : `ribbon-ui-icon ${className}`;

  return (
    <svg
      aria-hidden="true"
      className={classes}
      data-icon={icon}
      data-ribbon-ui-component="icon"
      data-size={size}
      focusable="false"
      id={id}
      viewBox="0 0 24 24"
    >
      {getIconPaths(icon)}
    </svg>
  );
}
