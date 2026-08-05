import type { ReactNode } from 'react';

import type { MenuConfig } from './Menu.schema.types';

export type { MenuConfig };

export interface MenuRuntimeProps {
  /** ID of external labelling content; runtime-only because it binds host DOM. */
  readonly ariaLabelledBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Menu items; runtime-only React content, never serialized. */
  readonly children?: ReactNode;
  /** Close request raised on Escape or Tab; runtime-only and never serialized. */
  readonly onClose?: () => void;
}

export type MenuProps = MenuConfig & MenuRuntimeProps;
