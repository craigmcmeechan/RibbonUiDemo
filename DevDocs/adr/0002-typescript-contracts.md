# ADR 0002: Shared strict TypeScript contracts

- Status: Accepted
- Date: 2026-08-05
- Scope: Phase 1, sub-step 1.2

## Context

The reusable UI library, workspace applications, future schema tooling, tests, and Storybook stories must use TypeScript. Public component and schema APIs need consistent compiler guarantees across package boundaries, while the browser-global legacy Editor must remain runnable during migration.

## Decision

All new TypeScript projects extend the repository-root `tsconfig.base.json`. The shared contract enables strict null and inference checks, exact optional properties, unchecked-index protection, type-only import discipline, unused and unreachable-code checks, unknown catch variables, safe overrides and returns, casing checks, JSON-module support, and JavaScript exclusion. Projects may specialize emit locations but must not weaken shared safety checks without a documented, project-local compatibility reason.

The root `tsconfig.json` is a solution file. Both applications reference `packages/ui`, and root scripts force-check the full graph. The UI project additionally enables isolated declarations and emits declaration maps after Vite builds its ESM output. Its build is forced so Vite cannot remove declarations while stale incremental metadata incorrectly reports them as current.

The legacy `legacy-editor-claude-design-template` directory is intentionally outside the TypeScript solution. This is a temporary migration boundary, not permission for new JavaScript. Future application, library, schema-tooling, test, and Storybook projects must join the shared solution or extend the shared contract through their owning tool configuration.

## Exceptions

`tsconfig.test.json` enables `skipLibCheck` for third-party Storybook/Vitest/Playwright declaration files. TypeScript 6 otherwise reports errors inside transitive declarations that the project does not own, including `ast-types` imports under `isolatedModules`; project-authored test, story, and tooling source remains fully checked. Remove this exception when the installed upstream declarations pass the shared contract. Library and application projects retain `skipLibCheck: false`.

Any future exception must identify its project, option, reason, removal condition, and owning sub-step in this ADR or a superseding decision record.
