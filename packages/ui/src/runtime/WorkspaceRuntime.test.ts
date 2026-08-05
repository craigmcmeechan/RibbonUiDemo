import { describe, expect, it } from 'vitest';

import {
  createCapabilityId,
  createCommandId,
  createWorkspaceId,
  createWorkspaceSectionId,
} from './RuntimeIds';
import type { RuntimeIdResult } from './RuntimeIds';
import type { RuntimeEvent } from './RuntimeObservability.types';
import { createWorkspaceRuntime, defineWorkspace } from './WorkspaceRuntime';
import type { WorkspaceDefinition, WorkspaceDefinitionInput } from './WorkspaceRuntime.types';

function unwrapId<Id extends string>(result: RuntimeIdResult<Id>): Id {
  if (result.status === 'invalid') {
    throw new Error(result.reasonCode);
  }
  return result.id;
}

const workspaceId = unwrapId(createWorkspaceId('crm'));
const contactsId = unwrapId(createWorkspaceSectionId('crm.contacts'));
const productsId = unwrapId(createWorkspaceSectionId('crm.products'));
const commandId = unwrapId(createCommandId('contacts.open'));
const capabilityId = unwrapId(createCapabilityId('crm.contacts.read'));

function definitionInput(): WorkspaceDefinitionInput {
  return {
    capabilities: [capabilityId],
    commandIds: [commandId],
    id: workspaceId,
    initialSectionId: contactsId,
    sections: [
      { id: contactsId, label: 'Contacts' },
      { id: productsId, label: 'Products' },
    ],
  };
}

function createDefinition(): WorkspaceDefinition {
  const result = defineWorkspace(definitionInput());
  if (result.status === 'invalid') {
    throw new Error(result.reasonCode);
  }
  return result.definition;
}

describe('workspace definition', () => {
  it('clones and freezes workspace configuration and capability boundaries', () => {
    const input = definitionInput();
    const result = defineWorkspace(input);

    expect(result.status).toBe('valid');
    if (result.status === 'invalid') return;
    expect(result.definition).not.toBe(input);
    expect(result.definition.sections).not.toBe(input.sections);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.definition)).toBe(true);
    expect(Object.isFrozen(result.definition.sections)).toBe(true);
    expect(result.definition.sections.every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(result.definition.capabilities)).toBe(true);
    expect(Object.isFrozen(result.definition.commandIds)).toBe(true);
  });

  it.each([
    ['workspace.sections.empty', { sections: [] }],
    [
      'workspace.section-id.duplicate',
      {
        sections: [
          { id: contactsId, label: 'One' },
          { id: contactsId, label: 'Two' },
        ],
      },
    ],
    [
      'workspace.initial-section.missing',
      { initialSectionId: productsId, sections: [{ id: contactsId, label: 'Contacts' }] },
    ],
    ['workspace.command-id.duplicate', { commandIds: [commandId, commandId] }],
    ['workspace.capability-id.duplicate', { capabilities: [capabilityId, capabilityId] }],
  ] as const)('rejects invalid definitions with %s', (reasonCode, override) => {
    const result = defineWorkspace({ ...definitionInput(), ...override });

    expect(result).toEqual({ reasonCode, status: 'invalid' });
    expect(Object.isFrozen(result)).toBe(true);
  });
});

describe('workspace lifecycle runtime', () => {
  it('owns deterministic activation and deactivation state with idempotent repeats', () => {
    const events: RuntimeEvent[] = [];
    const runtime = createWorkspaceRuntime({
      definition: createDefinition(),
      observer: { onRuntimeEvent: (event) => events.push(event) },
    });

    expect(runtime.getSnapshot()).toEqual({
      activeSectionId: contactsId,
      lifecycle: 'inactive',
      workspaceId,
    });
    expect(runtime.activate()).toMatchObject({ changed: true, status: 'accepted' });
    expect(runtime.activate()).toMatchObject({ changed: false, status: 'accepted' });
    expect(runtime.deactivate()).toMatchObject({ changed: true, status: 'accepted' });
    expect(runtime.deactivate()).toMatchObject({ changed: false, status: 'accepted' });
    expect(events).toEqual([
      { from: 'inactive', to: 'active', type: 'workspace.lifecycle-changed', workspaceId },
      { from: 'active', to: 'inactive', type: 'workspace.lifecycle-changed', workspaceId },
    ]);
    expect(Object.isFrozen(runtime.getSnapshot())).toBe(true);
  });

  it('requires an active workspace and known section before changing section state', () => {
    const events: RuntimeEvent[] = [];
    const runtime = createWorkspaceRuntime({
      definition: createDefinition(),
      observer: { onRuntimeEvent: (event) => events.push(event) },
    });
    const unknownId = unwrapId(createWorkspaceSectionId('crm.unknown'));

    expect(runtime.selectSection(productsId)).toMatchObject({
      reasonCode: 'workspace.lifecycle.inactive',
      status: 'rejected',
    });
    runtime.activate();
    expect(runtime.selectSection(unknownId)).toMatchObject({
      reasonCode: 'workspace.section.unknown',
      status: 'rejected',
    });
    expect(runtime.selectSection(productsId)).toMatchObject({ changed: true, status: 'accepted' });
    expect(runtime.selectSection(productsId)).toMatchObject({ changed: false, status: 'accepted' });
    expect(runtime.getSnapshot().activeSectionId).toBe(productsId);
    expect(events.at(-1)).toEqual({
      fromSectionId: contactsId,
      toSectionId: productsId,
      type: 'workspace.section-changed',
      workspaceId,
    });
  });

  it('deactivates before disposal and rejects later lifecycle changes without throwing', () => {
    const events: RuntimeEvent[] = [];
    const runtime = createWorkspaceRuntime({
      definition: createDefinition(),
      observer: { onRuntimeEvent: (event) => events.push(event) },
    });

    runtime.activate();
    expect(runtime.dispose()).toMatchObject({ changed: true, status: 'accepted' });
    expect(runtime.dispose()).toMatchObject({ changed: false, status: 'accepted' });
    expect(runtime.activate()).toMatchObject({
      reasonCode: 'workspace.lifecycle.disposed',
      status: 'rejected',
    });
    expect(runtime.deactivate()).toMatchObject({
      reasonCode: 'workspace.lifecycle.disposed',
      status: 'rejected',
    });
    expect(runtime.selectSection(productsId)).toMatchObject({
      reasonCode: 'workspace.lifecycle.disposed',
      status: 'rejected',
    });
    expect(events.slice(0, 3)).toEqual([
      { from: 'inactive', to: 'active', type: 'workspace.lifecycle-changed', workspaceId },
      { from: 'active', to: 'inactive', type: 'workspace.lifecycle-changed', workspaceId },
      { from: 'inactive', to: 'disposed', type: 'workspace.lifecycle-changed', workspaceId },
    ]);
    expect(JSON.stringify(events)).not.toContain('Error');
  });

  it('isolates observer failures from lifecycle behavior', () => {
    const runtime = createWorkspaceRuntime({
      definition: createDefinition(),
      observer: {
        onRuntimeEvent: () => {
          throw new Error('observer unavailable');
        },
      },
    });

    expect(runtime.activate()).toMatchObject({ changed: true, status: 'accepted' });
    expect(Object.isFrozen(runtime)).toBe(true);
    expect(runtime.getSnapshot().lifecycle).toBe('active');
  });
});
