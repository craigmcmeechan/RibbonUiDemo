import type { ReactNode } from 'react';

import type { PopoverConfig } from './Popover.schema.types';

export type { PopoverConfig };

export interface PopoverRuntimeProps {
  /** DOM id of the anchor element used for positioning, outside-click exclusion, and focus return. */
  readonly anchorId?: string;
  /** Optional accessible name overriding the default anchor association; runtime-only because it is host-authored. */
  readonly ariaLabel?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Popover content; runtime-only React content, never serialized. */
  readonly children?: ReactNode;
  /** Whether the popover is open; controlled by the host. */
  readonly open: boolean;
  /** Close request raised on outside interaction, Escape, resize, or scroll; runtime-only and never serialized. */
  readonly onClose?: () => void;
}

export type PopoverProps = PopoverConfig & PopoverRuntimeProps;
