export type SchemaDiagnosticSeverity = 'error';

export type SchemaKind = 'component' | 'shared' | 'workspace';

export type SchemaJsonValue =
  | boolean
  | number
  | string
  | null
  | readonly SchemaJsonValue[]
  | Readonly<{ [key: string]: SchemaJsonValue }>;

export type SchemaDiagnosticCode =
  | 'schema.catalog.duplicate_id'
  | 'schema.catalog.invalid_limits'
  | 'schema.catalog.invalid_schema'
  | 'schema.input.not_json'
  | 'schema.input.too_deep'
  | 'schema.input.too_large'
  | 'schema.input.too_many_items'
  | 'schema.migration.failed'
  | 'schema.migration.invalid_registry'
  | 'schema.migration.invalid_result'
  | 'schema.migration.missing_step'
  | 'schema.migration.unknown_version'
  | 'schema.normalization_failed'
  | 'schema.unknown_id'
  | 'schema.validation_failed';

export type SchemaDiagnosticParameter =
  | boolean
  | number
  | string
  | null
  | readonly SchemaDiagnosticParameter[]
  | Readonly<{ [key: string]: SchemaDiagnosticParameter }>;

export interface SchemaDiagnostic {
  readonly code: SchemaDiagnosticCode;
  readonly severity: SchemaDiagnosticSeverity;
  readonly schemaId?: string;
  readonly schemaKind?: SchemaKind;
  readonly schemaVersion?: string;
  readonly sourceVersion?: string;
  readonly targetVersion?: string;
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly message: string;
  readonly keyword?: string;
  readonly parameters: Readonly<Record<string, SchemaDiagnosticParameter>>;
}

export interface SchemaValidationLimits {
  readonly maxCollectionItems: number;
  readonly maxDepth: number;
  readonly maxDiagnostics: number;
  readonly maxInputBytes: number;
}

export interface SchemaDefinition extends Readonly<Record<string, unknown>> {
  readonly $id: string;
  readonly $schema: string;
}

export type SchemaValidationResult<Value = unknown> =
  | {
      readonly ok: true;
      readonly schemaId: string;
      readonly value: Value;
    }
  | {
      readonly ok: false;
      readonly diagnostics: readonly SchemaDiagnostic[];
    };

export interface SchemaCatalog {
  readonly schemaIds: readonly string[];
  normalize<Value = unknown>(schemaId: string, input: unknown): SchemaValidationResult<Value>;
  validate<Value = unknown>(schemaId: string, input: unknown): SchemaValidationResult<Value>;
}

export interface SchemaMigration {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly migrate: (input: SchemaJsonValue) => unknown;
}

export interface SchemaMigrationPipeline {
  readonly currentVersion: string;
  readonly schemaId: string;
  readonly supportedSourceVersions: readonly string[];
  migrate<Value = unknown>(input: unknown): SchemaValidationResult<Value>;
}

export interface SchemaMigrationPipelineOptions {
  readonly catalog: SchemaCatalog;
  readonly currentVersion: string;
  readonly migrations: readonly SchemaMigration[];
  readonly schemaId: string;
}

export type SchemaMigrationPipelineResult =
  | {
      readonly ok: true;
      readonly pipeline: SchemaMigrationPipeline;
    }
  | {
      readonly ok: false;
      readonly diagnostics: readonly SchemaDiagnostic[];
    };

export type SchemaCatalogResult =
  | {
      readonly ok: true;
      readonly catalog: SchemaCatalog;
    }
  | {
      readonly ok: false;
      readonly diagnostics: readonly SchemaDiagnostic[];
    };
