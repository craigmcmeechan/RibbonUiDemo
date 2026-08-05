const runtimeIdPattern = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/u;
const maximumRuntimeIdLength = 128;

declare const runtimeIdBrand: unique symbol;

type RuntimeId<Kind extends string> = string & {
  readonly [runtimeIdBrand]: Kind;
};

export type CapabilityId = RuntimeId<'capability'>;
export type CommandId = RuntimeId<'command'>;
export type WorkspaceId = RuntimeId<'workspace'>;
export type WorkspaceSectionId = RuntimeId<'workspace-section'>;

export type RuntimeIdResult<Id extends string> =
  | Readonly<{ id: Id; status: 'valid' }>
  | Readonly<{ reasonCode: 'runtime-id.invalid'; status: 'invalid' }>;

function parseRuntimeId<Id extends string>(value: string): RuntimeIdResult<Id> {
  if (
    value.length === 0 ||
    value.length > maximumRuntimeIdLength ||
    !runtimeIdPattern.test(value)
  ) {
    return Object.freeze({ reasonCode: 'runtime-id.invalid', status: 'invalid' });
  }

  return Object.freeze({ id: value as Id, status: 'valid' });
}

export function createCapabilityId(value: string): RuntimeIdResult<CapabilityId> {
  return parseRuntimeId(value);
}

export function createCommandId(value: string): RuntimeIdResult<CommandId> {
  return parseRuntimeId(value);
}

export function createWorkspaceId(value: string): RuntimeIdResult<WorkspaceId> {
  return parseRuntimeId(value);
}

export function createWorkspaceSectionId(value: string): RuntimeIdResult<WorkspaceSectionId> {
  return parseRuntimeId(value);
}
