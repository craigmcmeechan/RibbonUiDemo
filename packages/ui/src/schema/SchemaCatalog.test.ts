import { describe, expect, it } from 'vitest';

import { createSchemaCatalog } from './SchemaCatalog';
import type {
  SchemaCatalog,
  SchemaCatalogResult,
  SchemaDiagnosticCode,
  SchemaValidationLimits,
} from './SchemaValidation.types';

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';
const COMPONENT_SCHEMA_ID = 'urn:ribbon-ui:schema:component:test-control:1.0.0';
const SHARED_SCHEMA_ID = 'urn:ribbon-ui:schema:shared:test-label:1.0.0';

function componentSchema(): Record<string, unknown> {
  return {
    $id: COMPONENT_SCHEMA_ID,
    $schema: DRAFT_2020_12,
    additionalProperties: false,
    properties: {
      count: { type: 'integer' },
      label: { default: 'Untitled', minLength: 1, type: 'string' },
      variant: { enum: ['primary', 'secondary'] },
    },
    required: ['count', 'variant'],
    type: 'object',
  };
}

function requireCatalog(
  schemas: readonly unknown[] = [componentSchema()],
  limits?: Partial<SchemaValidationLimits>,
): SchemaCatalog {
  const result = createSchemaCatalog(schemas, limits);
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error('Expected a compiled schema catalog.');
  }
  return result.catalog;
}

function expectCatalogFailure(result: SchemaCatalogResult, code: SchemaDiagnosticCode): void {
  expect(result.ok).toBe(false);
  if (result.ok) {
    throw new Error('Expected schema catalog creation to fail.');
  }
  expect(result.diagnostics).toHaveLength(1);
  expect(result.diagnostics[0]?.code).toBe(code);
}

describe('createSchemaCatalog', () => {
  it('compiles supported schemas once and exposes sorted immutable IDs', () => {
    const sharedSchema = {
      $id: SHARED_SCHEMA_ID,
      $schema: DRAFT_2020_12,
      minLength: 1,
      type: 'string',
    };
    const referringSchema = {
      $id: COMPONENT_SCHEMA_ID,
      $schema: DRAFT_2020_12,
      additionalProperties: false,
      properties: { label: { $ref: SHARED_SCHEMA_ID } },
      required: ['label'],
      type: 'object',
    };
    const catalog = requireCatalog([sharedSchema, referringSchema]);

    expect(catalog.schemaIds).toEqual([COMPONENT_SCHEMA_ID, SHARED_SCHEMA_ID]);
    expect(Object.isFrozen(catalog.schemaIds)).toBe(true);
    expect(catalog.validate(COMPONENT_SCHEMA_ID, { label: 'Ready' })).toMatchObject({
      ok: true,
      schemaId: COMPONENT_SCHEMA_ID,
    });
  });

  it('returns a typed success without coercing, defaulting, or mutating input', () => {
    const catalog = requireCatalog();
    const input = { count: 1, variant: 'primary' };
    const before = JSON.stringify(input);
    const result = catalog.validate<typeof input>(COMPONENT_SCHEMA_ID, input);

    expect(result).toEqual({ ok: true, schemaId: COMPONENT_SCHEMA_ID, value: input });
    expect(result.ok && result.value).toBe(input);
    expect(input).not.toHaveProperty('label');
    expect(JSON.stringify(input)).toBe(before);
  });

  it('rejects invalid input with stable, ordered, capped, redacted diagnostics', () => {
    const catalog = requireCatalog([componentSchema()], { maxDiagnostics: 2 });
    const secret = 'DO-NOT-LEAK-THIS-VALUE';
    const input = { extra: true, variant: secret };
    const before = JSON.stringify(input);
    const first = catalog.validate(COMPONENT_SCHEMA_ID, input);
    const second = catalog.validate(COMPONENT_SCHEMA_ID, input);

    expect(first).toEqual(second);
    expect(first.ok).toBe(false);
    if (first.ok) {
      throw new Error('Expected validation to fail.');
    }
    expect(first.diagnostics).toHaveLength(2);
    expect(
      first.diagnostics.map(({ instancePath, schemaPath, keyword }) => ({
        instancePath,
        keyword,
        schemaPath,
      })),
    ).toEqual(
      [...first.diagnostics]
        .sort((left, right) =>
          [left.instancePath, left.schemaPath, left.keyword ?? '']
            .join('\u0000')
            .localeCompare(
              [right.instancePath, right.schemaPath, right.keyword ?? ''].join('\u0000'),
            ),
        )
        .map(({ instancePath, schemaPath, keyword }) => ({
          instancePath,
          keyword,
          schemaPath,
        })),
    );
    expect(JSON.stringify(first.diagnostics)).not.toContain(secret);
    expect(JSON.stringify(input)).toBe(before);
    expect(first.diagnostics.every((diagnostic) => Object.isFrozen(diagnostic))).toBe(true);
  });

  it('returns deterministic metadata for an unknown schema ID', () => {
    const result = requireCatalog().validate(
      'urn:ribbon-ui:schema:component:not-registered:2.3.4',
      {},
    );

    expect(result).toEqual({
      diagnostics: [
        {
          code: 'schema.unknown_id',
          instancePath: '',
          message: 'Schema ID is not registered.',
          parameters: {},
          schemaPath: '',
          severity: 'error',
        },
      ],
      ok: false,
    });
  });

  it('normalizes required, type, length, and enum validation failures', () => {
    const catalog = requireCatalog();
    const cases = [
      { count: 1, label: '', variant: 'primary' },
      { count: '1', variant: 'primary' },
      { count: 1, variant: 'unsupported' },
      { variant: 'primary' },
    ];

    const keywords = cases.flatMap((input) => {
      const result = catalog.validate(COMPONENT_SCHEMA_ID, input);
      expect(result.ok).toBe(false);
      return result.ok ? [] : result.diagnostics.map(({ keyword }) => keyword);
    });

    expect(keywords).toEqual(expect.arrayContaining(['enum', 'minLength', 'required', 'type']));
  });

  it('measures JSON string encodings, primitives, arrays, and null-prototype objects', () => {
    const schemaId = 'urn:ribbon-ui:schema:shared:json-value:1.0.0';
    const catalog = requireCatalog([
      {
        $id: schemaId,
        $schema: DRAFT_2020_12,
      },
    ]);
    const nullPrototype = Object.assign(Object.create(null) as Record<string, unknown>, {
      key: 'value',
    });
    const values = [
      null,
      false,
      true,
      1,
      '"\\\b\t\n\f\r\u0001é漢😀\ud800',
      [1, 'two'],
      nullPrototype,
    ];

    for (const value of values) {
      expect(catalog.validate(schemaId, value).ok).toBe(true);
    }
  });

  it('accepts repeated acyclic references while rejecting hidden object properties', () => {
    const schemaId = 'urn:ribbon-ui:schema:shared:json-value:1.0.0';
    const catalog = requireCatalog([{ $id: schemaId, $schema: DRAFT_2020_12 }]);
    const shared = { value: true };
    const aliased = { first: shared, second: shared };
    const hidden = Object.defineProperty({}, 'callback', {
      enumerable: false,
      value: () => undefined,
    });

    expect(catalog.validate(schemaId, aliased).ok).toBe(true);
    const hiddenResult = catalog.validate(schemaId, hidden);
    expect(hiddenResult.ok).toBe(false);
    if (!hiddenResult.ok) {
      expect(hiddenResult.diagnostics[0]?.code).toBe('schema.input.not_json');
    }
  });

  it.each([
    { input: { nested: { value: true } }, limits: { maxDepth: 1 }, code: 'schema.input.too_deep' },
    {
      input: { label: 'long value' },
      limits: { maxInputBytes: 10 },
      code: 'schema.input.too_large',
    },
    {
      input: { first: true, second: true },
      limits: { maxCollectionItems: 1 },
      code: 'schema.input.too_many_items',
    },
  ] as const)('enforces $code before schema validation', ({ input, limits, code }) => {
    const result = requireCatalog([componentSchema()], limits).validate(COMPONENT_SCHEMA_ID, input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]?.code).toBe(code);
    }
  });

  it.each([
    {
      name: 'cyclic objects',
      value: (() => {
        const item: { self?: unknown } = {};
        item.self = item;
        return item;
      })(),
    },
    { name: 'sparse arrays', value: new Array(2) },
    { name: 'non-finite numbers', value: { count: Number.POSITIVE_INFINITY } },
    { name: 'non-JSON prototypes', value: new Date(0) },
    { name: 'functions', value: { callback: () => undefined } },
    { name: 'symbol properties', value: { [Symbol('hidden')]: true } },
    {
      name: 'accessors',
      value: Object.defineProperty({}, 'secret', { enumerable: true, get: () => 'hidden' }),
    },
  ])('rejects $name without evaluating or serializing the value', ({ value }) => {
    const result = requireCatalog().validate(COMPONENT_SCHEMA_ID, value);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics[0]?.code).toBe('schema.input.not_json');
    }
  });

  it('defensively clones schema definitions before compiling them', () => {
    const schema = componentSchema();
    const catalog = requireCatalog([schema]);
    const properties = schema['properties'] as Record<string, unknown>;
    properties['unexpected'] = { type: 'string' };

    const result = catalog.validate(COMPONENT_SCHEMA_ID, {
      count: 1,
      unexpected: 'not in the compiled schema',
      variant: 'primary',
    });

    expect(result.ok).toBe(false);
  });

  it('fails duplicate, malformed, invalid, and unresolved schema catalogs safely', () => {
    expectCatalogFailure(
      createSchemaCatalog([componentSchema(), componentSchema()]),
      'schema.catalog.duplicate_id',
    );
    expectCatalogFailure(
      createSchemaCatalog([{ $id: 'unversioned', type: 'object' }]),
      'schema.catalog.invalid_schema',
    );
    expectCatalogFailure(createSchemaCatalog([null]), 'schema.catalog.invalid_schema');
    expectCatalogFailure(
      createSchemaCatalog([
        {
          $id: COMPONENT_SCHEMA_ID,
          $schema: DRAFT_2020_12,
          example: BigInt(1),
          type: 'object',
        },
      ]),
      'schema.catalog.invalid_schema',
    );
    expectCatalogFailure(
      createSchemaCatalog([
        {
          $id: COMPONENT_SCHEMA_ID,
          $schema: DRAFT_2020_12,
          type: 'not-a-json-schema-type',
        },
      ]),
      'schema.catalog.invalid_schema',
    );
    expectCatalogFailure(
      createSchemaCatalog([
        {
          $id: COMPONENT_SCHEMA_ID,
          $ref: 'urn:ribbon-ui:schema:shared:missing:1.0.0',
          $schema: DRAFT_2020_12,
        },
      ]),
      'schema.catalog.invalid_schema',
    );
    let getterWasRead = false;
    const unsafeSchema = Object.defineProperty({}, '$id', {
      enumerable: true,
      get: () => {
        getterWasRead = true;
        return COMPONENT_SCHEMA_ID;
      },
    });
    expectCatalogFailure(createSchemaCatalog([unsafeSchema]), 'schema.catalog.invalid_schema');
    expect(getterWasRead).toBe(false);
  });

  it.each([
    { maxDiagnostics: 0 },
    { maxDepth: 257 },
    { maxCollectionItems: 1.5 },
    { maxInputBytes: Number.NaN },
  ])('rejects unsupported validation limits: %j', (limits) => {
    expectCatalogFailure(
      createSchemaCatalog([componentSchema()], limits),
      'schema.catalog.invalid_limits',
    );
  });
});
