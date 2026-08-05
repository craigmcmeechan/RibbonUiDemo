import { describe, expect, it, vi } from 'vitest';

import {
  commandAvailable,
  commandDenied,
  commandUnavailable,
  defineCommand,
  executeCommand,
} from './CommandRuntime';
import type {
  CommandContext,
  CommandDefinition,
  CommandExecutionResult,
} from './CommandRuntime.types';
import { createCapabilityId, createCommandId, createWorkspaceId } from './RuntimeIds';
import type { CommandId, RuntimeIdResult, WorkspaceId } from './RuntimeIds';
import type { RuntimeEvent } from './RuntimeObservability.types';

function unwrapId<Id extends string>(result: RuntimeIdResult<Id>): Id {
  if (result.status === 'invalid') {
    throw new Error(result.reasonCode);
  }
  return result.id;
}

const commandId: CommandId = unwrapId(createCommandId('contacts.open'));
const workspaceId: WorkspaceId = unwrapId(createWorkspaceId('crm'));
const context: CommandContext = Object.freeze({
  abortSignal: new AbortController().signal,
  capabilities: Object.freeze([unwrapId(createCapabilityId('crm.contacts.read'))]),
  workspaceId,
});

describe('command runtime', () => {
  it('executes an available command with caller context and ordered frozen events', async () => {
    const events: RuntimeEvent[] = [];
    const execute = vi.fn(
      (_context: CommandContext, input: Readonly<{ contactId: string }>) =>
        Object.freeze({
          status: 'succeeded',
          value: input.contactId,
        }) satisfies CommandExecutionResult<string>,
    );
    const command = defineCommand({
      execute,
      getAvailability: () => commandAvailable(),
      id: commandId,
    });

    const result = await executeCommand({
      command,
      context,
      input: { contactId: 'contact-42' },
      observer: { onRuntimeEvent: (event) => events.push(event) },
    });

    expect(execute).toHaveBeenCalledWith(expect.objectContaining({ workspaceId }), {
      contactId: 'contact-42',
    });
    const receivedContext = execute.mock.calls[0]?.[0];
    expect(receivedContext).not.toBe(context);
    expect(Object.isFrozen(receivedContext)).toBe(true);
    expect(Object.isFrozen(receivedContext?.capabilities)).toBe(true);
    expect(result).toEqual({ status: 'succeeded', value: 'contact-42' });
    expect(Object.isFrozen(command)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(events).toEqual([
      { commandId, type: 'command.execution-started', workspaceId },
      { commandId, outcome: 'succeeded', type: 'command.execution-completed', workspaceId },
    ]);
    expect(events.every(Object.isFrozen)).toBe(true);
  });

  it.each([
    ['denied', commandDenied('permission.required')],
    ['unavailable', commandUnavailable('selection.required')],
  ] as const)(
    'returns %s availability without invoking command behavior',
    async (_state, availability) => {
      const execute = vi.fn<CommandDefinition<void, void>['execute']>();
      const result = await executeCommand({
        command: defineCommand({ execute, getAvailability: () => availability, id: commandId }),
        context,
        input: undefined,
      });

      expect(result).toEqual(availability);
      expect(execute).not.toHaveBeenCalled();
      expect(Object.isFrozen(result)).toBe(true);
    },
  );

  it('preserves an expected failed result without throwing', async () => {
    const result = await executeCommand({
      command: defineCommand({
        execute: () => ({ reasonCode: 'contacts.conflict', retryable: true, status: 'failed' }),
        getAvailability: () => commandAvailable(),
        id: commandId,
      }),
      context,
      input: undefined,
    });

    expect(result).toEqual({ reasonCode: 'contacts.conflict', retryable: true, status: 'failed' });
  });

  it.each([
    ['availability', () => Promise.reject(new Error('private availability details'))],
    ['execution', () => commandAvailable()],
  ] as const)('redacts an unexpected %s exception', async (phase, getAvailability) => {
    const events: RuntimeEvent[] = [];
    const result = await executeCommand({
      command: defineCommand({
        execute: () => Promise.reject(new Error('private execution details')),
        getAvailability,
        id: commandId,
      }),
      context,
      input: undefined,
      observer: { onRuntimeEvent: (event) => events.push(event) },
    });

    expect(result).toEqual({
      reasonCode:
        phase === 'availability' ? 'command.availability-failed' : 'command.execution-failed',
      retryable: false,
      status: 'failed',
    });
    expect(JSON.stringify({ events, result })).not.toContain('private');
  });

  it('isolates observer failures from command behavior', async () => {
    const result = await executeCommand({
      command: defineCommand({
        execute: () => ({ status: 'succeeded', value: 42 }),
        getAvailability: () => commandAvailable(),
        id: commandId,
      }),
      context,
      input: undefined,
      observer: {
        onRuntimeEvent: () => {
          throw new Error('observer unavailable');
        },
      },
    });

    expect(result).toEqual({ status: 'succeeded', value: 42 });
  });
});
