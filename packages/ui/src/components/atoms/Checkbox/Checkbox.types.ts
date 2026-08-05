import type { ChangeEvent } from 'react';

import type { CheckboxConfig } from './Checkbox.schema.types';

export type { CheckboxConfig };

export interface CheckboxRuntimeProps {
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Change callback requesting the next checked value; runtime-only and never serialized. */
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type CheckboxProps = CheckboxConfig & CheckboxRuntimeProps;
