import type { SwitchConfig } from './Switch.schema.types';

export type { SwitchConfig };

export interface SwitchRuntimeProps {
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Change callback requesting the next checked value; runtime-only and never serialized. */
  readonly onChange?: (nextChecked: boolean) => void;
}

export type SwitchProps = SwitchConfig & SwitchRuntimeProps;
