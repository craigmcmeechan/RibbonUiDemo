import type { SeparatorConfig } from './Separator.schema.types';

export type { SeparatorConfig };

export interface SeparatorRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type SeparatorProps = SeparatorConfig & SeparatorRuntimeProps;
