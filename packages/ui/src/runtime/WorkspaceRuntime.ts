import { emitRuntimeEvent } from './RuntimeObservability';
import type { WorkspaceLifecycleState } from './RuntimeObservability.types';
import type { WorkspaceSectionId } from './RuntimeIds';
import type {
  WorkspaceDefinition,
  WorkspaceDefinitionInput,
  WorkspaceDefinitionResult,
  WorkspaceRuntime,
  WorkspaceRuntimeOptions,
  WorkspaceRuntimeSnapshot,
  WorkspaceTransitionResult,
} from './WorkspaceRuntime.types';

function hasDuplicates(values: readonly string[]): boolean {
  return new Set(values).size !== values.length;
}

function invalidDefinition(
  reasonCode: Extract<WorkspaceDefinitionResult, { status: 'invalid' }>['reasonCode'],
): WorkspaceDefinitionResult {
  return Object.freeze({ reasonCode, status: 'invalid' });
}

export function defineWorkspace(input: WorkspaceDefinitionInput): WorkspaceDefinitionResult {
  if (input.sections.length === 0) {
    return invalidDefinition('workspace.sections.empty');
  }
  if (hasDuplicates(input.sections.map(({ id }) => id))) {
    return invalidDefinition('workspace.section-id.duplicate');
  }
  if (!input.sections.some(({ id }) => id === input.initialSectionId)) {
    return invalidDefinition('workspace.initial-section.missing');
  }
  if (hasDuplicates(input.commandIds ?? [])) {
    return invalidDefinition('workspace.command-id.duplicate');
  }
  if (hasDuplicates(input.capabilities ?? [])) {
    return invalidDefinition('workspace.capability-id.duplicate');
  }

  const definition: WorkspaceDefinition = Object.freeze({
    capabilities: Object.freeze([...(input.capabilities ?? [])]),
    commandIds: Object.freeze([...(input.commandIds ?? [])]),
    id: input.id,
    initialSectionId: input.initialSectionId,
    sections: Object.freeze(
      input.sections.map((section) => Object.freeze({ id: section.id, label: section.label })),
    ),
  });
  return Object.freeze({ definition, status: 'valid' });
}

function accepted(snapshot: WorkspaceRuntimeSnapshot, changed: boolean): WorkspaceTransitionResult {
  return Object.freeze({ changed, snapshot, status: 'accepted' });
}

class DefaultWorkspaceRuntime implements WorkspaceRuntime {
  readonly #definition: WorkspaceDefinition;
  readonly #observer: WorkspaceRuntimeOptions['observer'];
  #activeSectionId: WorkspaceSectionId;
  #lifecycle: WorkspaceLifecycleState = 'inactive';

  constructor({ definition, observer }: WorkspaceRuntimeOptions) {
    this.#definition = definition;
    this.#observer = observer;
    this.#activeSectionId = definition.initialSectionId;
  }

  activate(): WorkspaceTransitionResult {
    if (this.#lifecycle === 'disposed') {
      return this.#reject('workspace.lifecycle.disposed');
    }
    if (this.#lifecycle === 'active') {
      return accepted(this.getSnapshot(), false);
    }

    this.#transitionLifecycle('active');
    return accepted(this.getSnapshot(), true);
  }

  deactivate(): WorkspaceTransitionResult {
    if (this.#lifecycle === 'disposed') {
      return this.#reject('workspace.lifecycle.disposed');
    }
    if (this.#lifecycle === 'inactive') {
      return accepted(this.getSnapshot(), false);
    }

    this.#transitionLifecycle('inactive');
    return accepted(this.getSnapshot(), true);
  }

  dispose(): WorkspaceTransitionResult {
    if (this.#lifecycle === 'disposed') {
      return accepted(this.getSnapshot(), false);
    }
    if (this.#lifecycle === 'active') {
      this.#transitionLifecycle('inactive');
    }

    this.#transitionLifecycle('disposed');
    return accepted(this.getSnapshot(), true);
  }

  getSnapshot(): WorkspaceRuntimeSnapshot {
    return Object.freeze({
      activeSectionId: this.#activeSectionId,
      lifecycle: this.#lifecycle,
      workspaceId: this.#definition.id,
    });
  }

  selectSection(sectionId: WorkspaceSectionId): WorkspaceTransitionResult {
    if (this.#lifecycle === 'disposed') {
      return this.#reject('workspace.lifecycle.disposed');
    }
    if (this.#lifecycle !== 'active') {
      return this.#reject('workspace.lifecycle.inactive');
    }
    if (!this.#definition.sections.some(({ id }) => id === sectionId)) {
      return this.#reject('workspace.section.unknown');
    }
    if (this.#activeSectionId === sectionId) {
      return accepted(this.getSnapshot(), false);
    }

    const fromSectionId = this.#activeSectionId;
    this.#activeSectionId = sectionId;
    emitRuntimeEvent(this.#observer, {
      fromSectionId,
      toSectionId: sectionId,
      type: 'workspace.section-changed',
      workspaceId: this.#definition.id,
    });
    return accepted(this.getSnapshot(), true);
  }

  #reject(
    reasonCode: Extract<WorkspaceTransitionResult, { status: 'rejected' }>['reasonCode'],
  ): WorkspaceTransitionResult {
    const snapshot = this.getSnapshot();
    emitRuntimeEvent(this.#observer, {
      reasonCode,
      state: snapshot.lifecycle,
      type: 'workspace.transition-rejected',
      workspaceId: this.#definition.id,
    });
    return Object.freeze({ reasonCode, snapshot, status: 'rejected' });
  }

  #transitionLifecycle(to: WorkspaceLifecycleState): void {
    const from = this.#lifecycle;
    this.#lifecycle = to;
    emitRuntimeEvent(this.#observer, {
      from,
      to,
      type: 'workspace.lifecycle-changed',
      workspaceId: this.#definition.id,
    });
  }
}

export function createWorkspaceRuntime(options: WorkspaceRuntimeOptions): WorkspaceRuntime {
  return Object.freeze(new DefaultWorkspaceRuntime(options));
}
