# Project TODO

- Plan: `docs/plans/2026-08-05-gitnexus-plan-schema-driven-crm-library.md`
- Branch: `feature/schema-ui-library-v1`
- Active sub-step: **1.1 — Decide topology and bootstrap pnpm/Vite workspaces**
- Status: In progress

## Documentation and activation

- **D.0 — Completed:** Created and validated the deep implementation plan. Commit: `20a9093` (`docs(plan): define schema-driven CRM library roadmap`). Push: succeeded.
- **D.1 — Completed:** Documented reviewed Gemma/Kimi/hosted-Codex routing, no-auth configuration, independent three-task pools, handoff protocol, compatibility evidence, and secret boundaries. Checks and GitNexus review passed. Commit: `docs(workflow): define reviewed local-model task routing`. Push: this feature branch.

## Phase 1 — TypeScript workspace and quality foundation

- **1.1 — In progress:** Decide topology and bootstrap pnpm/Vite workspaces. Intended commit: `chore(tooling): bootstrap TypeScript workspace boundaries`.
- **1.2 — Pending:** Enforce shared strict TypeScript contracts. Intended commit: `chore(types): enforce strict shared TypeScript checks`.
- **1.3 — Pending:** Add shared ESLint and Prettier gates. Intended commit: `chore(quality): add shared lint and formatting gates`.
- **1.4 — Pending:** Establish unit, Storybook, E2E, visual, and CI harnesses. Intended commit: `test(tooling): establish UI verification harnesses`.

## Phase 2 — Reusable foundation contracts

- **2.1 — Pending:** Freeze legacy characterization and migration criteria. Intended commit: `test(editor): capture legacy migration baselines`.
- **2.2 — Pending:** Decide schema governance and synchronization. Intended commit: `docs(schema): define versioned component contract governance`.
- **2.3 — Pending:** Implement validation, diagnostics, and schema composition core. Intended commit: `feat(schema): add versioned validation and diagnostics core`.
- **2.4 — Pending:** Implement shared theme token/provider foundation. Intended commit: `feat(theme): establish shared semantic theme contract`.
- **2.5 — Pending:** Define command, state, and workspace lifecycle contracts. Intended commit: `feat(runtime): define command and workspace lifecycle boundaries`.

## Phase 3 — Component packaging and atoms

- **3.1 — Pending:** Add component scaffold and barrel/schema policy checks. Intended commit: `chore(components): enforce component package conventions`.
- **3.2 — Pending:** Deliver the schema-backed pilot button atom. Intended commit: `feat(atoms): deliver schema-backed button contract`.
- **3.3 — Pending:** Add remaining atoms as one component per bounded sub-step. Message pattern: `feat(atoms): add schema-backed <component> behavior`.
- **3.4 — Pending:** Build accessible popup/dropdown primitives. Intended commit: `feat(atoms): add accessible popup interaction primitives`.

## Phase 4 — Schema-driven ribbon and layout regions

- **4.1 — Pending:** Implement ribbon tab/group/control composition. Intended commit: `feat(ribbon): render registered schema-defined controls`.
- **4.2 — Pending:** Enforce fixed common ribbon-group height. Intended commit: `fix(ribbon): enforce consistent group height across controls`.
- **4.3 — Pending:** Complete ribbon keyboard, focus, overflow, and density behavior. Intended commit: `feat(ribbon): add accessible responsive navigation behavior`.
- **4.4 — Pending:** Re-express editor ribbon as workspace configuration. Intended commit: `refactor(editor): define ribbon through workspace configuration`.

## Phase 5 — Shell, dialogs, and child workspaces

- **5.1 — Pending:** Implement reusable application shell regions. Intended commit: `feat(shell): compose reusable themed layout regions`.
- **5.2 — Pending:** Implement left navigation/panel primitives. Intended commit: `feat(navigation): add workspace-owned popout section rail`.
- **5.3 — Pending:** Implement ordinary dialog foundation. Intended commit: `feat(dialog): add accessible ordinary dialog contract`.
- **5.4 — Pending:** Decide and implement ribbon-capable workspace-window host. Intended commit: `feat(workspace): add ribbon-capable child workspace host`.

## Phase 6 — Workspace schema loading and rendering

- **6.1 — Pending:** Implement allowlisted component and command registries. Intended commit: `feat(runtime): add allowlisted UI and command registries`.
- **6.2 — Pending:** Implement versioned workspace loader and migrations. Intended commit: `feat(schema): load and migrate workspace definitions safely`.
- **6.3 — Pending:** Implement deterministic schema-to-React renderer. Intended commit: `feat(renderer): compose validated workspace schemas`.
- **6.4 — Pending:** Add runtime observability and failure UX. Intended commit: `feat(diagnostics): expose redacted workspace failure signals`.

## Phase 7 — Safe editor migration

- **7.1 — Pending:** Move editor state and commands behind workspace adapters. Intended commit: `refactor(editor): isolate document state and command adapters`.
- **7.2 — Pending:** Migrate editor shell regions one region per sub-step. Message pattern: `refactor(editor): migrate <region> to shared shell`.
- **7.3 — Pending:** Cut over editor workspace and retire browser globals. Intended commit: `refactor(editor): complete schema-driven workspace cutover`.

## Phase 8 — Initial CRM workspace

- **8.1 — Pending:** Define CRM API, capability, and security boundaries. Intended commit: `docs(crm): define data and permission boundaries`.
- **8.2 — Pending:** Compose CRM shell and navigation definition. Intended commit: `feat(crm): compose Outlook-inspired workspace shell`.
- **8.3 — Pending:** Add section views one bounded section at a time. Message pattern: `feat(crm): add <section> workspace experience`.
- **8.4 — Pending:** Validate CRM lifecycle, errors, and responsive behavior. Intended commit: `test(crm): verify workspace lifecycle and recovery`.

## Phase 9 — Optional AG Grid integration

- **9.1 — Pending:** Decide edition, license, row model, accessibility, and data-volume strategy. Intended commit: `docs(grid): decide optional CRM grid strategy`.
- **9.2 — Pending:** Build wrapper only after a go decision. Intended commit: `feat(grid): encapsulate optional AG Grid integration`.
- **9.3 — Pending:** Prove accessibility and large-data behavior. Intended commit: `test(grid): verify accessible large-data behavior`.

## Phase 10 — Hardening and release

- **10.1 — Pending:** Run accessibility and cross-browser qualification. Intended commit: `test(a11y): qualify workspace interaction patterns`.
- **10.2 — Pending:** Lock responsive, density, theme, and visual contracts. Intended commit: `test(visual): lock shell and component appearance contracts`.
- **10.3 — Pending:** Qualify performance, reliability, and security. Intended commit: `test(platform): qualify performance and security boundaries`.
- **10.4 — Pending:** Finalize package/release and documentation governance. Intended commit: `chore(release): establish library publication governance`.

## Tracking rules

- Keep exactly one sub-step `In progress` and repeat its identifier in **Active sub-step**.
- Split pattern entries into concrete component/region/section sub-steps before work begins.
- Record scope, acceptance criteria, targeted files, tests, and the exact intended conventional commit message before editing.
- Mark a sub-step `Completed` only after relevant tests and GitNexus change/impact analysis plus review pass.
- Confirm staged scope matches the recorded non-generic message before commit.
- Create one focused commit per completed sub-step, advance the active marker, and push before starting the next sub-step.
