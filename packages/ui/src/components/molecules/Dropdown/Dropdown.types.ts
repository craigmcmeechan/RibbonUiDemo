import type { ReactNode } from 'react';

import type { DropdownConfig } from './Dropdown.schema.types';

export type { DropdownConfig };

export interface DropdownRuntimeProps {
  /** Optional accessible name overriding the trigger label; runtime-only because it is host-authored. */
  readonly ariaLabel?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** MenuItem content for the menu; runtime-only React content, never serialized. */
  readonly children?: ReactNode;
}

export type DropdownProps = DropdownConfig & DropdownRuntimeProps;
