# ADR 0003: Verification harness and initial quality matrix

- Status: Accepted
- Date: 2026-08-05
- Scope: Phase 1, sub-step 1.4

## Context

The library needs executable unit, component-documentation, accessibility, browser, visual, and CI gates before reusable foundation work begins. This decision establishes the harness with an internal fixture; it does not introduce a public UI component or settle the final support matrix.

## Decision

- Vitest 4 and Testing Library provide jsdom unit/component tests. V8 coverage initially gates only the internal harness fixture at 80% for statements, branches, functions, and lines. Real package/application coverage expands as those boundaries land; final thresholds remain a later governance decision.
- Storybook 10 uses the React Vite framework, autodocs, the Vitest browser addon, and the accessibility addon. Story interactions run in Playwright Chromium, and `a11y.test` is `error`, so violations fail locally and in CI. Automated axe checks are an initial gate, not a substitute for manual keyboard or assistive-technology qualification.
- Playwright provides Chromium E2E smoke tests for the Editor bundle and internal harness story. Cross-browser coverage remains deferred to Phase 10.
- Playwright owns local visual regression. Reviewed PNG baselines are committed beside the visual spec and compared on Windows Chromium, matching the current development and CI baseline job. Baseline changes require explicit `pnpm test:visual:update`, human review, and the same bounded sub-step as the visual change. A hosted visual service remains an open decision.
- GitHub Actions runs quality, build, coverage, and static Storybook gates on Ubuntu and Windows. A dependent Windows Chromium job runs Storybook interaction/accessibility, E2E, and visual tests and uploads failure artifacts.
- The canonical commands are repository-root package scripts. Test files, stories, configs, and fixtures are TypeScript/TSX and participate in the strict test/tooling TypeScript project.

## Evidence and constraints

The Storybook Vitest addon requires a Vite framework and runs stories in browser-mode Chromium. Storybook accessibility tests fail in CLI/CI when `parameters.a11y.test` is `error`: <https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/> and <https://storybook.js.org/docs/writing-tests/accessibility-testing/>. Playwright warns that screenshot rendering varies by operating system and environment, so the baseline job is intentionally platform-pinned: <https://playwright.dev/docs/test-snapshots>.

## Deferred decisions

- Final coverage thresholds and per-package enforcement.
- Supported Chromium, Firefox, WebKit, mobile, screen-reader, and operating-system matrix.
- Hosted versus repository-local visual review, baseline retention, and approval ownership.
- Performance budgets, test sharding, documentation deployment, and release blocking policy.
