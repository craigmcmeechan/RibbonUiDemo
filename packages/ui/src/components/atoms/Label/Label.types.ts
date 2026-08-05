import type { LabelConfig } from './Label.schema.types';

export type { LabelConfig };

export interface LabelRuntimeProps {
  /** Host DOM id of the associated control; runtime-only because it binds host DOM. */
  readonly htmlFor?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type LabelProps = LabelConfig & LabelRuntimeProps;
