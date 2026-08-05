import type { ErrorObject } from 'ajv';

import type {
  SchemaDiagnostic,
  SchemaDiagnosticCode,
  SchemaDiagnosticParameter,
  SchemaKind,
} from './SchemaValidation.types';

const SCHEMA_ID_PATTERN =
  /^urn:ribbon-ui:schema:(component|shared|workspace):[a-z0-9]+(?:-[a-z0-9]+)*:(\d+\.\d+\.\d+)$/u;

interface DiagnosticInput {
  readonly code: SchemaDiagnosticCode;
  readonly instancePath?: string;
  readonly keyword?: string;
  readonly message: string;
  readonly parameters?: Readonly<Record<string, SchemaDiagnosticParameter>>;
  readonly schemaId?: string;
  readonly schemaPath?: string;
}

function freezeParameter(value: SchemaDiagnosticParameter): SchemaDiagnosticParameter {
  if (Array.isArray(value)) {
    const items: readonly SchemaDiagnosticParameter[] = value;
    return Object.freeze(items.map((item) => freezeParameter(item)));
  }

  if (value !== null && typeof value === 'object') {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, item]) => [key, freezeParameter(item)]),
      ),
    );
  }

  return value;
}

function schemaMetadata(schemaId: string | undefined): {
  readonly schemaKind?: SchemaKind;
  readonly schemaVersion?: string;
} {
  if (schemaId === undefined) {
    return {};
  }

  const match = SCHEMA_ID_PATTERN.exec(schemaId);
  if (match === null) {
    return {};
  }

  const schemaVersion = match[2];
  if (schemaVersion === undefined) {
    return {};
  }

  return {
    schemaKind: match[1] as SchemaKind,
    schemaVersion,
  };
}

export function isSupportedSchemaId(schemaId: string): boolean {
  return SCHEMA_ID_PATTERN.test(schemaId);
}

export function createSchemaDiagnostic(input: DiagnosticInput): SchemaDiagnostic {
  const parameters = Object.freeze(
    Object.fromEntries(
      Object.entries(input.parameters ?? {})
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => [key, freezeParameter(value)]),
    ),
  );
  const metadata = schemaMetadata(input.schemaId);

  return Object.freeze({
    code: input.code,
    severity: 'error',
    ...(input.schemaId === undefined ? {} : { schemaId: input.schemaId }),
    ...metadata,
    instancePath: input.instancePath ?? '',
    schemaPath: input.schemaPath ?? '',
    message: input.message,
    ...(input.keyword === undefined ? {} : { keyword: input.keyword }),
    parameters,
  });
}

function safeMessage(keyword: string): string {
  switch (keyword) {
    case 'additionalProperties':
      return 'Unknown properties are not allowed.';
    case 'enum':
      return 'Value is not an allowed option.';
    case 'required':
      return 'A required property is missing.';
    case 'type':
      return 'Value has an invalid type.';
    default:
      return 'Schema validation failed.';
  }
}

function sanitizeParameter(value: unknown): SchemaDiagnosticParameter | undefined {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    const sanitized = value.map((item) => sanitizeParameter(item));
    return sanitized.every((item) => item !== undefined) ? sanitized : undefined;
  }

  if (typeof value === 'object') {
    const sanitizedEntries = Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, sanitizeParameter(item)] as const)
      .filter(
        (entry): entry is readonly [string, SchemaDiagnosticParameter] => entry[1] !== undefined,
      );
    return Object.fromEntries(sanitizedEntries);
  }

  return undefined;
}

function sanitizeParameters(
  keyword: string,
  parameters: Readonly<Record<string, unknown>>,
): Readonly<Record<string, SchemaDiagnosticParameter>> {
  const safeKeys = new Set(
    keyword === 'required'
      ? ['missingProperty']
      : keyword === 'type'
        ? ['type']
        : keyword === 'enum'
          ? ['allowedValues']
          : keyword === 'minLength' || keyword === 'maxLength'
            ? ['limit']
            : [],
  );

  return Object.fromEntries(
    Object.entries(parameters)
      .filter(([key]) => safeKeys.has(key))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, sanitizeParameter(value)] as const)
      .filter(
        (entry): entry is readonly [string, SchemaDiagnosticParameter] => entry[1] !== undefined,
      ),
  );
}

export function normalizeAjvDiagnostics(
  errors: readonly ErrorObject[],
  schemaId: string,
  maxDiagnostics: number,
): readonly SchemaDiagnostic[] {
  return Object.freeze(
    [...errors]
      .sort((left, right) =>
        [left.instancePath, left.schemaPath, left.keyword]
          .join('\u0000')
          .localeCompare([right.instancePath, right.schemaPath, right.keyword].join('\u0000')),
      )
      .slice(0, maxDiagnostics)
      .map((error) =>
        createSchemaDiagnostic({
          code: 'schema.validation_failed',
          instancePath: error.instancePath,
          keyword: error.keyword,
          message: safeMessage(error.keyword),
          parameters: sanitizeParameters(error.keyword, error.params),
          schemaId,
          schemaPath: error.schemaPath,
        }),
      ),
  );
}
