import type { SpinnerConfig } from './Spinner.schema.types';

export type { SpinnerConfig };

export interface SpinnerRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type SpinnerProps = SpinnerConfig & SpinnerRuntimeProps;
