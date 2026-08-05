# ADR 0001: Workspace topology and publication boundaries

- Status: Accepted
- Date: 2026-08-05
- Scope: Phase 1, sub-step 1.1

## Context

RibbonUI needs deployable Editor and CRM applications plus a reusable React UI library. The legacy browser-global Editor remains the behavioral reference until its later migration. Optional workspace integrations must not become transitive library dependencies.

## Decision

Use one pnpm 11 workspace with these initial boundaries:

- `apps/editor-demo` is a private Vite React application and future Editor workspace host.
- `apps/crm-workspace` is a private Vite React application and future CRM workspace host.
- `packages/ui` is the publication-eligible, domain-neutral `@ribbon-ui/ui` library.

Applications may import the UI library. Applications may not import each other. The UI library may not import from `apps/*`, CRM or Editor domain code, or optional integrations. A future integration such as AG Grid must remain outside `packages/ui` and be consumed through a workspace-owned adapter or a separately approved integration package.

`@ribbon-ui/ui` exposes one public barrel at `src/index.ts`. Its production build emits ESM and TypeScript declarations to `dist/`; it does not emit CommonJS. React and React DOM use the peer range `^19.2.0` so consumers retain ownership of the React runtime. The workspace lockfile pins resolved dependency versions, and root build scripts order the library before its application consumers.

All application and library source introduced by this workspace is TypeScript or TSX. Shared strict TypeScript settings, linting, formatting, test harnesses, Storybook, CI, and publish automation are deliberately deferred to their named Phase 1 sub-steps.

## Consequences

- The dependency direction is library-to-consumer rather than application-to-library.
- Each application can be built and deployed independently after its shared library dependency builds.
- The UI package can later be published without application or optional-integration code.
- The new Editor application is only a placeholder; the legacy Editor continues to run separately and is not migrated by this decision.
