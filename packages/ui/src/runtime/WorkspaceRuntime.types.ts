import type { CapabilityId, CommandId, WorkspaceId, WorkspaceSectionId } from './RuntimeIds';
import type { RuntimeObserver, WorkspaceLifecycleState } from './RuntimeObservability.types';

export interface WorkspaceSectionDefinition {
  readonly id: WorkspaceSectionId;
  readonly label: string;
}

export interface WorkspaceDefinitionInput {
  readonly capabilities?: readonly CapabilityId[];
  readonly commandIds?: readonly CommandId[];
  readonly id: WorkspaceId;
  readonly initialSectionId: WorkspaceSectionId;
  readonly sections: readonly WorkspaceSectionDefinition[];
}

export interface WorkspaceDefinition {
  readonly capabilities: readonly CapabilityId[];
  readonly commandIds: readonly CommandId[];
  readonly id: WorkspaceId;
  readonly initialSectionId: WorkspaceSectionId;
  readonly sections: readonly Readonly<WorkspaceSectionDefinition>[];
}

export type WorkspaceDefinitionResult =
  | Readonly<{ definition: WorkspaceDefinition; status: 'valid' }>
  | Readonly<{
      reasonCode:
        | 'workspace.capability-id.duplicate'
        | 'workspace.command-id.duplicate'
        | 'workspace.initial-section.missing'
        | 'workspace.section-id.duplicate'
        | 'workspace.sections.empty';
      status: 'invalid';
    }>;

export interface WorkspaceRuntimeSnapshot {
  readonly activeSectionId: WorkspaceSectionId;
  readonly lifecycle: WorkspaceLifecycleState;
  readonly workspaceId: WorkspaceId;
}

export type WorkspaceTransitionResult =
  | Readonly<{ changed: boolean; snapshot: WorkspaceRuntimeSnapshot; status: 'accepted' }>
  | Readonly<{
      reasonCode:
        | 'workspace.lifecycle.disposed'
        | 'workspace.lifecycle.inactive'
        | 'workspace.section.unknown';
      snapshot: WorkspaceRuntimeSnapshot;
      status: 'rejected';
    }>;

export interface WorkspaceRuntime {
  activate(): WorkspaceTransitionResult;
  deactivate(): WorkspaceTransitionResult;
  dispose(): WorkspaceTransitionResult;
  getSnapshot(): WorkspaceRuntimeSnapshot;
  selectSection(sectionId: WorkspaceSectionId): WorkspaceTransitionResult;
}

export interface WorkspaceRuntimeOptions {
  readonly definition: WorkspaceDefinition;
  readonly observer?: RuntimeObserver;
}

/** Shell state stays with the application host and is not merged into a workspace runtime. */
export interface ShellStateBoundary<State> {
  readonly owner: 'shell-host';
  readonly snapshot: State;
}

/** Content state stays with the content adapter and is not merged into workspace lifecycle state. */
export interface ContentStateBoundary<State> {
  readonly owner: 'content-adapter';
  readonly snapshot: State;
}
