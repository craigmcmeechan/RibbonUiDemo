import type {
  CommandAvailability,
  CommandDefinition,
  CommandExecutionOptions,
  CommandExecutionResult,
} from './CommandRuntime.types';
import { emitRuntimeEvent } from './RuntimeObservability';

const available = Object.freeze({ status: 'available' }) satisfies CommandAvailability;

export function commandAvailable(): CommandAvailability {
  return available;
}

export function commandDenied(reasonCode: string): CommandAvailability {
  return Object.freeze({ reasonCode, status: 'denied' });
}

export function commandUnavailable(reasonCode: string): CommandAvailability {
  return Object.freeze({ reasonCode, status: 'unavailable' });
}

export function defineCommand<Input, Output>(
  definition: CommandDefinition<Input, Output>,
): CommandDefinition<Input, Output> {
  return Object.freeze({ ...definition });
}

function freezeResult<Output>(
  result: CommandExecutionResult<Output>,
): CommandExecutionResult<Output> {
  return Object.freeze(result);
}

type FailedCommandResult = Extract<CommandExecutionResult<never>, { status: 'failed' }>;

function failure(reasonCode: string): FailedCommandResult {
  return Object.freeze({ reasonCode, retryable: false, status: 'failed' });
}

export async function executeCommand<Input, Output>({
  command,
  context,
  input,
  observer,
}: CommandExecutionOptions<Input, Output>): Promise<CommandExecutionResult<Output>> {
  const commandContext = Object.freeze({
    ...context,
    capabilities: Object.freeze([...context.capabilities]),
  });
  emitRuntimeEvent(observer, {
    commandId: command.id,
    type: 'command.execution-started',
    workspaceId: commandContext.workspaceId,
  });

  let availability: CommandAvailability;
  try {
    availability = await command.getAvailability(commandContext);
  } catch {
    const result = failure('command.availability-failed');
    emitRuntimeEvent(observer, {
      commandId: command.id,
      outcome: result.status,
      reasonCode: result.reasonCode,
      type: 'command.execution-completed',
      workspaceId: commandContext.workspaceId,
    });
    return result;
  }

  if (availability.status !== 'available') {
    const result = Object.freeze({
      reasonCode: availability.reasonCode,
      status: availability.status,
    });
    emitRuntimeEvent(observer, {
      commandId: command.id,
      outcome: result.status,
      reasonCode: result.reasonCode,
      type: 'command.execution-completed',
      workspaceId: commandContext.workspaceId,
    });
    return result;
  }

  try {
    const result = freezeResult<Output>(await command.execute(commandContext, input));
    const completedEvent =
      result.status === 'succeeded'
        ? {
            commandId: command.id,
            outcome: result.status,
            type: 'command.execution-completed' as const,
            workspaceId: commandContext.workspaceId,
          }
        : {
            commandId: command.id,
            outcome: result.status,
            reasonCode: result.reasonCode,
            type: 'command.execution-completed' as const,
            workspaceId: commandContext.workspaceId,
          };
    emitRuntimeEvent(observer, completedEvent);
    return result;
  } catch {
    const result = failure('command.execution-failed');
    emitRuntimeEvent(observer, {
      commandId: command.id,
      outcome: result.status,
      reasonCode: result.reasonCode,
      type: 'command.execution-completed',
      workspaceId: commandContext.workspaceId,
    });
    return result;
  }
}
