import type { MouseEventHandler } from 'react';

import type { ButtonConfig } from './Button.schema.types';

export type { ButtonConfig };

export interface ButtonRuntimeProps {
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Activation callback; runtime-only and never accepted from JSON configuration. */
  readonly onPress?: MouseEventHandler<HTMLButtonElement>;
}

export type ButtonProps = ButtonConfig & ButtonRuntimeProps;
