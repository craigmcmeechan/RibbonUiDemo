import type { ReactNode } from 'react';

import type { RibbonGroupConfig } from './RibbonGroup.schema.types';

export type { RibbonGroupConfig };

export interface RibbonGroupRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Control content; runtime-only React content, never serialized. */
  readonly children?: ReactNode;
}

export type RibbonGroupProps = RibbonGroupConfig & RibbonGroupRuntimeProps;
