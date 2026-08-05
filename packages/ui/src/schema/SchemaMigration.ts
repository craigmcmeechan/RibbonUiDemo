import { cloneBoundedJsonValue, freezeJsonValue } from './SchemaCatalog';
import { createSchemaDiagnostic } from './SchemaDiagnostics';
import type {
  SchemaDiagnostic,
  SchemaDiagnosticCode,
  SchemaMigration,
  SchemaMigrationPipeline,
  SchemaMigrationPipelineOptions,
  SchemaMigrationPipelineResult,
  SchemaValidationResult,
} from './SchemaValidation.types';

type SchemaFailure = {
  readonly ok: false;
  readonly diagnostics: readonly SchemaDiagnostic[];
};

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u;

interface ParsedVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

function parseVersion(version: string): ParsedVersion | undefined {
  const match = VERSION_PATTERN.exec(version);
  if (
    match === null ||
    match[1] === undefined ||
    match[2] === undefined ||
    match[3] === undefined
  ) {
    return undefined;
  }

  const parts = [Number(match[1]), Number(match[2]), Number(match[3])] as const;
  if (parts.some((part) => !Number.isSafeInteger(part))) {
    return undefined;
  }

  return { major: parts[0], minor: parts[1], patch: parts[2] };
}

function compareVersions(left: ParsedVersion, right: ParsedVersion): number {
  return left.major - right.major || left.minor - right.minor || left.patch - right.patch;
}

function pipelineFailure(
  code: SchemaDiagnosticCode,
  message: string,
  schemaId?: string,
): SchemaMigrationPipelineResult {
  return Object.freeze({
    ok: false,
    diagnostics: Object.freeze([
      createSchemaDiagnostic({
        code,
        message,
        ...(schemaId === undefined ? {} : { schemaId }),
      }),
    ]),
  });
}

function migrationFailure(
  code: SchemaDiagnosticCode,
  message: string,
  schemaId: string,
  sourceVersion?: string,
  targetVersion?: string,
): SchemaFailure {
  return Object.freeze({
    ok: false,
    diagnostics: Object.freeze([
      createSchemaDiagnostic({
        code,
        message,
        schemaId,
        ...(sourceVersion === undefined ? {} : { sourceVersion }),
        ...(targetVersion === undefined ? {} : { targetVersion }),
      }),
    ]),
  });
}

function documentVersion(input: unknown): string | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return undefined;
  }
  const version = (input as Readonly<Record<string, unknown>>)['schemaVersion'];
  return typeof version === 'string' ? version : undefined;
}

class CompiledMigrationPipeline implements SchemaMigrationPipeline {
  readonly currentVersion: string;
  readonly schemaId: string;
  readonly supportedSourceVersions: readonly string[];
  readonly #catalog: SchemaMigrationPipelineOptions['catalog'];
  readonly #migrations: ReadonlyMap<string, SchemaMigration>;

  constructor(
    options: SchemaMigrationPipelineOptions,
    migrations: ReadonlyMap<string, SchemaMigration>,
  ) {
    this.#catalog = options.catalog;
    this.currentVersion = options.currentVersion;
    this.schemaId = options.schemaId;
    this.#migrations = migrations;
    this.supportedSourceVersions = Object.freeze([
      ...[...migrations.keys()].sort((left, right) => {
        const leftVersion = parseVersion(left);
        const rightVersion = parseVersion(right);
        return leftVersion === undefined || rightVersion === undefined
          ? left.localeCompare(right)
          : compareVersions(leftVersion, rightVersion);
      }),
      options.currentVersion,
    ]);
  }

  migrate<Value = unknown>(input: unknown): SchemaValidationResult<Value> {
    const cloned = cloneBoundedJsonValue(input);
    if ('code' in cloned) {
      return migrationFailure(cloned.code, cloned.message, this.schemaId);
    }

    let currentValue = freezeJsonValue(cloned.value);
    const sourceVersion = documentVersion(currentValue);
    const parsedSource = sourceVersion === undefined ? undefined : parseVersion(sourceVersion);
    const parsedCurrent = parseVersion(this.currentVersion);
    if (
      sourceVersion === undefined ||
      parsedSource === undefined ||
      parsedCurrent === undefined ||
      parsedSource.major !== parsedCurrent.major ||
      compareVersions(parsedSource, parsedCurrent) > 0 ||
      (sourceVersion !== this.currentVersion && !this.#migrations.has(sourceVersion))
    ) {
      return migrationFailure(
        'schema.migration.unknown_version',
        'Document schema version is not supported.',
        this.schemaId,
      );
    }

    let activeVersion = sourceVersion;
    while (activeVersion !== this.currentVersion) {
      const migration = this.#migrations.get(activeVersion);
      if (migration === undefined) {
        return migrationFailure(
          'schema.migration.missing_step',
          'A required migration step is unavailable.',
          this.schemaId,
          activeVersion,
          this.currentVersion,
        );
      }

      let migrated: unknown;
      try {
        migrated = migration.migrate(currentValue);
      } catch {
        return migrationFailure(
          'schema.migration.failed',
          'A migration step failed.',
          this.schemaId,
          migration.fromVersion,
          migration.toVersion,
        );
      }

      const migratedClone = cloneBoundedJsonValue(migrated);
      if (
        'code' in migratedClone ||
        documentVersion('code' in migratedClone ? undefined : migratedClone.value) !==
          migration.toVersion
      ) {
        return migrationFailure(
          'schema.migration.invalid_result',
          'A migration step returned an invalid result.',
          this.schemaId,
          migration.fromVersion,
          migration.toVersion,
        );
      }

      currentValue = freezeJsonValue(migratedClone.value);
      activeVersion = migration.toVersion;
    }

    return this.#catalog.normalize<Value>(this.schemaId, currentValue);
  }
}

export function createSchemaMigrationPipeline(
  options: SchemaMigrationPipelineOptions,
): SchemaMigrationPipelineResult {
  const parsedCurrent = parseVersion(options.currentVersion);
  if (
    parsedCurrent === undefined ||
    parsedCurrent.major !== 1 ||
    !options.schemaId.startsWith('urn:ribbon-ui:schema:workspace:') ||
    !options.schemaId.endsWith(`:${options.currentVersion}`) ||
    !options.catalog.schemaIds.includes(options.schemaId)
  ) {
    return pipelineFailure(
      'schema.migration.invalid_registry',
      'Migration registry configuration is invalid.',
      options.schemaId,
    );
  }

  const migrations = new Map<string, SchemaMigration>();
  for (const candidate of options.migrations) {
    const fromVersion = parseVersion(candidate.fromVersion);
    const toVersion = parseVersion(candidate.toVersion);
    if (
      fromVersion === undefined ||
      toVersion === undefined ||
      fromVersion.major !== 1 ||
      toVersion.major !== 1 ||
      compareVersions(fromVersion, toVersion) >= 0 ||
      compareVersions(toVersion, parsedCurrent) > 0 ||
      migrations.has(candidate.fromVersion)
    ) {
      return pipelineFailure(
        'schema.migration.invalid_registry',
        'Migration registry contains an invalid or duplicate step.',
        options.schemaId,
      );
    }
    migrations.set(
      candidate.fromVersion,
      Object.freeze({
        fromVersion: candidate.fromVersion,
        migrate: candidate.migrate,
        toVersion: candidate.toVersion,
      }),
    );
  }

  for (const sourceVersion of migrations.keys()) {
    const visited = new Set<string>();
    let activeVersion = sourceVersion;
    while (activeVersion !== options.currentVersion) {
      if (visited.has(activeVersion)) {
        return pipelineFailure(
          'schema.migration.invalid_registry',
          'Migration registry contains a cycle.',
          options.schemaId,
        );
      }
      visited.add(activeVersion);
      const step = migrations.get(activeVersion);
      if (step === undefined) {
        return pipelineFailure(
          'schema.migration.missing_step',
          'Migration registry does not provide a complete path to the current version.',
          options.schemaId,
        );
      }
      activeVersion = step.toVersion;
    }
  }

  return Object.freeze({
    ok: true,
    pipeline: Object.freeze(new CompiledMigrationPipeline(options, migrations)),
  });
}
