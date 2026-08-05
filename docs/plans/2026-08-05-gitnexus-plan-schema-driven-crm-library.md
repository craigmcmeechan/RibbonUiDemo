# GitNexus Engineering Plan

> Task: Evolve the legacy RibbonUI editor demo into a schema-driven TypeScript React UI library and an initial CRM workspace, with reusable foundations, comprehensive Storybook documentation, and gated incremental delivery.
> Evidence verified at commit `31440fdb26fe7d675f39f32c967c1b1fa7375831`; GitNexus index is four documentation-only commits behind at `f1fff06`, refresh skipped because the served index's analyzer provenance is unknown and the linked worktree has no local index.
> Evidence provenance schema 2; global dirty digest `sha256:0a9c85780067d9afcd0764f307b60891e3cee927ee11eaeb5ec7826d10fd82cd`; cited-path manifest 13 sorted entries; exact generated plan path excluded.

## 1. Objective

Create an implementation path that first establishes the missing reusable foundation and then incrementally migrates the current editor demo into a schema-driven library. The end state is a TypeScript React library that supplies an application shell, shared theme/token contract, atomic through template-level components, versioned JSON-schema configuration, command and workspace lifecycle boundaries, ordinary dialogs, and ribbon-capable child/modal workspaces. Workspace packages compose those primitives without making the library editor- or CRM-specific.

The first concrete product workspace is a classic-Outlook-inspired CRM shell: workspace-owned left pop-out/tabbed navigation with sections such as Contacts and Products, one focused main section at a time, and workspace-owned ribbon, panels, status content, commands, and views. Spreadsheet remains illustrative only. AG Grid React is optional and isolated behind a CRM-facing wrapper rather than a foundation dependency.

This plan is implementation-ready but does not settle product or vendor decisions for which evidence is absent. It makes those decisions explicit, places them before dependent work, and gives each bounded sub-step an acceptance, verification, GitNexus, commit-message, and push gate.

## 2. Current Behaviour

- [verified] `legacy-editor-claude-design-template/index.html:1-24` loads React 18.3.1, ReactDOM, Babel Standalone, one global stylesheet, and browser-global JSX files in a fixed order before mounting `App`; there is no module/build boundary.
- [verified] `App` in `legacy-editor-claude-design-template/app.jsx:4-236` owns roughly thirty React state values, theme persistence, shell visibility, ribbon tab state, panel state, document HTML, selection/formatting state, zoom, dialogs, and callback implementations.
- [verified] Editing commands in `app.jsx:33-141` use `document.execCommand`, `queryCommandState`/`queryCommandValue`, `Selection`, and `Range`. Ribbon mouse-down handling preserves document selection before commands run (`ribbon.jsx:6-63`).
- [verified] `Ribbon` selects hard-coded tab components and receives an untyped `ctx` callback/state bag; `HomeTab` builds groups and controls imperatively with `React.createElement` (`ribbon.jsx:6-63`, `ribbon-home.jsx:18-204`).
- [verified] `DocumentArea` renders `contentEditable` HTML with `dangerouslySetInnerHTML`; no model/view reconciliation or sanitization contract is present (`doc-status.jsx:4-23`).
- [verified] Left/right navigation, panel bodies, status content, Backstage, and dialogs are hard-coded component maps or conditional composition (`workspace.jsx:5-227`, `doc-status.jsx:54-172`, `app.jsx:143-239`).
- [verified] Reusable-looking controls in `primitives.jsx:5-209` are browser globals with implicit props. Dropdown dismissal covers outside mouse-down and Escape, but a complete roving-keyboard, focus-return, or menu semantics contract is not visible in source.
- [verified] `styles.css:1-174` defines three data-theme token sets (`modern-light`, `classic-light`, `modern-dark`). The remainder is page-global CSS with fixed shell/document measurements; no responsive media rules were found.
- [verified] `styles.css:349-381` gives the ribbon a fixed height and stretches group bodies, so visually common group height exists as incidental CSS, not as a public, theme/density-aware, tested component contract.
- [verified] The repository has no `package.json`, pnpm workspace, Vite/TypeScript configuration, lint/format configuration, Storybook, CI workflow, or automated tests at the pinned commit.

## 3. Relevant Architecture

### Current boundaries

- [verified] The browser document and ordered script list are the module loader and dependency injector (`index.html:1-24`). JSX files publish symbols through `window.*`.
- [verified] `App` is simultaneously composition root, UI state store, command dispatcher, editable-document controller, persistence adapter, and dialog/router controller (`app.jsx:4-239`).
- [verified] The data/control path is parent state and callbacks → an untyped `ctx` bag → ribbon/workspace controls → parent mutation → React rerender, with direct DOM mutation for editor commands.
- [verified] Component selection is embedded in arrays, maps, switches, and conditional branches; there is no component registry, renderer, workspace definition, command registry, schema validator, migration layer, or error/fallback boundary (`ribbon.jsx`, `workspace.jsx`, `app.jsx`).
- [verified] UI integration boundaries are the content-editable DOM, `localStorage`, `window` globals, and browser event listeners. There is no API/data layer or authorization boundary.

### Target boundaries required by settled direction

- [verified] Project direction requires React, Vite, pnpm, TypeScript, Atomic Design, per-component barrels and separated styles/types/tests/stories (`DevDocs/project-expectations.md:1-23`).
- [verified] Target direction separates a reusable shell/foundation from workspace-owned composition and requires a shared theme-provider/token contract across every new component and region (`DevDocs/target-architecture.md:1-81`).
- [inferred] A serializable schema cannot carry callback functions safely. Configuration should reference stable component and command IDs, while registries resolve those IDs to trusted React implementations and runtime command handlers.
- [inferred] State must be split into shell-owned state (theme, region visibility/density), workspace lifecycle/navigation state, and content/integration state. The workspace runtime owns registration and disposal; configuration remains declarative.
- [inferred] The schema boundary must be an allowlist. Unknown component/command IDs, unsupported versions, invalid props, and migration failures must become structured diagnostics and safe fallback UI, never arbitrary component/module execution.
- [inferred] AG Grid belongs in a separate optional integration package or CRM application adapter so the foundation package does not transitively install, license, theme, or expose AG Grid APIs.

### Proposed package/component convention

The default topology to validate in Step 1.1 is:

```text
apps/
  editor-demo/
  crm-workspace/
packages/
  ui/
    src/foundation/{theme,schema,commands,workspace,diagnostics}/
    src/components/{atoms,molecules,organisms,templates}/
  integrations/
    ag-grid/                 # conditional, optional package
```

Every individual UI component uses this folder contract:

```text
<AtomicLevel>/<ComponentName>/
  <ComponentName>.tsx
  <ComponentName>.types.ts
  <ComponentName>.module.css
  <ComponentName>.schema.json
  <ComponentName>.test.tsx
  <ComponentName>.stories.tsx
  index.ts
```

Additional focused files such as `<ComponentName>.a11y.test.tsx` or story MDX are permitted when they add a distinct concern. Component `index.ts`, atomic-level `index.ts`, and package-root `index.ts` are the only supported public-import path. Internal helpers stay unexported. The schema filename and `$id`/version naming convention are fixed by the schema ADR before the pilot component lands.

## 4. GitNexus Findings

- [graph] `list_repos` and `gitnexus://repo/RibbonUI Demo/context` report an index at application commit `f1fff06` with 11 files, 199 symbols, 293 edges, 8 communities, and 5 processes. The four later commits only alter documentation, but analyzer build provenance is unavailable, so graph findings are advisory and source-weighted.
- [graph] `gitnexus://repo/RibbonUI Demo/clusters` yields one 38-symbol, 91%-cohesion `Legacy-editor-claude-design-template` cluster. This supports the source finding that no foundation/workspace boundary exists.
- [graph] `gitnexus://repo/RibbonUI Demo/processes` lists five shallow UI flows: `OnClick → FocusDoc`, `OnClick → RefreshFmt`, `OnClick → RefreshCounts`, `OnApply`, and `Close`. The index does not model the broader callback/React composition path.
- [graph] `query(search='application shell ribbon workspace theme commands contentEditable primitives')` returned no definitions because the index lacks its FTS layer. Known candidates were therefore verified directly in source.
- [graph] `context(App)`, `context(Ribbon)`, `context(Dropdown)`, `context(DocumentArea)`, and `context(HomeTab)` found the primary symbols but resolved almost no React/createElement/global call relationships. Direct source inspection established their actual composition and callback roles.
- [graph] `impact(..., direction='upstream', maxDepth=3)` returned zero dependents for all five primary symbols. This conflicts with verified `App` composition and is not load-bearing. Source-visible direct consumers and migration slices are listed in §9.
- [graph] No related automated test symbols were found; source inventory confirms there is no current test harness.

## 5. Statement-Level PDG Findings

- [graph] `pdg_query(mode='controls', target='App')` returned no results with the explicit note that no PDG layer is indexed. A strict refresh was not run because analyzer provenance is unknown; no source-derived CDG/REACHING_DEF edges are fabricated.
- [verified] `app.jsx:25-31` applies theme state through `document.documentElement.dataset.theme` and persists it to `localStorage`; provider extraction must preserve initial selection and persistence while removing page-specific token ownership.
- [verified] `app.jsx:33-74` orders focus, browser command execution, format/count refresh, and selection restoration. Characterization tests must lock this sequence before moving editor commands behind a registry.
- [verified] `app.jsx:76-109` mutates a live `Range` for insertion, then collapses and restores selection. The editor adapter must own these side effects; shared schema/rendering packages must not depend on DOM selection APIs.
- [verified] `app.jsx:111-141` installs a global keydown handler and exposes a large context object. Lifecycle extraction must register/clean listeners once per workspace and avoid duplicate handlers in modal/child instances.
- [verified] `primitives.jsx:5-60` registers document-level dismissal listeners while open. The replacement must define focus entry, arrow/home/end navigation as applicable, Escape, outside interaction, focus return, and cleanup ordering.
- [verified] `doc-status.jsx:54-172` closes ordinary modals via overlay click and a button but exposes no complete dialog focus/ARIA contract. Ordinary dialog and ribbon-capable workspace-window behavior must be separate abstractions.

Planning implication: because statement dependencies are source-derived rather than PDG-backed, each implementation sub-step must re-run GitNexus analysis on the TypeScript code it creates and source-check any missing edges before its commit.

## 6. Proposed Changes

### Tooling and package foundation

| File | Symbol/responsibility | Intended change and constraints |
| --- | --- | --- |
| `package.json`, `pnpm-workspace.yaml` | workspace scripts/dependency policy | [inferred] Establish pnpm workspaces and one root command surface. Pin the package manager and lockfile; no application behavior change. |
| `tsconfig.base.json`, package/app tsconfigs | strict public API checking | [inferred] Enable strict TypeScript appropriate for exported component/schema contracts. Exact strictness exceptions require documented rationale. |
| shared ESLint/Prettier config | repository quality gates | [inferred] One shared configuration for library, apps, schemas tooling, tests, and Storybook. Exact rule sets/versions remain implementation-time decisions. |
| Vite, test, Storybook, and CI configuration | build/test/docs pipeline | [inferred] Provide reusable local/CI scripts; make Storybook build, accessibility checks, and selected visual tests first-class gates. |

### Shared foundation before atomisation

| File | Symbol/responsibility | Intended change and constraints |
| --- | --- | --- |
| `packages/ui/src/foundation/theme/*` | new theme token/provider contract | [inferred] Derive semantic tokens from the current three theme choices; expose one provider/context contract consumed by every component/region. No raw page-specific theme islands. |
| `packages/ui/src/foundation/schema/*` | new schema validation/version/migration boundary | [inferred] Select JSON Schema draft, validator, source-of-truth/codegen direction, diagnostics shape, composition rules, and version/migration policy before component schemas. |
| `packages/ui/src/foundation/commands/*` | new command registry/dispatcher | [inferred] Resolve serializable command IDs to trusted handlers; define availability, failure, cancellation, permission, and telemetry hooks without embedding functions in JSON. |
| `packages/ui/src/foundation/workspace/*` | new workspace definition/runtime/lifecycle contracts | [inferred] Separate declarative definitions from runtime services and activation/deactivation/disposal; define shell-, workspace-, and content-owned state. |
| `packages/ui/src/foundation/diagnostics/*` | new errors/observability interfaces | [inferred] Normalize schema, render, command, integration, and lifecycle failures; provide redaction-aware logging/telemetry adapters and safe UI fallbacks. |

### Packaged components and schema renderer

| File | Symbol/responsibility | Intended change and constraints |
| --- | --- | --- |
| `packages/ui/src/components/**/<ComponentName>/*` | new atomic-design component folders | [inferred] Apply the exact implementation/types/CSS/schema/tests/stories/barrel contract. All style values derive from shared semantic tokens unless explicitly documented as structural geometry. |
| component schema registry/composition files | new allowlisted registry | [inferred] Compose component-local schemas into workspace-region schemas; keep JSON Schema, TS props, Storybook args/docs, defaults, enums, and required fields in sync through generation or parity checks. |
| schema renderer | new trusted renderer | [inferred] Validate then resolve allowlisted component and command IDs; produce deterministic keys/order and structured fallback diagnostics for invalid/unknown configuration. |
| ribbon components | replacement boundary for verified `Ribbon`, `HomeTab`, and group/control patterns | [inferred] Render schema/workspace-defined tabs/groups/controls while preserving selection-sensitive command behavior behind the editor adapter. Groups share a fixed, tokenized height across control mixes, themes, and supported densities. |
| shell region components | reusable title/ribbon/left/right/status/content layout | [inferred] Provide composable slots/regions with responsive overflow and density behavior; workspaces own content and visibility configuration. |
| dialog/window components | ordinary dialog plus ribbon-capable child/modal workspace | [inferred] Implement distinct focus/lifecycle contracts. Decide portal-only, browser-window, or adapter/fallback transport before browser-window work; propagate theme tokens and dispose registrations correctly. |

### Workspace migration and integrations

| File | Symbol/responsibility | Intended change and constraints |
| --- | --- | --- |
| `apps/editor-demo/src/*` | migrate verified `App`, `DocumentArea`, editor commands | [inferred] Use the new shell/runtime through a strangler migration. Isolate deprecated editable DOM APIs in an editor-only adapter and retain behavior until characterized equivalence passes. |
| `apps/crm-workspace/src/*` | CRM workspace definition/runtime | [inferred] Define CRM-owned navigation, ribbon, panels, status, commands, and Contacts/Products example views with one active section. Do not place CRM models or data access in the library. |
| CRM data/capability adapters | API/security boundary | [inferred] Define DTO/query/capability contracts after backend decisions. Treat UI permissions as presentation only; server-side authorization remains authoritative. |
| `packages/integrations/ag-grid/*` | optional AG Grid wrapper | [inferred] Add only if edition/licensing/data-volume decision passes. Own dependency, module registration, themes/tokens, row-model mapping, accessibility configuration, and API isolation; no AG Grid types leak from foundation public APIs. |

### Storybook definition of documented

Every new component and composed region is incomplete until its Storybook entry documents, not merely displays:

- public props and schema fields, defaults, required values, enums, and version;
- normal, empty, loading, disabled, read-only, error, overflow, compact/density, light/dark, and high-contrast-relevant states as applicable;
- usage guidance, non-goals, composition examples, and command/schema examples;
- keyboard/focus sequence, semantic roles/names/states, expected screen-reader behavior, reduced-motion behavior, and known limitations;
- interaction tests for critical behavior and automated accessibility checks configured to fail CI for newly introduced violations;
- stable visual-regression stories for geometry/theme/overflow states, including mixed-control ribbon groups at identical height.

## 7. Implementation Sequence

### Universal sub-step gate

For every sub-step below:

1. Set exactly one active item in root `TODO.md`; record scope, acceptance checks, and the exact intended conventional commit message.
2. Make only that bounded change and update its tests/docs.
3. Run all relevant repository scripts created by Step 1 plus `git diff --check`; review failures, warnings, snapshots, accessibility results, and build output.
4. Refresh/analyze the current code with the configured GitNexus runner; run `detect_changes`/equivalent change analysis, depth-3 upstream impact on edited exported symbols, and a staged/local GitNexus review. Source-check missing or stale graph relationships.
5. Stage only the sub-step scope. Confirm the diff matches the recorded message. Mark the sub-step complete and the next sub-step active in `TODO.md` before committing.
6. Create one focused conventional, human-readable commit whose message names the completed sub-step's concrete outcome; never use `WIP`, `updates`, or a message broader/narrower than the staged diff. Push the named branch. Stop if tests, analysis/review, commit, or push fails.

### Phase 1 — TypeScript workspace and quality foundation

#### 1.1 Decide topology and bootstrap pnpm/Vite workspaces

- Scope: record the package-topology ADR; create root pnpm workspace, Vite React TypeScript app/package skeletons, pinned package-manager metadata, and lockfile without migrating legacy behavior.
- Acceptance: `apps/editor-demo`, `apps/crm-workspace`, `packages/ui` build as empty typed boundaries; browser demo remains runnable separately; dependency direction forbids `packages/ui` importing apps/integrations.
- Verify: install/build smoke tests plus current legacy manual smoke; GitNexus confirms new module boundaries.
- Commit: `chore(tooling): bootstrap TypeScript workspace boundaries`

#### 1.2 Enforce shared strict TypeScript contracts

- Scope: shared base tsconfig, package references/declaration output, strict public API settings, no JavaScript in future library/apps/schema tooling/tests/stories.
- Acceptance: typecheck covers all new workspaces; public declarations build; any compatibility allowance is localized and documented.
- Commit: `chore(types): enforce strict shared TypeScript checks`

#### 1.3 Add shared ESLint and Prettier gates

- Scope: shared lint/format configuration, editor ignores, root scripts, CI checks.
- Acceptance: source, tests, stories, and tooling are covered; generated JSON is deterministically formatted; no broad rule disablement.
- Commit: `chore(quality): add shared lint and formatting gates`

#### 1.4 Establish test, Storybook, E2E, and CI harnesses

- Scope: choose/document supported versions and install unit/component tooling, React test utilities, Storybook for Vite, accessibility addon/test integration, browser E2E, coverage, and a visual-regression provider or local baseline strategy.
- Acceptance: one sample component runs through unit, story interaction/a11y, Storybook build, E2E smoke, and CI matrix; root scripts are the canonical runnable gates.
- Commit: `test(tooling): establish UI verification harnesses`

### Phase 2 — Reusable foundation contracts (before atomisation)

#### 2.1 Freeze legacy characterization and migration criteria

- Scope: record screenshots/interaction scenarios for theme switching, ribbon tabs/selection preservation, panels, content editing, zoom, status counts, Backstage, and dialogs; create a migration parity checklist without changing behavior.
- Acceptance: fixtures are deterministic and scrubbed; deprecated browser behavior and unsupported browser cases are documented.
- Commit: `test(editor): capture legacy migration baselines`

#### 2.2 Decide schema governance and synchronization

- Scope: ADR chooses JSON Schema draft, runtime validator, schema ID/version format, schema-first vs TypeScript-first generation, default/enum/required synchronization, migration ownership, and diagnostic format.
- Acceptance: a spike proves component-local schema ↔ TypeScript props ↔ Storybook metadata parity and rejects a deliberate drift; unsupported/invalid versions have defined outcomes.
- Commit: `docs(schema): define versioned component contract governance`

#### 2.3 Implement validation, diagnostics, and schema composition core

- Scope: typed validation result, schema registry/composition, version negotiation, migration pipeline, stable error codes/paths, redaction-safe diagnostics.
- Acceptance: valid current schema passes; unknown version/component, malformed props, migration failure, and unsupported future version produce deterministic non-throwing boundary results where recoverable.
- Commit: `feat(schema): add versioned validation and diagnostics core`

#### 2.4 Implement shared theme token/provider foundation

- Scope: semantic token types and provider/context derived from modern light, classic light, and modern dark choices; persistence adapter stays outside pure tokens.
- Acceptance: nested library regions consume one contract; missing provider behavior is explicit; token parity, contrast-sensitive states, theme switching, and no-isolated-style lint/test policy pass.
- Commit: `feat(theme): establish shared semantic theme contract`

#### 2.5 Define command, state, and workspace lifecycle contracts

- Scope: stable IDs; command context/result/error/availability; workspace definition/runtime; shell/workspace/content state ownership; activate/deactivate/dispose; capability checks; observability hooks.
- Acceptance: JSON remains function-free; duplicate IDs fail deterministically; async failure/cancellation and disposal are tested; no CRM/editor types enter foundation contracts.
- Commit: `feat(runtime): define command and workspace lifecycle boundaries`

### Phase 3 — Component packaging system and atoms

#### 3.1 Add component scaffold and barrel/schema policy checks

- Scope: generator/template and CI verifier for the exact component folder convention, local/public barrels, CSS modules, schema, tests, and stories.
- Acceptance: missing files, deep imports, schema/prop/story drift, or unthemed visual tokens fail a targeted check; generated output is deterministic.
- Commit: `chore(components): enforce component package conventions`

#### 3.2 Deliver one pilot interactive atom end-to-end

- Scope: choose the smallest legacy-derived button atom; implement typed props, tokens, CSS module, local schema, runtime registration, tests, comprehensive story, and barrel exports.
- Acceptance: schema JSON renders the atom; invalid config fails safely; keyboard activation/focus/disabled semantics and all documented variants pass.
- Commit: `feat(atoms): deliver schema-backed button contract`

#### 3.3 Build remaining foundational display/input atoms

- Scope: bounded one-component-per-commit extraction for icon/label/separator/toggle/input/select/color and other verified primitives, preserving the packaging gate.
- Acceptance: each component independently meets Storybook, schema-rendering, a11y, theme, density, and barrel criteria. TODO must list each as a separate sub-step/commit, not one bulk extraction.
- Commit pattern: `feat(atoms): add schema-backed <component> behavior`

#### 3.4 Build accessible popup/dropdown primitives

- Scope: replace verified `Dropdown` behavior with explicit trigger/menu/listbox ownership as appropriate; choose semantics per use case rather than one overloaded control.
- Acceptance: arrow/Home/End/Enter/Space/Escape/Tab behavior, outside interaction, focus return, portal positioning, resize/scroll, cleanup, disabled items, and assistive labels pass in unit/story/E2E tests.
- Commit: `feat(atoms): add accessible popup interaction primitives`

### Phase 4 — Schema-driven ribbon and layout regions

#### 4.1 Implement ribbon tab/group/control composition

- Scope: typed ribbon definitions, local schemas, registries, and renderer for tabs/groups/controls; preserve command IDs and editor selection requirements through adapters.
- Acceptance: valid mixed-control schemas render deterministically; unknown controls/commands show diagnostics; workspace configuration owns ribbon content.
- Commit: `feat(ribbon): render registered schema-defined controls`

#### 4.2 Enforce fixed common ribbon-group height

- Scope: tokenized ribbon/group geometry across button, split button, dropdown, combo, toggle, and color controls.
- Acceptance: all groups have identical outer/body height at every supported theme, density, and tested viewport; menus do not resize the group; overflow is intentional and visually regressed.
- Commit: `fix(ribbon): enforce consistent group height across controls`

#### 4.3 Complete ribbon keyboard, focus, overflow, and density behavior

- Scope: tab semantics, focus entry/exit, arrow traversal, disabled/skipped items, collapsed/overflow presentation, reduced motion, and responsive behavior.
- Acceptance: documented keyboard model passes without mouse; focus survives schema rerender/theme/density change; supported narrow/wide layouts do not obscure commands without an accessible overflow path.
- Commit: `feat(ribbon): add accessible responsive navigation behavior`

#### 4.4 Re-express the editor ribbon as a workspace definition

- Scope: represent existing editor tabs/groups/commands through the registry/schema without switching the production demo yet.
- Acceptance: side-by-side story/fixture parity for visible labels, ordering, command availability, selection preservation, and fixed group height.
- Commit: `refactor(editor): define ribbon through workspace configuration`

### Phase 5 — Application shell, regions, dialogs, and child workspaces

#### 5.1 Implement reusable application shell regions

- Scope: theme-wrapped title/ribbon/left panel/content/right panel/status slots with typed state ownership and CSS modules.
- Acceptance: optional regions collapse predictably; landmarks/names and focus order are correct; workspaces supply content without library domain assumptions.
- Commit: `feat(shell): compose reusable themed layout regions`

#### 5.2 Implement left navigation/panel primitives

- Scope: pop-out/tabbed navigation primitives needed by CRM while remaining domain-neutral.
- Acceptance: one active section, collapse/pop-out, keyboard selection, focus restoration, narrow layout, and workspace-owned entries are tested and documented.
- Commit: `feat(navigation): add workspace-owned popout section rail`

#### 5.3 Implement ordinary dialog foundation

- Scope: labelled modal/non-modal variants as approved, focus trap/initial focus/return, Escape, backdrop policy, scroll lock, nested-dialog rule, and error boundary.
- Acceptance: behavior follows selected accessibility pattern and has Storybook interaction/a11y/E2E coverage.
- Commit: `feat(dialog): add accessible ordinary dialog contract`

#### 5.4 Decide and implement ribbon-capable workspace-window host

- Scope: ADR compares in-document portal/modal, `window.open`, or adapter with fallback against browser/CSP/opener/theme/lifecycle needs; implement approved host with the same shell/theme/runtime contracts.
- Acceptance: independent ribbon/regions/content render, commands are isolated, theme synchronizes, close/dispose cleans listeners/registries, opener loss/failure has safe fallback, and focus returns to opener.
- Commit: `feat(workspace): add ribbon-capable child workspace host`

### Phase 6 — Workspace schema loading and safe rendering

#### 6.1 Implement allowlisted component and command registries

- Scope: explicit registration, duplicate/collision rules, lazy-loading boundary if approved, and public/private export policy.
- Acceptance: schemas cannot import arbitrary code; unregistered IDs fail with safe diagnostics; registry lifecycle is isolated per application/child workspace.
- Commit: `feat(runtime): add allowlisted UI and command registries`

#### 6.2 Implement versioned workspace loader and migrations

- Scope: validate top-level workspace/region schemas, migrate supported historical versions, preserve source diagnostics, and prevent partial unsafe activation.
- Acceptance: current, oldest-supported, invalid, unknown-future, and failed-migration fixtures cover success/fallback; migrations are pure, ordered, idempotence-tested where applicable, and independently versioned.
- Commit: `feat(schema): load and migrate workspace definitions safely`

#### 6.3 Implement deterministic schema-to-React renderer

- Scope: region/component resolution, stable keys, slot/child composition, command binding, error boundaries, and diagnostic rendering.
- Acceptance: same definition produces stable output; malformed child config cannot crash the shell; schema-to-rendering tests cover every registered component category.
- Commit: `feat(renderer): compose validated workspace schemas`

#### 6.4 Add runtime observability and failure UX

- Scope: error boundaries, structured validation/command/integration events, correlation without sensitive CRM payloads, developer diagnostics, and user-safe fallbacks.
- Acceptance: errors are actionable in development, redacted in production, deduplicated, and observable without coupling the library to a vendor.
- Commit: `feat(diagnostics): expose redacted workspace failure signals`

### Phase 7 — Safe editor migration

#### 7.1 Move editor state and commands behind workspace adapters

- Scope: decompose verified `App` into shell/runtime/editor-content ownership; wrap `execCommand`, selection/range, counts, and formatting in editor-only TypeScript adapters.
- Acceptance: characterization suite preserves command order, selection, counts, theme persistence, panels, status, and shortcuts; shared library has no contentEditable/execCommand dependency.
- Commit: `refactor(editor): isolate document state and command adapters`

#### 7.2 Migrate editor shell regions incrementally

- Scope: one region per bounded TODO sub-step—theme/title, ribbon, left panel, content, right panel, status, Backstage/dialogs—using the new shell while retaining rollback to legacy composition.
- Acceptance: each region passes baseline, visual, keyboard, and integration checks before the next region; each region gets its own concrete commit message.
- Commit pattern: `refactor(editor): migrate <region> to shared shell`

#### 7.3 Cut over the editor workspace and retire browser globals

- Scope: switch bootstrap to Vite/TypeScript workspace definition after full parity; remove obsolete script ordering/globals only when no consumers remain.
- Acceptance: production-equivalent smoke/E2E/visual matrix passes; no legacy global is referenced; rollback tag/commit and behavior deviations are documented.
- Commit: `refactor(editor): complete schema-driven workspace cutover`

### Phase 8 — Initial CRM workspace

#### 8.1 Define CRM API, capability, and security boundaries

- Scope: ADR/interface layer for data source, query/paging/sort/filter, errors, loading, capabilities, authentication context, and authorization display hints without inventing CRM entities beyond section examples.
- Acceptance: UI never treats hidden/disabled controls as authorization enforcement; server/API is authoritative; sensitive values are excluded from schema, logs, stories, fixtures, and telemetry.
- Commit: `docs(crm): define data and permission boundaries`

#### 8.2 Compose the CRM shell and navigation definition

- Scope: workspace definition for left pop-out/tabbed navigation, example Contacts and Products entries, single focused main section, ribbon/panels/status slots.
- Acceptance: entries and regions are CRM-owned configuration; library imports no CRM symbols; deep-link/restore behavior is either specified and tested or explicitly deferred.
- Commit: `feat(crm): compose Outlook-inspired workspace shell`

#### 8.3 Add section views and workspace-owned commands

- Scope: bounded Contacts and Products example views, section-specific commands/ribbon/panels/status, empty/loading/error/permission states, using safe mock/adapted data.
- Acceptance: switching disposes prior section effects, one main section remains active, commands target the active section, and no unstated CRM data model is embedded in library contracts.
- Commit pattern: `feat(crm): add <section> workspace experience`

#### 8.4 Validate CRM lifecycle, errors, and responsive behavior

- Scope: activate/deactivate/restore, command failure, data failure, unauthorized capability, narrow viewport, density, child workspace launch/close, and observability E2E flows.
- Acceptance: no stale commands/listeners/data leak between sections or child workspaces; error/focus recovery is deterministic.
- Commit: `test(crm): verify workspace lifecycle and recovery`

### Phase 9 — Optional AG Grid integration (decision-gated)

#### 9.1 Decide edition, license, row model, and data-volume strategy

- Scope: evaluate Community vs Enterprise, required features, legal approval, bundle impact, row count/latency/API, accessibility needs, pagination/virtualization, and supported browsers/screen readers.
- Acceptance: ADR records go/no-go, edition, license ownership, version-alignment policy, row model, performance budget, and accessibility exceptions. No license key is committed.
- Commit: `docs(grid): decide optional CRM grid strategy`

#### 9.2 Build the optional wrapper only on go

- Scope: isolated integration package owns AG Grid imports/modules/config/types, token mapping, data-source adapter, column/cell allowlist, and event translation to library commands.
- Acceptance: foundation and non-grid workspaces install/build without AG Grid; no AG Grid type crosses the wrapper public boundary; Enterprise key, if any, comes from runtime environment/credential management.
- Commit: `feat(grid): encapsulate optional AG Grid integration`

#### 9.3 Prove accessibility and large-data behavior

- Scope: keyboard/screen-reader checks, DOM-order/virtualization/pagination tradeoffs, loading/error/retry, stable row IDs, selection restore, client/infinite/server-side representative data, and performance profiling for the approved row model.
- Acceptance: budgets and assistive-technology behavior meet the ADR or deviations are approved; the wrapper exposes a non-grid fallback path for critical data access where required.
- Commit: `test(grid): verify accessible large-data behavior`

### Phase 10 — Hardening, release, and ownership

#### 10.1 Run full accessibility and cross-browser qualification

- Scope: automated axe plus manual keyboard, focus, zoom/reflow, screen-reader, reduced-motion, forced-colors/high-contrast checks across the agreed browser/AT matrix.
- Acceptance: no critical/serious unwaived violations; waivers have owner/expiry; ribbon, navigation, dialogs, child workspace, CRM section, and optional grid flows pass.
- Commit: `test(a11y): qualify workspace interaction patterns`

#### 10.2 Lock responsive, density, theme, and visual regression contracts

- Scope: approved viewport/density/theme matrix, container/overflow rules, fixed ribbon height, token snapshot/governance, baseline ownership.
- Acceptance: stable cross-browser visual baselines; theme contrast and no-isolated-style checks; changes require intentional review, not blind snapshot update.
- Commit: `test(visual): lock shell and component appearance contracts`

#### 10.3 Qualify performance, reliability, and security

- Scope: startup/bundle/render/interaction budgets, schema-validation cost, large config, command bursts, memory/listener cleanup, malformed schema, permission changes, injection/XSS boundaries, dependency audit, and telemetry redaction.
- Acceptance: agreed budgets pass; sanitized rendering/data contracts are documented; threat review confirms server authorization and no secret/PII leakage.
- Commit: `test(platform): qualify performance and security boundaries`

#### 10.4 Finalize package/release and documentation governance

- Scope: public exports, declaration/schema artifacts, semantic/version policy, changeset/release mechanism, dependency update policy, peer-dependency policy, Storybook deployment, changelog/migration docs, CODEOWNERS/ownership and review checklist.
- Acceptance: clean consumer project installs library without app/AG Grid internals; release candidate builds reproducibly; docs identify owners and support/deprecation policy.
- Commit: `chore(release): establish library publication governance`

## 8. Test Strategy

### Current verification reality

- [verified] No repository test/build/lint scripts exist at the pinned commit. The only currently runnable checks are `git diff --check`, Git status/diff inspection, browser manual smoke of the legacy HTML, and the installed GitNexus CLI/MCP surface.
- [inferred] Step 1 must create and prove the following root script contract before later steps may cite it: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:storybook`, `pnpm test:e2e`, `pnpm test:visual` (or the selected equivalent), `pnpm build`, and `pnpm storybook:build`. Exact underlying packages/versions are Step 1 decisions.

### Required layers

- Unit: tokens/provider, validator, migrations, registries, command state/results, lifecycle cleanup, component props/events, adapters, and diagnostics redaction.
- Component integration: schema JSON → validation → registry → React render → command dispatch; theme/density/disabled/error changes; focus and portal behavior.
- Storybook interaction/accessibility: every component/region story covers documented states and interaction assertions; automated accessibility findings fail CI at the agreed severity.
- Visual regression: theme × density × viewport matrix for foundational components and shell regions; mixed-control ribbon groups; modal/child workspace; CRM navigation and focused section; optional grid.
- E2E: editor parity, CRM section switching/commands/data errors/permissions, schema failures/migrations, dialog and child workspace focus/lifecycle, persistence, responsive overflow.
- Performance: bundle budgets per package/app, initial shell render, large schema validation/render, ribbon interaction, workspace switching, cleanup/leak tests, and approved grid row model/volume.
- Cross-browser/AT: explicit evergreen browser matrix and representative screen readers; exact support is an open decision before Phase 5.
- Security: malicious/unknown schema IDs, unsafe markup/URLs, command capability escalation, stale permissions, sensitive diagnostic payloads, dependency/license checks. UI permission tests complement but never replace API authorization tests.

### Scenario minimums

- Component schema: valid required props → render expected UI; omitted optional prop → documented default; invalid enum/type/unknown field → structured path/error; older version → one ordered migration; future version → safe unsupported response; registry collision → startup failure.
- Theme: each built-in theme → identical semantic contract; runtime switch → all open regions/portals update; missing/invalid token → deterministic failure/fallback; raw isolated color introduced → policy gate fails.
- Commands: enabled command → one invocation/result; disabled/unauthorized → no handler; rejected async handler → redacted diagnostic and recoverable UI; disposed workspace → no invocation.
- Ribbon: mixed controls/dropdown open/close → outer group height unchanged; keyboard traversal → expected focus order; narrow viewport → accessible overflow; editor command → selection retained.
- Workspace lifecycle: activate A → registrations scoped; switch to B → A disposed; open child → isolated runtime/shared theme; child close/opener loss → cleanup/focus/fallback.
- CRM: section select → one main view; data loading/error/empty/permission state → documented rendering; command availability → active section/capabilities only; sensitive fixture sentinel → absent from logs/snapshots.
- AG Grid conditional: wrapper absent → foundation/app build; Community/Enterprise mismatch → policy failure; large dataset → approved data requests/budgets; keyboard/screen reader → documented behavior/fallback.

## 9. Risk and Impact Analysis

### Direct dependents and migration impact

- [graph] Depth-1 upstream impact reported zero for `App`, `Ribbon`, `Dropdown`, `DocumentArea`, and `HomeTab`; this graph result is incomplete for browser-global/createElement composition.
- [verified] `App` directly composes `Ribbon`, left/right workspace panels, `DocumentArea`, status, Backstage, and dialogs; changing its state/context affects nearly the entire demo (`app.jsx:143-239`).
- [verified] `Ribbon` directly selects tab implementations and preserves selection on mouse-down; its migration affects every ribbon tab and editor command (`ribbon.jsx:6-63`).
- [verified] `Dropdown` is used as a reusable interaction primitive; changing dismissal/focus semantics affects ribbon controls and menus (`primitives.jsx:22-60`, `ribbon-home.jsx:18-204`).
- [verified] `DocumentArea` is the editable DOM boundary. Changes can alter HTML initialization, selection, formatting, counts, zoom, and focus (`doc-status.jsx:4-23`, `app.jsx:33-141`).
- [verified] `HomeTab` binds many controls to `ctx.exec`/`ctx.insert`; migration must preserve command IDs/selection timing and placeholder behavior (`ribbon-home.jsx:18-204`).

### Deliberate blind-spot review

| Concern | Plan response | Deferred decision/risk |
| --- | --- | --- |
| Accessibility, keyboard, focus | Explicit interaction contracts, automated axe, manual keyboard/screen-reader, focus restore/trap/lifecycle gates in Phases 3–10. | Exact browser/AT matrix and ribbon keyboard model require approval. Automated checks are insufficient alone. |
| Responsive and density | Theme/density tokens, narrow/wide overflow, zoom/reflow, fixed group-height matrices. | Supported breakpoints/density modes and resize behavior are not yet settled. |
| Schema versioning/validation/migrations/failure | ADR before components; allowlisted validator/registry; pure migrations; safe diagnostics/fallback; parity CI. | JSON Schema draft, validator, source of truth, oldest supported version, and additional-property policy are open. |
| API/data boundaries | CRM adapter contracts isolate DTO/query/errors/capabilities; AG Grid API remains wrapped. | Backend protocol, caching, offline expectations, conflict semantics, and generated-client strategy are open. |
| State/command/workspace lifecycle | Explicit shell/workspace/content ownership; serializable IDs; activation/disposal/cancellation tests. | State library/persistence/deep-link policy and cross-window transport are open. |
| Theme/token governance | One React provider/token contract, semantic token policy, all components/regions covered, theme matrices and ownership. | Public token stability, custom-theme support, contrast target, and density set are open. |
| Storybook/testing/visual regression | Comprehensive docs definition plus interaction/a11y/visual gates for every component. | Hosted visual service versus self-managed baselines, baseline approval/retention, and docs deployment are open. |
| Unit/integration/E2E/performance/cross-browser | Layered suite and budgets in §8/Phase 10. | Exact tools/versions, coverage thresholds, budgets, and browser matrix are Step 1/10 decisions. |
| AG Grid | Optional isolated wrapper, go/no-go ADR, edition/license/version/row-model/a11y/large-data gates. | Official docs note Enterprise is separately licensed, SSRM is Enterprise, and virtualization/screen-reader tradeoffs exist. Decide with legal/product/data evidence. |
| CRM security/permissions | Server-authoritative authorization, capability presentation, schema allowlist, redacted fixtures/logs, threat tests. | Auth provider, tenant model, row/field/action permissions, and data classification are intentionally not invented. |
| Observability/error handling | Vendor-neutral structured diagnostics, error boundaries, correlation/redaction, command/integration failure UX. | Telemetry backend, retention, consent, and operational SLOs are open. |
| Dependency/version governance | pnpm lockfile, pinned package manager, dependency boundaries, audit/update/release policy. | Exact versions, update automation, support window, and package publication target are open. |
| Build/package/release | Vite/TS declarations/schemas, public barrels, clean-consumer tests, semantic release policy. | Monorepo topology, bundling formats, registry, changeset tool, React peer range, and side-effects policy are open. |
| Documentation ownership | Storybook completion gate, migration/reference docs, owner/review checklist. | Named owners, hosting, support/deprecation SLA are open. |
| Safe migration | Characterization first, foundation before extraction, region-by-region strangler, editor-only DOM adapter, delayed global removal. | Exact parity tolerances and deprecation/removal date require owner approval. |

External primary evidence used for these decision gates:

- AG Grid installation and edition/module concerns: https://www.ag-grid.com/react-data-grid/installation/
- AG Grid accessibility/virtualization limitations: https://www.ag-grid.com/react-data-grid/accessibility/
- AG Grid row-model selection: https://www.ag-grid.com/javascript-data-grid/row-models/
- Storybook visual testing: https://storybook.js.org/docs/8/writing-tests/visual-testing
- Storybook accessibility testing: https://storybook.js.org/docs/9/writing-tests/accessibility-testing

### Highest risks

1. Editor behavior depends on deprecated browser editing APIs and selection timing; characterize before extraction and keep the adapter editor-only.
2. Schema/TypeScript/Storybook/runtime contracts can drift; choose one source of truth and fail CI on parity before the first real atom.
3. A browser child window cannot inherit React context and may be blocked or lose its opener; decide transport/fallback and test lifecycle/CSP behavior.
4. Schema-driven rendering can become a code-execution or authorization bypass if IDs are not allowlisted and commands do not recheck capabilities.
5. Fixed dimensions and global CSS hide responsive/theme coupling; token and visual matrices must precede legacy CSS removal.
6. Optional AG Grid features may introduce licensing, bundle, accessibility, and backend constraints; do not add it until the decision gate passes.
7. The stale/under-modeled GitNexus graph can miss browser-global relationships; every sub-step combines graph analysis with targeted source verification.

## 10. Files Expected to Change

These are planned paths; the executor must revalidate topology before creating them.

| File | Symbols | Reason |
| --- | --- | --- |
| `package.json`, `pnpm-workspace.yaml`, lockfile | root scripts/workspaces | pnpm/Vite/TypeScript workspace foundation |
| shared TS/ESLint/Prettier/Vite/test/Storybook/CI configs | quality/build contracts | repeatable local and CI verification |
| `packages/ui/src/foundation/theme/**` | theme provider/tokens | coherent shared themes |
| `packages/ui/src/foundation/schema/**` | validator/registry/migrations | versioned safe schema boundary |
| `packages/ui/src/foundation/commands/**` | command registry | ID-to-handler boundary and capability checks |
| `packages/ui/src/foundation/workspace/**` | definitions/runtime/lifecycle | state ownership and workspace composition |
| `packages/ui/src/foundation/diagnostics/**` | errors/telemetry adapters | failure handling and observability |
| `packages/ui/src/components/{atoms,molecules,organisms,templates}/**` | component-local implementations/types/styles/schemas/tests/stories/barrels | independently packaged atomic design library |
| `apps/editor-demo/src/**` | migrated `App`, `Ribbon`, `Dropdown`, `DocumentArea`, `HomeTab` responsibilities | safe strangler migration from verified legacy symbols |
| `apps/crm-workspace/src/**` | CRM definition, sections, commands, adapters | first concrete workspace |
| `packages/integrations/ag-grid/**` | optional wrapper | isolate grid dependency/licensing/API |
| `TODO.md` | active sub-step/status/commit message | enforce delivery workflow |
| ADRs, Storybook docs, migration/release docs | decisions/ownership | durable governance and consumer guidance |

## 11. Reusable Implementation Context

```yaml
implementation_context:
  task_summary: >-
    Build a schema-driven TypeScript React UI library and first CRM workspace by
    establishing tooling and reusable foundation contracts before atomising or
    migrating the current editor demo.
  acceptance_criteria:
    - Shared shell, regions, theme provider/tokens, schema/registry/renderer, commands, lifecycle, dialogs, and ribbon-capable child workspace are reusable and domain-neutral.
    - CRM owns its navigation, ribbon, panels, status, commands, and section views; only one main section is active.
    - Every component has its own implementation/types/CSS/schema/tests/stories/barrel folder and comprehensive Storybook documentation.
    - Schema, TypeScript props, Storybook metadata, runtime validation, composition, and versions remain synchronized by generation or CI parity checks.
    - Ribbon groups retain one common fixed height across mixed controls, themes, densities, and tested viewports.
    - AG Grid is optional behind a wrapper and absent from foundation dependencies.
    - Every bounded sub-step passes relevant tests and GitNexus analysis/review, then one exact-scope conventional commit and push recorded in TODO.md.

  evidence_provenance:
    schema_version: 2
    head_commit: '31440fdb26fe7d675f39f32c967c1b1fa7375831'
    generated_plan_path: 'docs/plans/2026-08-05-gitnexus-plan-schema-driven-crm-library.md'
    global_dirty_digest:
      algorithm: 'sha256'
      canonicalization: 'gitnexus-evidence-provenance-v2 NUL-framed UTF-8 records'
      value: '0a9c85780067d9afcd0764f307b60891e3cee927ee11eaeb5ec7826d10fd82cd'
    cited_path_manifest:
      - path: 'AGENTS.md'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:bbe9753d8d6432ec01ed3af8f91ae9d30c99f1f07e297b6f0c8c0108a5bce706'
        index_digest: 'sha256:bbe9753d8d6432ec01ed3af8f91ae9d30c99f1f07e297b6f0c8c0108a5bce706'
        worktree_digest: 'sha256:bbe9753d8d6432ec01ed3af8f91ae9d30c99f1f07e297b6f0c8c0108a5bce706'
        untracked_digest: absent
      - path: 'DevDocs/current-architecture.md'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:08f1d3b6d8dfe3274527c1e7e8c2a7d36daa72f15e762a7e866c5c4f19e885ef'
        index_digest: 'sha256:08f1d3b6d8dfe3274527c1e7e8c2a7d36daa72f15e762a7e866c5c4f19e885ef'
        worktree_digest: 'sha256:08f1d3b6d8dfe3274527c1e7e8c2a7d36daa72f15e762a7e866c5c4f19e885ef'
        untracked_digest: absent
      - path: 'DevDocs/project-expectations.md'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:9876f1bd3f037516922c063e5e5633ab10dd557c0d814c5f2c5b93a924a8ced4'
        index_digest: 'sha256:9876f1bd3f037516922c063e5e5633ab10dd557c0d814c5f2c5b93a924a8ced4'
        worktree_digest: 'sha256:9876f1bd3f037516922c063e5e5633ab10dd557c0d814c5f2c5b93a924a8ced4'
        untracked_digest: absent
      - path: 'DevDocs/schema-driven-ui-current-seams.md'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:c43a16573c070a2ae65ee17d49828681b3619357289511a634efd0dbde4550fa'
        index_digest: 'sha256:c43a16573c070a2ae65ee17d49828681b3619357289511a634efd0dbde4550fa'
        worktree_digest: 'sha256:c43a16573c070a2ae65ee17d49828681b3619357289511a634efd0dbde4550fa'
        untracked_digest: absent
      - path: 'DevDocs/target-architecture.md'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:bff8259391869adaaf81711db76818434a02034b93a5215e95d8feb2084ea5b7'
        index_digest: 'sha256:bff8259391869adaaf81711db76818434a02034b93a5215e95d8feb2084ea5b7'
        worktree_digest: 'sha256:bff8259391869adaaf81711db76818434a02034b93a5215e95d8feb2084ea5b7'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/app.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:b8de3007c7fea76cfd74b1e484b335681c554e181a7597ae9364a2de7c43beb1'
        index_digest: 'sha256:b8de3007c7fea76cfd74b1e484b335681c554e181a7597ae9364a2de7c43beb1'
        worktree_digest: 'sha256:b8de3007c7fea76cfd74b1e484b335681c554e181a7597ae9364a2de7c43beb1'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/doc-status.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:fd50c738b61c1a9caa55cbdc5ef6411a47a83d93d29a28b4ce8b5d39d87fe3fe'
        index_digest: 'sha256:fd50c738b61c1a9caa55cbdc5ef6411a47a83d93d29a28b4ce8b5d39d87fe3fe'
        worktree_digest: 'sha256:fd50c738b61c1a9caa55cbdc5ef6411a47a83d93d29a28b4ce8b5d39d87fe3fe'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/index.html'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:8e821bb7635c326923ca802c6da9ba87b2a049c2e213dec550e6850686ff48f4'
        index_digest: 'sha256:8e821bb7635c326923ca802c6da9ba87b2a049c2e213dec550e6850686ff48f4'
        worktree_digest: 'sha256:8e821bb7635c326923ca802c6da9ba87b2a049c2e213dec550e6850686ff48f4'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/primitives.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:fe4d09049d7171ff10fdcef44af59586919af991f540e641f27e93c7ee979d83'
        index_digest: 'sha256:fe4d09049d7171ff10fdcef44af59586919af991f540e641f27e93c7ee979d83'
        worktree_digest: 'sha256:fe4d09049d7171ff10fdcef44af59586919af991f540e641f27e93c7ee979d83'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/ribbon-home.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:19c4bfc9bf4fd99939b251b9f30edaefd17c46a69c132865c5f5ae9205dc8e97'
        index_digest: 'sha256:19c4bfc9bf4fd99939b251b9f30edaefd17c46a69c132865c5f5ae9205dc8e97'
        worktree_digest: 'sha256:19c4bfc9bf4fd99939b251b9f30edaefd17c46a69c132865c5f5ae9205dc8e97'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/ribbon.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:fa983c04602b40edcc3dc37000876529c1892bc5306c62748d13bf4d56632af5'
        index_digest: 'sha256:fa983c04602b40edcc3dc37000876529c1892bc5306c62748d13bf4d56632af5'
        worktree_digest: 'sha256:fa983c04602b40edcc3dc37000876529c1892bc5306c62748d13bf4d56632af5'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/styles.css'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:301a3503363fe01ceaa42d65f2058cdb426a5638fed2f340d140d0a77aac271b'
        index_digest: 'sha256:301a3503363fe01ceaa42d65f2058cdb426a5638fed2f340d140d0a77aac271b'
        worktree_digest: 'sha256:301a3503363fe01ceaa42d65f2058cdb426a5638fed2f340d140d0a77aac271b'
        untracked_digest: absent
      - path: 'legacy-editor-claude-design-template/workspace.jsx'
        object_kind: { head: regular, index: regular, worktree: regular, untracked: absent }
        state: clean
        rename_from: null
        rename_to: null
        head_digest: 'sha256:3a1e23d17bc9673829d9eaa19f609ac81e936497a8bf8d414769bb74e2a1e367'
        index_digest: 'sha256:3a1e23d17bc9673829d9eaa19f609ac81e936497a8bf8d414769bb74e2a1e367'
        worktree_digest: 'sha256:3a1e23d17bc9673829d9eaa19f609ac81e936497a8bf8d414769bb74e2a1e367'
        untracked_digest: absent

  primary_symbols:
    - symbol: App
      file: legacy-editor-claude-design-template/app.jsx
      lines: '4-236'
      role: Current composition root, state owner, command/editor controller, and migration seam.
    - symbol: Ribbon
      file: legacy-editor-claude-design-template/ribbon.jsx
      lines: '6-63'
      role: Current hard-coded tab dispatch and selection-preserving ribbon boundary.
    - symbol: Dropdown
      file: legacy-editor-claude-design-template/primitives.jsx
      lines: '22-60'
      role: Current reusable popup/dismissal interaction seam.
    - symbol: DocumentArea
      file: legacy-editor-claude-design-template/doc-status.jsx
      lines: '4-23'
      role: Current contentEditable and HTML rendering boundary.
    - symbol: HomeTab
      file: legacy-editor-claude-design-template/ribbon-home.jsx
      lines: '18-109'
      role: Representative repeated ribbon group/control/command composition.

  related_symbols:
    - symbol: App -> Ribbon
      relationship: source-composition; graph unresolved
      relevance: App passes the shared ctx state/callback bag and active tab state.
    - symbol: Ribbon -> HomeTab
      relationship: source-selected tab component; graph unresolved
      relevance: Hard-coded tab registry is replaced by workspace configuration.
    - symbol: HomeTab -> Dropdown
      relationship: source component use; graph unresolved
      relevance: Popup/focus behavior affects schema-driven ribbon controls.
    - symbol: App -> DocumentArea
      relationship: source-composition; graph unresolved
      relevance: Editor state/selection/HTML must remain isolated from foundation.

  execution_path:
    - index.html loads browser-global React/Babel scripts and calls ReactDOM.createRoot with App.
    - App initializes shell/editor state and applies persisted data-theme tokens.
    - App composes shell, Ribbon, panels, DocumentArea, status, Backstage, and dialogs with an untyped ctx bag.
    - Ribbon/workspace controls invoke ctx callbacks; editor commands focus the document and mutate browser selection/DOM.
    - React state refreshes formatting/count/status and rerenders the hard-coded composition.

  pdg_constraints:
    - description: No PDG layer was available; do not rely on fabricated control/data edges.
      affected_statements: []
      implementation_consequence: Re-run PDG-capable analysis after TypeScript functions exist and source-check missing edges before each commit.

  architectural_patterns:
    - pattern: Current centralized ctx callback bag
      example_location: legacy-editor-claude-design-template/app.jsx:123
      usage_guidance: Characterize and replace with typed shell/workspace/content contracts; do not copy it into the library.
    - pattern: Current theme CSS custom properties selected by data-theme
      example_location: legacy-editor-claude-design-template/styles.css:1
      usage_guidance: Preserve theme choices while promoting semantic tokens through one React provider.
    - pattern: Target workspace composition over reusable primitives
      example_location: DevDocs/target-architecture.md:20
      usage_guidance: Keep Editor/CRM definitions outside domain-neutral library packages.
    - pattern: Required bounded sub-step workflow
      example_location: AGENTS.md:5
      usage_guidance: Test, GitNexus-analyze/review, exact-scope conventional commit, record message in TODO, then push every sub-step.

  files_to_modify:
    - file: package.json and workspace/config files
      symbols: [root scripts, workspace boundaries, shared quality configuration]
      intended_change: Establish pnpm/Vite/strict-TypeScript/test/Storybook/CI foundation first.
    - file: packages/ui/src/foundation/**
      symbols: [theme, schema, commands, workspace, diagnostics]
      intended_change: Add reusable domain-neutral contracts before atomisation.
    - file: packages/ui/src/components/**
      symbols: [atomic-design component packages, schemas, barrels, stories]
      intended_change: Build independently packaged schema-backed themed components.
    - file: apps/editor-demo/src/**
      symbols: [migrated App, Ribbon, Dropdown, DocumentArea, HomeTab responsibilities]
      intended_change: Strangler-migrate legacy editor through shared foundation.
    - file: apps/crm-workspace/src/**
      symbols: [CRM workspace definition, sections, commands, data/capability adapters]
      intended_change: Compose the initial CRM experience without library domain coupling.
    - file: packages/integrations/ag-grid/**
      symbols: [optional wrapper]
      intended_change: Add only after licensing/data/accessibility go decision.

  tests:
    - file: packages/ui/src/foundation/**/*.test.ts
      scenarios: [schema version/validation/migration/failure, registry collisions, command lifecycle/capabilities, theme token parity, diagnostic redaction]
    - file: packages/ui/src/components/**/<ComponentName>.test.tsx
      scenarios: [props and states, schema-to-rendering, keyboard/focus, theme/density, cleanup and failure]
    - file: packages/ui/src/components/**/<ComponentName>.stories.tsx
      scenarios: [comprehensive docs, interaction assertions, accessibility checks, visual baselines]
    - file: apps/editor-demo/**/*.test.tsx and e2e/editor.spec.ts
      scenarios: [legacy parity, selection-sensitive commands, panels/status/dialogs, cutover]
    - file: apps/crm-workspace/**/*.test.tsx and e2e/crm.spec.ts
      scenarios: [single active section, workspace-owned commands/regions, data/permission/error/lifecycle]
    - file: packages/integrations/ag-grid/**/*.test.tsx
      scenarios: [optional dependency isolation, row model/data mapping, keyboard/accessibility, large-data budgets]

  verification_commands:
    - git diff --check
    - git status --short
    - gitnexus status
  planned_verification_scripts:
    - pnpm format:check
    - pnpm lint
    - pnpm typecheck
    - pnpm test
    - pnpm test:storybook
    - pnpm test:e2e
    - pnpm test:visual
    - pnpm build
    - pnpm storybook:build

  risks:
    - Legacy editor DOM command/selection behavior is timing-sensitive and deprecated.
    - Current GitNexus graph under-models browser-global React composition.
    - Component schemas, TypeScript props, Storybook metadata, and runtime behavior can drift.
    - Child-window transport can fail under popup/CSP/opener/browser constraints.
    - Schema/command registries can create security and permission bypasses without allowlists and runtime checks.
    - AG Grid can add licensing, bundle, accessibility, and backend coupling if not isolated.

  assumptions:
    - Reverify that remote main still points to 31440fdb26fe7d675f39f32c967c1b1fa7375831 before branching; use git ls-remote and merge-base.
    - Re-run repository inventory before Step 1 because all target package paths are new at the evidence commit.
    - Re-run GitNexus with known analyzer provenance after TypeScript setup; do not treat the f1fff06 zero-impact results as authoritative.
    - Confirm the approved package topology before creating packages; use the default topology in §3 only if no contrary ADR exists.

  open_questions:
    - Which JSON Schema draft, runtime validator, and schema/TypeScript source-of-truth strategy are approved?
    - What are the final package topology, bundle formats, registry, React peer range, and release/versioning tools?
    - What browser, screen-reader, viewport, density, contrast, and visual-regression matrices are supported?
    - Is ribbon-capable child UI portal-only, browser-window-capable, or an adapter with both; what CSP/opener transport is allowed?
    - What CRM API, authentication/authorization, tenant, caching/offline, permissions, and data-volume contracts exist?
    - Does optional AG Grid pass the Community/Enterprise licensing, feature, accessibility, row-model, and large-data gate?
    - What telemetry backend, privacy/retention rules, performance budgets, coverage thresholds, and documentation owners apply?

  avoid:
    - Do not repeat full repository discovery; revalidate only recorded assumptions and changed areas.
    - Do not replace established patterns without evidence.
    - Do not atomise editor-specific code before foundation contracts and characterization baselines exist.
    - Do not place editor or CRM types, data models, commands, or AG Grid APIs in foundation public contracts.
    - Do not embed functions, arbitrary module names, unsanitized markup, secrets, or authorization decisions in JSON configuration.
    - Do not add a component without its local schema/types/styles/tests/comprehensive story/barrel and schema-rendering coverage.
    - Do not bypass the shared theme provider/tokens with isolated page-specific styling.
    - Do not regenerate visual baselines blindly or before the final output-affecting sub-step in a sequence.
    - Do not commit or push a sub-step before relevant tests and GitNexus analysis/review pass.
    - Do not use generic/WIP commit messages; record the exact conventional message beside the TODO sub-step and match staged scope.
```

## 12. Assumptions and Open Questions

### Assumptions to reverify before implementation

- [assumed] Remote `main` and the implementation branch still descend from `31440fd`; verify with `git ls-remote`, `git fetch`, and `git merge-base` without rewriting history.
- [assumed] The default `apps/*` + `packages/ui` + optional `packages/integrations/*` topology fits publication needs; Step 1.1 may amend it through an ADR before files depend on it.
- [assumed] Modern/classic light and modern dark are the only initial built-in themes; custom theme support and token public stability are undecided.
- [assumed] The editor demo remains a parity reference and may run beside the new app until Phase 7 cutover.
- [assumed] CRM Contacts and Products are navigation/view examples, not authorization to invent persistent domain models or backend behavior.

### Decisions required at named gates

1. Step 1.1: package topology, publication boundaries, React peer range, build outputs.
2. Step 1.4: test packages/versions, coverage thresholds, CI/browser matrix, visual-regression service/baseline ownership.
3. Step 2.2: JSON Schema draft, validator, schema ID/version convention, additional-property behavior, source-of-truth/codegen direction, supported migration window.
4. Step 2.4: token names/stability, persistence adapter, contrast goal, custom theme and density support.
5. Step 2.5: state library (if any), persistence/deep links, command async/cancellation/capability semantics, observability interface.
6. Step 5.4: portal versus browser child window, CSP/opener transport, popup fallback, supported browsers.
7. Step 8.1: CRM API/authn/authz/tenant/data classification/caching/offline/error contracts.
8. Step 9.1: AG Grid go/no-go, Community/Enterprise, legal owner, row model, data volume and accessibility tradeoffs.
9. Step 10: performance budgets, release registry/versioning/deprecation, telemetry privacy/retention, documentation and support owners.

### Explicitly deferred, not silently omitted

- The actual CRM data model, backend endpoints, business workflows, record editing, and synchronization semantics.
- Replacement of the editor's deprecated contentEditable/execCommand engine beyond isolating and preserving it during v1 migration.
- Spreadsheet workspace implementation.
- Exact dependency versions and individual ESLint/Prettier rules until the tooling ADR/spike.
- A public plugin marketplace or third-party untrusted component execution model.

## 13. Definition of Done

The implementation plan is complete only when all of the following are true:

- pnpm/Vite/strict-TypeScript workspace, shared ESLint/Prettier, CI, layered tests, and Storybook gates run from documented root scripts.
- Foundation contracts for semantic theme/provider, versioned schema validation/migration, allowlisted registries/renderer, commands, diagnostics, and workspace lifecycle exist before editor atomisation.
- Every component is independently folder-packaged with implementation, types, CSS module, local JSON schema, tests, comprehensive Storybook story/docs, and public barrel; parity and schema-to-rendering tests prevent drift.
- Every component and composed region consumes one theme token/context contract; modern light, classic light, and modern dark remain coherent with no isolated page theme styling.
- Reusable shell regions include ribbon, left/right panels, status, content; ribbon groups retain fixed common height across mixed controls; keyboard/focus/responsive/density behavior is documented and verified.
- Ordinary dialogs and a ribbon-capable child/modal workspace have distinct accessible lifecycle contracts, shared theme behavior, cleanup, failure fallback, and E2E coverage.
- The editor is migrated incrementally with characterized behavior preserved and deprecated DOM editing APIs isolated from the library.
- The CRM workspace composes shared primitives, owns navigation/ribbon/panels/status/commands/views, presents one active section, and respects API/capability/security boundaries without domain leakage into the library.
- AG Grid, if approved, is optional behind a wrapper, license/version/data/accessibility decisions are recorded, and foundation/other apps build without it.
- Accessibility, visual, unit, integration, E2E, performance, security, dependency, cross-browser, observability, build/package/release, migration, and documentation ownership gates pass or have explicit owned waivers.
- Root `TODO.md` records exactly one active bounded sub-step and, for every completed sub-step, its exact conventional outcome-specific commit message; each completed sub-step has passed relevant tests and GitNexus analysis/review and has one focused commit pushed to GitHub.
