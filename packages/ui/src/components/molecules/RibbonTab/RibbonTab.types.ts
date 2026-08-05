import type { RibbonTabConfig } from './RibbonTab.schema.types';

export type { RibbonTabConfig };

export interface RibbonTabRuntimeProps {
  /** Controlled active state; the host owns it. */
  readonly active: boolean;
  /** ID of the tab panel this tab controls; runtime-only because it binds host DOM. */
  readonly ariaControls?: string;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Selection callback; runtime-only and never serialized. */
  readonly onSelect?: () => void;
}

export type RibbonTabProps = RibbonTabConfig & RibbonTabRuntimeProps;
