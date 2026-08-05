import type { MouseEvent, ReactNode } from 'react';

import type { RibbonConfig } from './Ribbon.schema.types';
import type { RibbonControlDefinition, RibbonControlState } from '../RibbonControl';

export type { RibbonConfig };

export interface RibbonGroupDefinition {
  readonly id: string;
  readonly label: string;
  readonly controls: readonly RibbonControlDefinition[];
}

export interface RibbonTabDefinition {
  readonly id: string;
  readonly label: string;
  readonly groups: readonly RibbonGroupDefinition[];
}

export interface RibbonDefinition {
  readonly tabs: readonly RibbonTabDefinition[];
}

export interface RibbonRuntimeProps {
  /** Ribbon definition; runtime-only workspace configuration, never serialized. */
  readonly definition: RibbonDefinition;
  /** Controlled active tab id owned by the host. */
  readonly activeTab: string;
  /** Tab selection callback; runtime-only and never serialized. */
  readonly onSelectTab?: (tabId: string) => void;
  /** Command dispatcher forwarded to controls; runtime-only. */
  readonly onCommand?: (command?: string) => void;
  /** Host-owned control state forwarded to controls; runtime-only. */
  readonly controlState?: RibbonControlState;
  /** Control state change callback forwarded to controls; runtime-only. */
  readonly onControlChange?: (controlId: string, next: unknown) => void;
  /** Selection-preservation pointer hook (editor adapter stub); runtime-only. */
  readonly onRibbonPointerDown?: (event: MouseEvent<HTMLElement>) => void;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Optional extra content rendered after the tab bar; runtime-only. */
  readonly children?: ReactNode;
}

export type RibbonProps = RibbonConfig & RibbonRuntimeProps;
