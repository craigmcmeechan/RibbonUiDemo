# ADR 0004: Versioned component-schema governance

- Status: Accepted
- Date: 2026-08-05
- Scope: Phase 2, sub-step 2.2

## Context

Every library component requires a component-local JSON schema, TypeScript contracts, runtime validation, and comprehensive Storybook documentation. Those representations can drift unless one is authoritative and CI checks every derived surface. React props also contain functions, refs, and React nodes that cannot be represented as JSON configuration.

This ADR defines governance only. Runtime implementation begins in sub-step 2.3, and component scaffolding begins in Phase 3.

## Decisions

### Dialect and validator

- All project-authored schemas use JSON Schema Draft 2020-12 and declare `"$schema": "https://json-schema.org/draft/2020-12/schema"`.
- Runtime validation uses Ajv 8's dedicated Draft 2020-12 class. Exact dependency versions are selected and locked when sub-step 2.3 implements the validator.
- The shared Ajv instance compiles trusted, built-in schemas once. It runs with strict schema/type/tuple/required checks and all-error reporting.
- Validation never mutates input: type coercion, default assignment, and removal of additional properties are disabled. Invalid input is rejected, not silently repaired.
- Custom formats or keywords are unavailable unless separately registered, documented, and tested. Different JSON Schema drafts do not share the validator instance.

### Authoritative and derived contracts

The component-local JSON schema is authoritative for serialized component configuration. A component's React props are split conceptually into:

1. `ComponentConfig`: JSON-serializable values generated from the schema.
2. `ComponentRuntimeProps`: explicitly authored functions, refs, React nodes, and host bindings that cannot appear in schema-driven JSON.
3. `ComponentProps`: the public composition of the two without duplicate property names.

Generated TypeScript is checked in for review but never hand-edited. A deterministic generator must produce `Component.schema.types.ts` from `Component.schema.json`; `Component.types.ts` owns runtime-only props and the public composition. The exact generator is selected in sub-step 2.3 only after a fixture proves Draft 2020-12 references, required/optional properties, enums, unions, and deterministic output. Runtime constraints such as numeric ranges or string patterns remain enforced by Ajv even when TypeScript cannot express them.

CI regenerates into a checkable result and fails on a diff. A schema change and its generated type change are one atomic sub-step.

### Component layout and publication

Each component folder follows this shape, omitting a file only when it is genuinely inapplicable:

```text
Button/
  Button.tsx
  Button.css
  Button.schema.json
  Button.schema.types.ts
  Button.types.ts
  Button.schema.test.ts
  Button.test.tsx
  Button.stories.tsx
  index.ts
```

Names use PascalCase for component files/types and lower-kebab-case for serialized component identifiers. `index.ts` is the component's only public code entry point. Raw schemas are published through an explicit library schema catalog/export rather than unsupported package deep imports; the precise export mechanism is decided with the Phase 3 scaffold.

### Schema shape and composition

- Every root schema has a unique `$id`, `title`, `description`, object `type`, explicit `required`, and a closed object boundary.
- Root identifiers use `urn:ribbon-ui:schema:component:<component-id>:<semver>`, for example `urn:ribbon-ui:schema:component:button:1.0.0`.
- Each configurable property has a description. Optional properties declare a valid `default` when omission has defined semantics; `examples`, `deprecated`, and enum descriptions are added where useful.
- `default` is documentation/normalization metadata, not a validation side effect. A later normalizer may create a new resolved object from validated input; it must not mutate the source value.
- `enum`, `const`, required/optional status, and nullability originate in the schema. Null is allowed only when explicitly included in the schema type/enum.
- Component-private reuse stays in local `$defs`. Cross-component reuse references versioned, package-owned shared schemas that the registry preloads.
- `$ref` targets are local or present in the allowlisted schema catalog. Runtime network lookup, `compileAsync`, filesystem resolution, arbitrary URIs, circular component composition, and third-party schemas are prohibited.
- Closed simple objects use `additionalProperties: false`; composed roots use Draft 2020-12 `unevaluatedProperties: false` where necessary to close evaluated properties correctly.

### Storybook synchronization and documentation

Storybook's React docgen output remains the public React-prop view. Schema metadata supplies or verifies controls, defaults, descriptions, enums, examples, and serialized-config status. Runtime-only props require explicit Storybook descriptions and safe mock actions/providers.

Every component's Storybook documentation must cover:

- all config and runtime props, including which are JSON-serializable;
- states, variants, defaults, invalid/disabled/loading behavior, and theme/density behavior;
- usage guidance and non-goals;
- keyboard, focus, screen-reader, and other accessibility behavior;
- representative examples and interaction tests.

CI fails when schema properties are absent from generated config types or Storybook documentation, when defaults/enums/required status disagree, or when a public runtime prop is undocumented. Autodocs alone is not sufficient acceptance.

### Versioning and migrations

- Schema versions follow SemVer and published `$id` documents are immutable.
- Patch changes clarify annotations or correct behavior without changing accepted instances. Minor changes are backward-compatible additions, such as a new optional property. Removing/renaming a property, adding a required property, narrowing a constraint, changing a type, or adding an enum member that can break exhaustive TypeScript consumers is major.
- The workspace document carries the source `schemaVersion`. Component schema versions are resolved by the versioned workspace schema and registry; component nodes do not repeat a version in v1.
- The loader accepts the exact current version or an explicitly registered older v1 version. Pure, deterministic, sequential migrations transform a cloned document to the current version, after which the complete result is validated.
- All published v1 workspace versions remain migratable for the lifetime of v1. Unknown future versions, unregistered versions, and other majors fail without best-effort rendering. Cross-major retention/deprecation policy must be decided before v2 release.
- Any component-config compatibility change that affects serialized workspace documents also updates the workspace schema version and migration set in the same bounded sub-step.

### Failure and diagnostic contract

Validation returns a discriminated success/failure result; callers do not cast unknown data after a boolean check. Failures contain an ordered list of normalized diagnostics with:

- stable diagnostic code and severity;
- schema ID/version and component/workspace kind when known;
- JSON instance path and schema path;
- concise safe message and validator keyword parameters;
- migration source/target versions when applicable.

Diagnostics never include full configuration values, CRM records, secrets, credentials, or arbitrary exception stacks. Invalid configuration does not enter the renderer. The owning workspace boundary presents a safe fallback and may emit redacted development/observability details through the later diagnostics contract.

### Security boundaries

Schemas and migrations shipped by the library are trusted code-owned assets; workspace/configuration documents are untrusted data. Validation does not authorize commands, resolve component implementations, fetch references, evaluate expressions, import modules, or grant CRM capabilities. Those operations remain behind later allowlisted registries and workspace permission checks. Sub-step 2.3 must add bounded input-size, depth, collection, and diagnostic-count limits before accepting external documents.

## Required verification

Sub-steps that add or change a schema must prove:

1. The schema validates against the Draft 2020-12 meta-schema and compiles under strict Ajv settings.
2. Valid, boundary, and invalid fixtures cover required fields, unknown fields, types, enums, constraints, and every composition branch.
3. Validation and normalization do not mutate input; defaults are valid and deterministic.
4. Generated TypeScript is reproducible and the repository has no generation diff.
5. Schema, generated config type, authored runtime props, component barrel, and Storybook prop documentation pass the synchronization check.
6. Schema-to-rendering tests cover each supported configuration branch and safe failure behavior.
7. Migration tests cover every registered source version, deterministic output, source immutability, final validation, unknown/future rejection, and redacted diagnostics.
8. GitNexus change/impact analysis, relevant tests, staged-diff review, focused commit, and push satisfy `AGENTS.md`.

## Ownership

The component owner owns its schema, generated config type, runtime props, tests, story, and documentation as one contract. The schema/runtime owner owns the dialect, Ajv configuration, catalog, generator, migration registry, and diagnostic normalization. Reviewers reject partial contract changes even when an individual file compiles.

## Rejected alternatives

- **TypeScript-first schema generation:** rejected because TypeScript cannot carry all runtime constraints or make the required component-local JSON document the authority.
- **Hand-maintained duplicate TypeScript and JSON shapes:** rejected because review cannot reliably prevent drift.
- **Zod, TypeBox, or JTD as the primary contract:** rejected for v1 because the settled requirement is a component-local standard JSON Schema document. They may be reconsidered only through a superseding ADR.
- **Draft 7:** rejected because the project is new and Draft 2020-12 provides the current composition vocabulary, including `unevaluatedProperties` and updated array semantics.
- **Mutation during validation or permissive unknown fields:** rejected because coercion/removal/default insertion hides authoring errors and complicates diagnostics and migration.

## Deferred implementation choices

- Exact package versions and the JSON-Schema-to-TypeScript generator, subject to the fixture gate above.
- Normalizer API, validator bundling versus Ajv standalone output, and schema catalog export mechanics.
- Concrete configuration size/depth/collection limits, diagnostic localization, and supported custom formats.
- Cross-major migration retention and deprecation windows beyond v1.

## Primary references

- JSON Schema Draft 2020-12 specification and release notes: <https://json-schema.org/draft/2020-12> and <https://json-schema.org/draft/2020-12/release-notes>
- JSON Schema annotations (`default` does not fill missing values during validation): <https://json-schema.org/understanding-json-schema/reference/annotations>
- Ajv Draft 2020-12 support and dialect boundary: <https://ajv.js.org/json-schema.html#draft-2020-12-breaking>
- Ajv strict mode: <https://ajv.js.org/strict-mode.html>
- Ajv mutation options: <https://ajv.js.org/options.html#options-to-modify-validated-data>
- Ajv schema management and local `$id`/`$ref` behavior: <https://ajv.js.org/guide/managing-schemas.html> and <https://ajv.js.org/guide/combining-schemas.html>
- Storybook TypeScript and ArgTypes behavior: <https://storybook.js.org/docs/configure/integration/typescript> and <https://storybook.js.org/docs/api/arg-types>
- Semantic Versioning 2.0.0: <https://semver.org/>
