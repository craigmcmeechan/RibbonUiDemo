import type { OptionConfig } from './Option.schema.types';

export type { OptionConfig };

export interface OptionRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type OptionProps = OptionConfig & OptionRuntimeProps;
