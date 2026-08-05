import type { ChangeEvent, FocusEvent } from 'react';

import type { TextAreaConfig } from './TextArea.schema.types';

export type { TextAreaConfig };

export interface TextAreaRuntimeProps {
  /** Accessible name for context-free fields; runtime-only because it is host-authored. */
  readonly ariaLabel?: string;
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
  /** ID of external labelling content; runtime-only because it binds host DOM. */
  readonly ariaLabelledBy?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Change callback requesting the next value; runtime-only and never serialized. */
  readonly onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Focus callback; runtime-only and never serialized. */
  readonly onFocus?: (event: FocusEvent<HTMLTextAreaElement>) => void;
  /** Blur callback; runtime-only and never serialized. */
  readonly onBlur?: (event: FocusEvent<HTMLTextAreaElement>) => void;
}

export type TextAreaProps = TextAreaConfig & TextAreaRuntimeProps;
