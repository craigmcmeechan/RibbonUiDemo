import type { IconConfig } from './Icon.schema.types';

export type { IconConfig };

export interface IconRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type IconProps = IconConfig & IconRuntimeProps;
