import type { ReactNode } from 'react';

import type { ListboxConfig } from './Listbox.schema.types';

export type { ListboxConfig };

export interface ListboxRuntimeProps {
  /** ID of external labelling content; runtime-only because it binds host DOM. */
  readonly ariaLabelledBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Option content; runtime-only React content, never serialized. */
  readonly children?: ReactNode;
  /** Controlled selected option value owned by the host. */
  readonly value?: string;
  /** Selection callback requesting the next value; runtime-only and never serialized. */
  readonly onSelect?: (value: string) => void;
}

export type ListboxProps = ListboxConfig & ListboxRuntimeProps;
