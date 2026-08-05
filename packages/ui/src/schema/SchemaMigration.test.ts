import { describe, expect, it, vi } from 'vitest';

import { createSchemaCatalog } from './SchemaCatalog';
import { createSchemaMigrationPipeline } from './SchemaMigration';
import type {
  SchemaCatalog,
  SchemaMigration,
  SchemaMigrationPipeline,
  SchemaMigrationPipelineResult,
} from './SchemaValidation.types';

const DRAFT_2020_12 = 'https://json-schema.org/draft/2020-12/schema';
const WORKSPACE_SCHEMA_ID = 'urn:ribbon-ui:schema:workspace:test-workspace:1.2.0';

function currentCatalog(): SchemaCatalog {
  const result = createSchemaCatalog([
    {
      $id: WORKSPACE_SCHEMA_ID,
      $schema: DRAFT_2020_12,
      additionalProperties: false,
      properties: {
        displayMode: { default: 'list', enum: ['cards', 'list'] },
        name: { minLength: 1, type: 'string' },
        schemaVersion: { const: '1.2.0' },
      },
      required: ['name', 'schemaVersion'],
      type: 'object',
    },
  ]);
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error('Expected a current workspace catalog.');
  }
  return result.catalog;
}

function record(input: unknown): Readonly<Record<string, unknown>> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Expected a migration record.');
  }
  return input as Readonly<Record<string, unknown>>;
}

function sequentialMigrations(): readonly SchemaMigration[] {
  return [
    {
      fromVersion: '1.0.0',
      migrate: (input) => {
        const source = record(input);
        return { name: source['title'], schemaVersion: '1.1.0' };
      },
      toVersion: '1.1.0',
    },
    {
      fromVersion: '1.1.0',
      migrate: (input) => ({ ...record(input), schemaVersion: '1.2.0' }),
      toVersion: '1.2.0',
    },
  ];
}

function requirePipeline(
  migrations: readonly SchemaMigration[] = sequentialMigrations(),
): SchemaMigrationPipeline {
  const result = createSchemaMigrationPipeline({
    catalog: currentCatalog(),
    currentVersion: '1.2.0',
    migrations,
    schemaId: WORKSPACE_SCHEMA_ID,
  });
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error('Expected a compiled migration pipeline.');
  }
  return result.pipeline;
}

function expectPipelineFailure(result: SchemaMigrationPipelineResult, code: string): void {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]?.code).toBe(code);
  }
}

describe('schema migration pipeline', () => {
  it('runs sequential v1 migrations, normalizes defaults, and preserves the source', () => {
    const pipeline = requirePipeline();
    const input = { schemaVersion: '1.0.0', title: 'Contacts' };
    const before = JSON.stringify(input);
    const first = pipeline.migrate(input);
    const second = pipeline.migrate(input);

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      ok: true,
      value: { displayMode: 'list', name: 'Contacts', schemaVersion: '1.2.0' },
    });
    expect(JSON.stringify(input)).toBe(before);
    expect(pipeline.currentVersion).toBe('1.2.0');
    expect(pipeline.schemaId).toBe(WORKSPACE_SCHEMA_ID);
    expect(pipeline.supportedSourceVersions).toEqual(['1.0.0', '1.1.0', '1.2.0']);
    expect(Object.isFrozen(pipeline.supportedSourceVersions)).toBe(true);
    if (first.ok) {
      expect(Object.isFrozen(first.value)).toBe(true);
    }
  });

  it('bypasses migration functions for the exact current version', () => {
    const migrate = vi.fn<(input: unknown) => unknown>((input) => input);
    const pipeline = requirePipeline([{ fromVersion: '1.1.0', migrate, toVersion: '1.2.0' }]);
    const result = pipeline.migrate({ name: 'Products', schemaVersion: '1.2.0' });

    expect(result).toMatchObject({
      ok: true,
      value: { displayMode: 'list', name: 'Products', schemaVersion: '1.2.0' },
    });
    expect(migrate).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { schemaVersion: 'not-a-version' },
    { schemaVersion: '1.1.5' },
    { schemaVersion: '1.3.0' },
    { schemaVersion: '2.0.0' },
  ])('rejects unknown, unavailable, future, and cross-major versions: %j', (input) => {
    const result = requirePipeline().migrate(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.diagnostics[0]?.code).toBe('schema.migration.unknown_version');
      expect(result.diagnostics[0]).not.toHaveProperty('sourceVersion');
    }
  });

  it('reports thrown and mutating migration steps without exposing exceptions', () => {
    const throwing = requirePipeline([
      {
        fromVersion: '1.1.0',
        migrate: () => {
          throw new Error('secret migration stack');
        },
        toVersion: '1.2.0',
      },
    ]).migrate({ name: 'Contacts', schemaVersion: '1.1.0' });
    expect(throwing.ok).toBe(false);
    if (!throwing.ok) {
      expect(throwing.diagnostics[0]?.code).toBe('schema.migration.failed');
      expect(JSON.stringify(throwing.diagnostics)).not.toContain('secret migration stack');
    }

    const mutating = requirePipeline([
      {
        fromVersion: '1.1.0',
        migrate: (input) => {
          (input as Record<string, unknown>)['name'] = 'Changed';
          return input;
        },
        toVersion: '1.2.0',
      },
    ]).migrate({ name: 'Contacts', schemaVersion: '1.1.0' });
    expect(mutating.ok).toBe(false);
    if (!mutating.ok) {
      expect(mutating.diagnostics[0]?.code).toBe('schema.migration.failed');
    }
  });

  it('rejects invalid migration output and invalid final documents', () => {
    const wrongVersion = requirePipeline([
      {
        fromVersion: '1.1.0',
        migrate: () => ({ schemaVersion: '1.1.0' }),
        toVersion: '1.2.0',
      },
    ]).migrate({ name: 'Contacts', schemaVersion: '1.1.0' });
    expect(wrongVersion.ok).toBe(false);
    if (!wrongVersion.ok) {
      expect(wrongVersion.diagnostics[0]).toMatchObject({
        code: 'schema.migration.invalid_result',
        sourceVersion: '1.1.0',
        targetVersion: '1.2.0',
      });
    }

    const invalidFinal = requirePipeline([
      {
        fromVersion: '1.1.0',
        migrate: () => ({ name: '', schemaVersion: '1.2.0' }),
        toVersion: '1.2.0',
      },
    ]).migrate({ name: 'sensitive source value', schemaVersion: '1.1.0' });
    expect(invalidFinal.ok).toBe(false);
    if (!invalidFinal.ok) {
      expect(invalidFinal.diagnostics[0]?.code).toBe('schema.validation_failed');
      expect(JSON.stringify(invalidFinal.diagnostics)).not.toContain('sensitive source value');
    }
  });

  it('rejects unsafe migration results without evaluating accessors', () => {
    let getterWasRead = false;
    const result = requirePipeline([
      {
        fromVersion: '1.1.0',
        migrate: () =>
          Object.defineProperty({}, 'schemaVersion', {
            enumerable: true,
            get: () => {
              getterWasRead = true;
              return '1.2.0';
            },
          }),
        toVersion: '1.2.0',
      },
    ]).migrate({ name: 'Contacts', schemaVersion: '1.1.0' });

    expect(result.ok).toBe(false);
    expect(getterWasRead).toBe(false);
  });

  it('rejects duplicate, malformed, cross-major, missing-path, and unknown-schema registries', () => {
    const base = {
      catalog: currentCatalog(),
      currentVersion: '1.2.0',
      schemaId: WORKSPACE_SCHEMA_ID,
    };
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [
          ...sequentialMigrations(),
          { fromVersion: '1.0.0', migrate: (input) => input, toVersion: '1.2.0' },
        ],
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        currentVersion: '1.1.0',
        migrations: [],
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [
          {
            fromVersion: '1.9007199254740992.0',
            migrate: (input) => input,
            toVersion: '1.2.0',
          },
        ],
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [{ fromVersion: '1.0', migrate: (input) => input, toVersion: '1.2.0' }],
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [{ fromVersion: '1.1.0', migrate: (input) => input, toVersion: '2.0.0' }],
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [{ fromVersion: '1.0.0', migrate: (input) => input, toVersion: '1.1.0' }],
      }),
      'schema.migration.missing_step',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({
        ...base,
        migrations: [],
        schemaId: 'urn:ribbon-ui:schema:workspace:missing:1.2.0',
      }),
      'schema.migration.invalid_registry',
    );
    expectPipelineFailure(
      createSchemaMigrationPipeline({ ...base, currentVersion: '2.0.0', migrations: [] }),
      'schema.migration.invalid_registry',
    );
  });
});
