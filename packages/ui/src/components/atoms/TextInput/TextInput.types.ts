import type { ChangeEvent, FocusEvent } from 'react';

import type { TextInputConfig } from './TextInput.schema.types';

export type { TextInputConfig };

export interface TextInputRuntimeProps {
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** Accessible name for icon-only or context-free fields; runtime-only because it is host-authored. */
  readonly ariaLabel?: string;
  /** ID of external labelling content; runtime-only because it binds host DOM. */
  readonly ariaLabelledBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Change callback requesting the next value; runtime-only and never serialized. */
  readonly onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Focus callback; runtime-only and never serialized. */
  readonly onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  /** Blur callback; runtime-only and never serialized. */
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

export type TextInputProps = TextInputConfig & TextInputRuntimeProps;
