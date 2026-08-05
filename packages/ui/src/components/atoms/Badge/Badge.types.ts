import type { BadgeConfig } from './Badge.schema.types';

export type { BadgeConfig };

export interface BadgeRuntimeProps {
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
}

export type BadgeProps = BadgeConfig & BadgeRuntimeProps;
