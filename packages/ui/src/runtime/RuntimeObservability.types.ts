import type { CommandId, WorkspaceId, WorkspaceSectionId } from './RuntimeIds';

export type CommandOutcome = 'denied' | 'failed' | 'succeeded' | 'unavailable';
export type WorkspaceLifecycleState = 'active' | 'disposed' | 'inactive';

export type RuntimeEvent =
  | Readonly<{
      commandId: CommandId;
      type: 'command.execution-started';
      workspaceId: WorkspaceId;
    }>
  | Readonly<{
      commandId: CommandId;
      outcome: CommandOutcome;
      reasonCode?: string;
      type: 'command.execution-completed';
      workspaceId: WorkspaceId;
    }>
  | Readonly<{
      from: WorkspaceLifecycleState;
      to: WorkspaceLifecycleState;
      type: 'workspace.lifecycle-changed';
      workspaceId: WorkspaceId;
    }>
  | Readonly<{
      reasonCode: string;
      state: WorkspaceLifecycleState;
      type: 'workspace.transition-rejected';
      workspaceId: WorkspaceId;
    }>
  | Readonly<{
      fromSectionId: WorkspaceSectionId;
      toSectionId: WorkspaceSectionId;
      type: 'workspace.section-changed';
      workspaceId: WorkspaceId;
    }>;

export interface RuntimeObserver {
  /** Receives frozen, identifier-only events. Implementations must not throw. */
  onRuntimeEvent(event: RuntimeEvent): void;
}
