import type { ChangeEvent, FocusEvent } from 'react';

import type { SliderConfig } from './Slider.schema.types';

export type { SliderConfig };

export interface SliderRuntimeProps {
  /** Accessible name for the slider; runtime-only because it is host-authored. */
  readonly ariaLabel?: string;
  /** ID of external descriptive content; runtime-only because it binds host DOM. */
  readonly ariaDescribedBy?: string;
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

export type SliderProps = SliderConfig & SliderRuntimeProps;
