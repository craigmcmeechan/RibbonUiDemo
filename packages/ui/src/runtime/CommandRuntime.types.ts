import type { CapabilityId, CommandId, WorkspaceId, WorkspaceSectionId } from './RuntimeIds';
import type { RuntimeObserver } from './RuntimeObservability.types';

export interface CommandContext {
  readonly abortSignal: AbortSignal;
  readonly activeSectionId?: WorkspaceSectionId;
  readonly capabilities: readonly CapabilityId[];
  readonly workspaceId: WorkspaceId;
}

export type CommandAvailability =
  | Readonly<{ status: 'available' }>
  | Readonly<{ reasonCode: string; status: 'denied' }>
  | Readonly<{ reasonCode: string; status: 'unavailable' }>;

export type CommandExecutionResult<Output> =
  | Readonly<{ status: 'denied'; reasonCode: string }>
  | Readonly<{ status: 'failed'; reasonCode: string; retryable: boolean }>
  | Readonly<{ status: 'succeeded'; value: Output }>
  | Readonly<{ status: 'unavailable'; reasonCode: string }>;

export interface CommandDefinition<Input, Output> {
  readonly execute: (
    context: CommandContext,
    input: Input,
  ) => CommandExecutionResult<Output> | Promise<CommandExecutionResult<Output>>;
  readonly getAvailability: (
    context: CommandContext,
  ) => CommandAvailability | Promise<CommandAvailability>;
  readonly id: CommandId;
}

export interface CommandExecutionOptions<Input, Output> {
  readonly command: CommandDefinition<Input, Output>;
  readonly context: CommandContext;
  readonly input: Input;
  readonly observer?: RuntimeObserver;
}
