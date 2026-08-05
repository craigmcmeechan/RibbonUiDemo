# Schema-Driven UI: Current Implementation Seams

Verified against commit `f1fff06229a31fcae936ac72062324e26254e08e` on 2026-08-05. This document supplements `current-architecture.md`. It describes the current implementation only; it is not a target architecture or implementation plan.

## Factual observations

### Component boundaries

The source has three practical component layers:

1. `app.jsx` is the composition root, shared controller, and owner of cross-feature state.
2. `titlebar.jsx`, `ribbon*.jsx`, `workspace.jsx`, and `doc-status.jsx` group components by visible application area. Thirty function components accept the same `{ ctx }` property bag rather than feature-specific typed props.
3. `primitives.jsx` and `icons.jsx` provide the reusable visual layer: dropdowns, menus, groups, rows, button variants, palettes, combos, checks, and named SVG icons.

Files are script boundaries, not JavaScript module boundaries. Components are attached to `window`, and `index.html` establishes their dependency order. There are no imports, exports, TypeScript interfaces, runtime prop validators, per-component folders, or barrel files.

Some selection is already table-driven:

- `Ribbon` maps active tab names to tab components.
- `LeftPanel` and `RightPanel` map string IDs to panel components.
- Ribbon tabs, left/right rails, fonts, styles, colors, plugin entries, navigation entries, and several sample-data lists are arrays or objects rendered with `map`.
- `Icon` resolves a string name through `ICON_PATHS`.

These are separate local tables with different shapes. They do not form a shared component catalogue, expose prop metadata, or recursively describe the rendered application tree.

### Repeated construction patterns

The ribbon is assembled from a small vocabulary of primitives but repeats their instantiation directly in tab functions. At the verified commit, the source contains 64 `BigButton`, 21 `SmallButton`, 19 `LabeledSmall`, 42 `Group`, 51 `Row`, 25 `MenuItem`, and 14 `Dropdown` constructions.

Labels, icon names, checked expressions, tooltips, and inline callbacks are colocated at each call site. A button label may be a string or an array of strings to create line breaks. Enabled behavior is determined by whether an `onClick` callback is present; many prototype controls render without one. There is no separate declaration that distinguishes implemented, state-only, placeholder, or unavailable controls.

The right settings rail shows another repeated pattern: five object-specific panels are instances of `SimplePanel` supplied with only a title and row labels. The ribbon, rails, menus, style gallery, color grid, table picker, people lists, and plugin lists all use in-code arrays, but no common schema governs them.

### State ownership

`App` declares 33 `useState` values. It owns shell visibility, active tabs and panels, modal visibility, theme and zoom, formatting indicators, editing/review flags, drawing selections, language, word count, and fixed page counters. It also owns the document and scroll refs and places almost every value, setter, or wrapper callback into `ctx`.

Transient state remains local to individual components:

- `Dropdown`: open state and viewport position.
- `SearchPanel`: query and two option toggles.
- `ParagraphSettings`: one checkbox.
- `TableButton`: hovered dimensions.
- `Backstage`: selected section.

The editable document is a third state location: its current HTML and selection live in the browser DOM, outside React state. React retains formatting indicators and counts derived from that DOM, not the document content itself. There is no reducer, external store, context provider, normalized entity model, node identity, or serialized design-tree state.

### Callback, command, and event flow

Most behavior is connected through function values in `ctx` and inline closures in component definitions. `TitleBar` is the main exception: it receives a smaller direct prop surface including `onCmd`.

Several string-based command families exist:

- `ctx.exec(command, value)` forwards browser editing command names such as `bold`, `copy`, `justifyCenter`, and `insertOrderedList` to `document.execCommand`.
- `ctx.insert(kind, options)` switches over application-defined kinds such as `table`, `image`, `link`, `textbox`, and `symbol`.
- Tab names, panel IDs, theme IDs, edit modes, drawing tools, and visibility keys are strings interpreted by separate setters or lookup maps.

These strings are not collected into one command/action registry and have no common payload contract. Many controls bypass `exec` and call setters or feature callbacks directly. Function-valued callbacks and closures carry the behavior, so the present control definitions are not serializable data.

GitNexus identifies five indexed click flows. Three run from `TitleBar.onClick` through `App.onCmd` and `exec` to document focus, formatting refresh, or word-count refresh. Two run from primitive/menu clicks through `onPick` to an apply callback or dropdown close. Direct source inspection shows additional event paths through `ctx`, the global keyboard listener, selection events, and document-level dropdown dismissal listeners.

### Rendering assumptions

The application tree is written directly as `React.createElement` calls (656 at the verified commit). `App` hardcodes the shell hierarchy; tab and panel functions hardcode their groups and controls; primitives receive React elements or callbacks as children/props.

Dynamic rendering is limited to choosing known component functions from local maps and iterating local arrays. There is no generic component registry, recursive data-to-component renderer, serializable node type, stable instance ID, slot model, nesting validation, or schema/version lookup. `ICON_PATHS` is a name-to-SVG-data registry, but it registers icons rather than React UI components.

The runtime also assumes all component functions already exist as globals when a parent renders. Component availability is therefore determined by script load order rather than registry validation or module resolution.

### Editable-content boundary

`DocumentArea` creates one page by assigning the fixed `SAMPLE_DOC` string through `dangerouslySetInnerHTML` and marking the page `contentEditable` unless `editMode` is `Viewing`. The edited HTML is not copied into React state.

Formatting and insertion use three mechanisms against the live DOM:

- `document.execCommand` and `queryCommandState`/`queryCommandValue`.
- Selection/Range operations that wrap selected content in a styled `span`.
- Direct mutation of the selected block's `style`, plus `insertHTML` strings containing inline styles.

Ribbon `mousedown` handling prevents default focus changes so the browser selection remains available to later commands. Mouse-up and key-up events refresh a subset of formatting indicators; input events recompute word count from `innerText`. Heading navigation queries rendered headings by text/data attributes. Only the interface theme is persisted; the document HTML, selection, history, and editor flags are not serialized.

`readOnly`, protection, tracking, painter, and drawing state do not alter this content model. Only `editMode === 'Viewing'` changes the `contentEditable` flag. There is no component-tree/document-tree equivalence, HTML import/export boundary, sanitization path, schema validation, or application-level undo model in the repository.

### Styling and theming

`styles.css` is a single global stylesheet. Components reference global class-name strings, and CSS selectors rely on the current DOM structure. Three interface themes are defined by CSS custom-property sets selected through the root `data-theme` attribute. `App` stores the selected theme ID in `localStorage` under `de_theme`.

CSS variables provide shared color and dimension tokens, while component-specific presentation is split between the global stylesheet and React inline style objects. The JSX source contains 122 inline style objects, and some inserted document fragments contain literal inline CSS strings. There are no CSS Modules, generated class contracts, theme metadata files, or component-level style manifests.

### Dependencies and absent abstractions

The repository has no package manifest or build configuration. React, ReactDOM, and Babel Standalone are loaded as pinned UMD scripts from unpkg; Babel transpiles the scripts in the browser. There are no `.ts`, `.tsx`, `.json`, or `.module.css` application files and no tests or stories.

The following schema-oriented concepts are absent from the current source:

- Component schema files, schema IDs, schema versions, prop definitions, defaults, categories, status flags, slots, or nesting constraints.
- A runtime React component registry separate from the icon map and the ribbon/panel lookup objects.
- A serializable UI/design node model or a generic renderer for such nodes.
- A named action registry with validated payloads.
- Schema/design validation, migrations, changelogs, or compatibility handling.
- Document/design persistence, operation logs, API clients, offline storage, or server integration.
- A design-time/runtime separation for editable component metadata.

### Constraints exposed by the current implementation

These are present-state constraints, not proposed solutions:

- Component props and supported behavior are implicit in function signatures and call sites, so they cannot currently be enumerated or validated from data.
- Behavior is primarily represented by live functions, closures, and browser DOM operations, which cannot be stored directly in JSON.
- Component identity is based on global function names and local string conventions; rendered instances have no stable application-level IDs.
- The visible UI hierarchy and the editable document use different representations: hardcoded React elements for the shell and mutable HTML for document content.
- UI catalogue data is distributed across several files and shapes, so no single source currently defines available components, controls, defaults, or status.
- Global CSS selectors and inline styles bind presentation to current class names, DOM nesting, and ad hoc style objects rather than component metadata.
- Editing results depend on browser selection/focus and obsolete command APIs, not on deterministic transformations of a serializable document model.

## Recommendations and future architecture

None are included here. Target schemas, registries, action contracts, state models, migration strategy, and implementation sequencing require a separate planning document.
