import type { ReactElement } from 'react';

import type { RibbonControlConfig } from './RibbonControl.schema.types';

export type { RibbonControlConfig };

/** A single control definition resolved and rendered by the ribbon control renderer. */
export interface RibbonControlDefinition {
  readonly id: string;
  readonly type: string;
  readonly config: Readonly<Record<string, unknown>>;
  readonly command?: string;
}

/** Host-owned state for stateful controls, keyed by control id. */
export type RibbonControlState = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

/** Runtime context passed to each registered control entry. */
export interface RibbonControlContext {
  readonly onCommand?: ((command?: string) => void) | undefined;
  readonly controlState?: RibbonControlState | undefined;
  readonly onControlChange?: ((controlId: string, next: unknown) => void) | undefined;
}

/** A registered control entry that validates, binds, and renders one control type. */
export interface RibbonControlEntry {
  readonly schemaId: string;
  render(definition: RibbonControlDefinition, ctx: RibbonControlContext): ReactElement;
}

export interface RibbonControlRuntimeProps {
  /** Control definition; runtime-only workspace configuration, never serialized. */
  readonly definition: RibbonControlDefinition;
  /** Optional host layout class. It must not redefine RibbonUI theme values. */
  readonly className?: string;
  /** Command dispatcher for action controls; runtime-only. */
  readonly onCommand?: ((command?: string) => void) | undefined;
  /** Host-owned state for stateful controls; runtime-only. */
  readonly controlState?: RibbonControlState | undefined;
  /** State change request callback; runtime-only. */
  readonly onControlChange?: ((controlId: string, next: unknown) => void) | undefined;
}

export type RibbonControlProps = RibbonControlConfig & RibbonControlRuntimeProps;
