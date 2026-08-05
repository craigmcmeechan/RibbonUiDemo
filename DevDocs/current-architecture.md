# RibbonUI Demo: Current Architecture

Verified against commit `f1fff06229a31fcae936ac72062324e26254e08e` on 2026-08-05.

## Purpose and scope

RibbonUI Demo is a browser-only interactive prototype of a word processor with a ribbon interface. It demonstrates document editing, formatting, insertion, navigation, view controls, and representative collaboration, protection, plugin, and AI surfaces. It is not a document service: there is no backend, file parser, database, authentication, or real collaboration/plugin/AI integration.

## Runtime and entry points

- `legacy-editor-claude-design-template/index.html` is the only application entry point. It creates `#root`, loads `styles.css`, then loads the JSX files in a fixed order.
- React 18.3.1, ReactDOM 18.3.1, and Babel Standalone 7.29.0 are pinned CDN dependencies. Babel transpiles every `text/babel` script in the browser.
- `legacy-editor-claude-design-template/app.jsx` calls `ReactDOM.createRoot(...).render(...)`. Its `App` function is the composition root, shared-state owner, and command coordinator.
- Components communicate through browser globals. Supporting files attach components and constants to `window`; `app.jsx` must load last.

## Major components

| Area                             | Source                    | Current responsibility                                                                                                                                                                                  |
| -------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application shell and controller | `app.jsx`                 | Owns shared React state and DOM refs; builds the `ctx` property bag; implements editing, insertion, zoom, panels, theme, and keyboard commands; composes the page.                                      |
| Title bar                        | `titlebar.jsx`            | Document title, quick-access menus, print/undo/redo commands, static account UI, and close button.                                                                                                      |
| Ribbon host                      | `ribbon.jsx`              | Selects the active ribbon tab, opens File backstage, and preserves document selection when ribbon controls are clicked.                                                                                 |
| Core ribbon tabs                 | `ribbon-home.jsx`         | Home, Insert, Layout, and View controls. Wired controls call functions or setters supplied by `ctx`; many advanced controls are visual placeholders.                                                    |
| Additional ribbon tabs           | `ribbon-more.jsx`         | Draw, References, Collaboration, Protection, Plugins, and AI controls. Most non-display features are state toggles or prototype-only buttons.                                                           |
| Workspace rails and panels       | `workspace.jsx`           | Left search/comments/chat/navigation panels and right object/settings panels. Navigation and paragraph spacing/background have limited live behavior; most other panel content is static or local-only. |
| Document and overlays            | `doc-status.jsx`          | The editable sample document, ruler and zoom transform, status bar, File backstage, share dialog, and plugin dialog.                                                                                    |
| Shared UI primitives             | `primitives.jsx`          | Dropdown positioning/dismissal, menus, ribbon groups/buttons, palettes, combos, and check controls.                                                                                                     |
| Icons and styling                | `icons.jsx`, `styles.css` | Inline SVG icon registry and the complete layout/theme CSS. CSS custom properties define modern-light, classic-light, and modern-dark themes.                                                           |

## State and control flow

`App` holds the shared UI and editor state with React hooks. It passes values and callbacks to descendants as a single `ctx` object; there is no Context provider, external store, routing layer, or model/service layer.

The primary authoring flow is:

1. A ribbon, title-bar, panel, or keyboard event invokes a `ctx` callback.
2. `App` focuses the `contentEditable` document through `docRef`.
3. Formatting commands use `document.execCommand`; font size, line spacing, shading, and some insertions directly wrap or mutate the current DOM selection/block.
4. `refreshFmt` reads browser selection state with `queryCommandState`/`queryCommandValue`, and `refreshCounts` reads `innerText` to update ribbon/status UI.

`DocumentArea` injects the fixed `SAMPLE_DOC` HTML into one uncontrolled `contentEditable` page. Input updates only the word count. Selection mouse/key events refresh the formatting indicators. Page number and page count remain fixed at one.

Other key flows are:

- Ribbon tabs update `activeTab`; File opens the backstage overlay rather than selecting a panel.
- Left/right rail commands select panels in `App`; heading navigation queries headings in the document and scrolls the document container.
- Zoom changes a CSS transform around the page; fit calculations use the scroll container dimensions and fixed page dimensions of 816 × 1056.
- Theme selection updates the root `data-theme` attribute and persists only `de_theme` in `localStorage`.
- Global shortcuts open Find (`Ctrl/Cmd+F`), suppress Save (`Ctrl/Cmd+S`), or call browser print (`Ctrl/Cmd+P`).
- Generic dropdowns keep local open/position state and install document-level outside-click and Escape listeners while open.

GitNexus identifies five click-driven traces in the current index: title-bar command clicks reaching `exec` and then document focus/format/count refresh, plus dropdown/menu clicks reaching ribbon actions or dropdown close. Source inspection confirms those paths and shows that event callbacks and the `ctx` object are the principal integration mechanism between files.

## UI and integration boundaries

- The editable DOM is the effective document model. React owns surrounding UI state, but there is no separate document data structure or serialization boundary.
- Browser APIs are the only operational integrations: Selection/Range, `contentEditable`, `document.execCommand` and query APIs, `window.print`, keyboard/mouse events, prompt, and `localStorage`.
- Network access is limited to loading React, ReactDOM, and Babel from unpkg. The application itself makes no fetch/XHR/WebSocket calls.
- Save, close, file-location, search/replace, feedback, collaboration, sharing, review, protection, plugin, and AI presentations are mocked, no-op, or local state only. The displayed document URL, users, metadata, comments, chat, and plugin catalogue are fixed sample data.

## Configuration and build structure

The repository contains one application folder with 11 JSX/HTML/CSS source assets and no package manifest, bundler configuration, module system, test suite, lint configuration, or generated build output. Script order in `index.html` is the dependency graph. Runtime behavior and presentation are configured through constants in the JSX files and CSS variables in `styles.css`; there is no external application configuration.

## Notable legacy constraints and uncertainties

- `document.execCommand`, `queryCommandState`, and `queryCommandValue` are obsolete browser APIs. Formatting behavior, selection retention, and clipboard commands depend on browser support and focus behavior.
- Global `window` exports and ordered scripts create implicit cross-file dependencies that tooling does not enforce.
- Runtime JSX compilation and development React builds require the pinned CDN resources to be reachable and do not provide a production build pipeline.
- The `contentEditable` DOM mixes direct mutation with React-driven shell rerenders. There is no undo/document-history model beyond the browser editing stack and no persistence for document changes.
- Several state flags are display-only. For example, Viewing mode disables editing, but the separate read-only/protect/track/draw selections do not enforce corresponding document behavior.
- Some controls intentionally have no handler; wired prototype dialogs and panels often modify only transient local state. The exact intended future behavior of those controls is not defined in this repository.
- No automated tests or documented browser support matrix exist, so cross-browser command behavior and responsive edge cases remain unverified.
