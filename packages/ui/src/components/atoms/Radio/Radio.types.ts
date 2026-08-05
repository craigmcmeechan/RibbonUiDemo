import type { ChangeEvent } from 'react';

import type { RadioConfig } from './Radio.schema.types';

export type { RadioConfig };

export interface RadioRuntimeProps {
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Change callback requesting the next selected value; runtime-only and never serialized. */
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export type RadioProps = RadioConfig & RadioRuntimeProps;
