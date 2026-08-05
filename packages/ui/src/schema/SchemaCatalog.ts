import type { AnySchemaObject, ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';

import {
  createSchemaDiagnostic,
  isSupportedSchemaId,
  normalizeAjvDiagnostics,
} from './SchemaDiagnostics';
import type {
  SchemaCatalog,
  SchemaCatalogResult,
  SchemaValidationLimits,
  SchemaValidationResult,
} from './SchemaValidation.types';

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';

const DEFAULT_LIMITS = Object.freeze({
  maxCollectionItems: 10_000,
  maxDepth: 64,
  maxDiagnostics: 50,
  maxInputBytes: 256 * 1024,
}) satisfies SchemaValidationLimits;

const HARD_LIMITS = Object.freeze({
  maxCollectionItems: 100_000,
  maxDepth: 256,
  maxDiagnostics: 200,
  maxInputBytes: 10 * 1024 * 1024,
}) satisfies SchemaValidationLimits;

interface InputMeasurement {
  readonly bytes: number;
  readonly collectionItems: number;
}

interface InputFailure {
  readonly code:
    | 'schema.input.not_json'
    | 'schema.input.too_deep'
    | 'schema.input.too_large'
    | 'schema.input.too_many_items';
  readonly message: string;
}

interface PendingValue {
  readonly depth: number;
  readonly phase: 'enter' | 'leave';
  readonly value: unknown;
}

function jsonStringBytes(value: string): number {
  let bytes = 2;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (
      code === 0x22 ||
      code === 0x5c ||
      code === 0x08 ||
      code === 0x09 ||
      code === 0x0a ||
      code === 0x0c ||
      code === 0x0d
    ) {
      bytes += 2;
      continue;
    }
    if (code < 0x20 || (code >= 0xd800 && code <= 0xdfff)) {
      if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length) {
        const next = value.charCodeAt(index + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          bytes += 4;
          index += 1;
          continue;
        }
      }
      bytes += 6;
      continue;
    }
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : 3;
  }

  return bytes;
}

function measureJsonInput(
  input: unknown,
  limits: SchemaValidationLimits,
): InputFailure | InputMeasurement {
  const pending: PendingValue[] = [{ depth: 0, phase: 'enter', value: input }];
  const ancestors = new WeakSet<object>();
  let bytes = 0;
  let collectionItems = 0;

  while (pending.length > 0) {
    const current = pending.pop();
    if (current === undefined) {
      break;
    }

    const { depth, value } = current;
    if (current.phase === 'leave') {
      if (typeof value === 'object' && value !== null) {
        ancestors.delete(value);
      }
      continue;
    }
    if (depth > limits.maxDepth) {
      return { code: 'schema.input.too_deep', message: 'Input exceeds the nesting limit.' };
    }

    if (value === null) {
      bytes += 4;
    } else if (typeof value === 'string') {
      bytes += jsonStringBytes(value);
    } else if (typeof value === 'boolean') {
      bytes += value ? 4 : 5;
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      bytes += String(value).length;
    } else if (typeof value === 'object') {
      if (ancestors.has(value)) {
        return { code: 'schema.input.not_json', message: 'Input must be acyclic JSON data.' };
      }
      ancestors.add(value);
      pending.push({ depth, phase: 'leave', value });

      const isArray = Array.isArray(value);
      const prototype = Object.getPrototypeOf(value) as unknown;
      if (
        (!isArray && prototype !== Object.prototype && prototype !== null) ||
        Object.getOwnPropertySymbols(value).length > 0
      ) {
        return { code: 'schema.input.not_json', message: 'Input must contain only JSON data.' };
      }

      const descriptors = Object.getOwnPropertyDescriptors(value);
      const keys = Object.keys(value);
      const serializedPropertyNames = Object.getOwnPropertyNames(value).filter(
        (propertyName) => !isArray || propertyName !== 'length',
      );
      if (
        serializedPropertyNames.length !== keys.length ||
        serializedPropertyNames.some((propertyName, index) => propertyName !== keys[index]) ||
        (isArray &&
          (keys.length !== value.length || keys.some((key, index) => key !== String(index))))
      ) {
        return {
          code: 'schema.input.not_json',
          message: 'Input arrays must contain only JSON items.',
        };
      }

      collectionItems += keys.length;
      if (collectionItems > limits.maxCollectionItems) {
        return {
          code: 'schema.input.too_many_items',
          message: 'Input exceeds the collection-item limit.',
        };
      }

      bytes += 2 + Math.max(0, keys.length - 1) + (isArray ? 0 : keys.length);
      for (const key of keys) {
        const descriptor = descriptors[key];
        if (descriptor === undefined || !('value' in descriptor)) {
          return { code: 'schema.input.not_json', message: 'Input must not contain accessors.' };
        }
        if (!isArray) {
          bytes += jsonStringBytes(key);
        }
        pending.push({ depth: depth + 1, phase: 'enter', value: descriptor.value });
      }
    } else {
      return { code: 'schema.input.not_json', message: 'Input must contain only JSON data.' };
    }

    if (bytes > limits.maxInputBytes) {
      return { code: 'schema.input.too_large', message: 'Input exceeds the byte limit.' };
    }
  }

  return { bytes, collectionItems };
}

function resolveLimits(
  requested: Partial<SchemaValidationLimits> | undefined,
): SchemaValidationLimits | undefined {
  const limits = { ...DEFAULT_LIMITS, ...requested };
  const entries = Object.entries(limits) as readonly [keyof SchemaValidationLimits, number][];
  if (
    entries.some(
      ([key, value]) => !Number.isInteger(value) || value < 1 || value > HARD_LIMITS[key],
    )
  ) {
    return undefined;
  }

  return Object.freeze(limits);
}

function schemaRecord(value: unknown): Readonly<Record<string, unknown>> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : undefined;
}

function cloneSchema(schema: Readonly<Record<string, unknown>>): AnySchemaObject | undefined {
  try {
    const serialized = JSON.stringify(schema);
    return JSON.parse(serialized) as AnySchemaObject;
  } catch {
    return undefined;
  }
}

function catalogFailure(
  message: string,
  schemaId?: string,
  code:
    | 'schema.catalog.duplicate_id'
    | 'schema.catalog.invalid_limits'
    | 'schema.catalog.invalid_schema' = 'schema.catalog.invalid_schema',
): SchemaCatalogResult {
  return Object.freeze({
    ok: false,
    diagnostics: Object.freeze([
      createSchemaDiagnostic({ code, message, ...(schemaId === undefined ? {} : { schemaId }) }),
    ]),
  });
}

class CompiledSchemaCatalog implements SchemaCatalog {
  readonly schemaIds: readonly string[];
  readonly #limits: SchemaValidationLimits;
  readonly #validators: ReadonlyMap<string, ValidateFunction>;

  constructor(
    validators: ReadonlyMap<string, ValidateFunction>,
    schemaIds: readonly string[],
    limits: SchemaValidationLimits,
  ) {
    this.#validators = validators;
    this.schemaIds = Object.freeze([...schemaIds]);
    this.#limits = limits;
  }

  validate<Value = unknown>(schemaId: string, input: unknown): SchemaValidationResult<Value> {
    const validator = this.#validators.get(schemaId);
    if (validator === undefined) {
      return Object.freeze({
        ok: false,
        diagnostics: Object.freeze([
          createSchemaDiagnostic({
            code: 'schema.unknown_id',
            message: 'Schema ID is not registered.',
          }),
        ]),
      });
    }

    const measurement = measureJsonInput(input, this.#limits);
    if ('code' in measurement) {
      return Object.freeze({
        ok: false,
        diagnostics: Object.freeze([
          createSchemaDiagnostic({
            code: measurement.code,
            message: measurement.message,
            schemaId,
          }),
        ]),
      });
    }

    if (!validator(input)) {
      return Object.freeze({
        ok: false,
        diagnostics: normalizeAjvDiagnostics(
          validator.errors ?? [],
          schemaId,
          this.#limits.maxDiagnostics,
        ),
      });
    }

    return Object.freeze({ ok: true, schemaId, value: input as Value });
  }
}

export function createSchemaCatalog(
  schemas: readonly unknown[],
  requestedLimits?: Partial<SchemaValidationLimits>,
): SchemaCatalogResult {
  const limits = resolveLimits(requestedLimits);
  if (limits === undefined) {
    return catalogFailure(
      'Validation limits must be positive integers within the supported bounds.',
      undefined,
      'schema.catalog.invalid_limits',
    );
  }

  const clonedSchemas = new Map<string, AnySchemaObject>();
  for (const candidate of schemas) {
    const record = schemaRecord(candidate);
    if (record === undefined) {
      return catalogFailure(
        'Schema must declare the supported Draft 2020-12 dialect and a versioned RibbonUI ID.',
      );
    }

    const schemaMeasurement = measureJsonInput(record, HARD_LIMITS);
    if ('code' in schemaMeasurement) {
      return catalogFailure('Schema definitions must contain only bounded JSON data.');
    }

    const schemaId = record['$id'];
    const dialect = record['$schema'];
    if (
      typeof schemaId !== 'string' ||
      !isSupportedSchemaId(schemaId) ||
      dialect !== DRAFT_2020_12
    ) {
      return catalogFailure(
        'Schema must declare the supported Draft 2020-12 dialect and a versioned RibbonUI ID.',
        typeof schemaId === 'string' ? schemaId : undefined,
      );
    }
    if (clonedSchemas.has(schemaId)) {
      return catalogFailure(
        'Schema ID is registered more than once.',
        schemaId,
        'schema.catalog.duplicate_id',
      );
    }

    const cloned = cloneSchema(record);
    if (cloned === undefined) {
      return catalogFailure('Schema must be serializable JSON.', schemaId);
    }
    clonedSchemas.set(schemaId, cloned);
  }

  const ajv = new Ajv2020({
    allErrors: true,
    coerceTypes: false,
    messages: false,
    ownProperties: true,
    removeAdditional: false,
    strict: true,
    strictRequired: true,
    useDefaults: false,
    validateSchema: true,
  });

  try {
    for (const schema of clonedSchemas.values()) {
      if (!ajv.validateSchema(schema)) {
        return catalogFailure('Schema does not satisfy the Draft 2020-12 meta-schema.', schema.$id);
      }
      ajv.addSchema(schema);
    }

    const validators = new Map<string, ValidateFunction>();
    for (const schemaId of clonedSchemas.keys()) {
      const validator = ajv.getSchema(schemaId);
      if (validator === undefined) {
        return catalogFailure('Schema could not be compiled.', schemaId);
      }
      validators.set(schemaId, validator);
    }

    return Object.freeze({
      ok: true,
      catalog: Object.freeze(
        new CompiledSchemaCatalog(validators, [...clonedSchemas.keys()].sort(), limits),
      ),
    });
  } catch {
    return catalogFailure('Schema could not be compiled with its allowlisted references.');
  }
}
