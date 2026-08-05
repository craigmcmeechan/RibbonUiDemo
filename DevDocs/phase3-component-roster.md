# Phase 3 Component Roster and Atom-First Build Order

- Status: Proposed
- Date: 2026-08-05
- Scope: Phase 3 (atoms) with forward reference to Phase 4 (ribbon/layout) and Phase 5 (shell/regions/dialogs)

## Intent

Build the reusable RibbonUI library bottom-up: complete the domain-neutral **atom** layer first so that molecules, organisms, and templates can compose from stable leaf primitives. This roster makes the Phase 3.3 pattern concrete. It is a working plan, not a fixed manifest: names, order, and exact props are finalized one sub-step at a time through the verified one-commit workflow.

## Atomic Design boundaries used here

- **Atom**: a leaf primitive that cannot be decomposed further and does not own another component. Display, structure, and single input controls.
- **Molecule**: composes atoms and owns a small interaction contract (for example Field = Label + input + helper).
- **Organism**: a region composed of molecules/atoms (ribbon group, panel, status bar).
- **Template**: a full layout shell composed of organisms.

## Completed atoms

| Sub-step | Component    | Notes                            |
| -------- | ------------ | -------------------------------- |
| 3.2      | Button       | Visible-label action atom        |
| 3.3a     | IconButton   | Icon-only action atom            |
| 3.3b     | ToggleButton | Controlled `aria-pressed` toggle |
| 3.3c     | Separator    | Decorative divider               |

## Proposed atom build order (Phase 3.3, domain-neutral leaf primitives)

Each row is a future one-commit sub-step. Order runs simple/low-dependency first; inputs follow display so Field-style molecules can compose them.

| Sub-step | Component   | Category | Purpose and notes                                                                                                                                                  |
| -------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.3d     | Label       | Display  | Visible text label; runtime `htmlFor` upgrades the element to a form `<label>`. Used by Field, menu heads, group labels.                                           |
| 3.3e     | Icon        | Display  | Standalone decorative allowlisted icon (`aria-hidden`); IconButton embeds glyphs, but a standalone Icon is needed for menus, groups, and inline adornment.         |
| 3.3f     | Badge       | Display  | Compact status pill (neutral/info/success/warning/danger); token-only.                                                                                             |
| 3.3g     | TextInput   | Input    | Single-line text field; runtime change/focus callbacks; schema holds placeholder, size, disabled, readonly, required, variant, defaultValue.                       |
| 3.3h     | TextArea    | Input    | Multi-line text field; same runtime/schema split as TextInput.                                                                                                     |
| 3.3i     | Checkbox    | Input    | Boolean check with a visible label and `aria-checked`; controlled.                                                                                                 |
| 3.3j     | Radio       | Input    | Single radio item (`role="radio"`); a RadioGroup molecule composes multiple.                                                                                       |
| 3.3k     | Switch      | Input    | On/off control using `role="switch"`; distinct from ToggleButton (button with `aria-pressed`). Decide whether both ship or one subsumes the other at the sub-step. |
| 3.3l     | Select      | Input    | Native `<select>` wrapper with allowlisted options; ComboBox (input + dropdown) is a later molecule.                                                               |
| 3.3m     | Slider      | Input    | Range input; value/min/max/step in schema; change callback runtime-only.                                                                                           |
| 3.3n     | Spinner     | Feedback | Loading indicator; token-only, `aria-hidden` decorative plus an accessible label option.                                                                           |
| 3.3o     | ColorSwatch | Display  | Single color chip; a ColorPicker molecule composes swatches with a field.                                                                                          |

This list is intentionally not exhaustive. Additional atoms (for example Progress, Heading, VisuallyHidden, Kbd) may be inserted when a molecule or region proves it needs them, following the same one-commit gate.

## Explicitly NOT atoms (built later)

These demo primitives are interaction containers or ribbon composites, not leaf atoms. Their semantics depend on a composition owner, so building them as pure atoms first would produce a broken API that changes when composed.

| Primitive                                                           | Builds as                  | Phase     | Reason                                                                              |
| ------------------------------------------------------------------- | -------------------------- | --------- | ----------------------------------------------------------------------------------- |
| MenuItem, Menu, Dropdown                                            | Interaction atoms/molecule | 3.4       | Owns focus, arrow/Escape, outside dismiss; needs the trigger/menu contract first.   |
| ComboBox, Tooltip, SplitButton, ColorButton, MiniStepper, ColorGrid | Molecules                  | 4 / 5     | Compose atoms plus a popup; some are ribbon-specific.                               |
| BigButton, SmallButton, SmallCaret, FmtButton, RibbonCheck          | Ribbon composites          | 4.4       | Re-expressed as schema-driven ribbon controls from the atoms above, not copied 1:1. |
| Dialog, child workspace window                                      | Organism/template          | 5.3 / 5.4 | Separate focus/lifecycle contracts decided first.                                   |
| Ribbon, RibbonGroup, RibbonTab, panel/status/content regions        | Organisms/templates        | 4 / 5     | Layout regions composed from atoms and molecules.                                   |

## Shortcomings analyzed in the "build all atoms first" approach

1. **Interaction primitives are not leaf atoms.** Menu, Dropdown, MenuItem, ComboBox, Tooltip, and Dialog own focus management, keyboard models, and dismissal that only make sense once their container is defined. The plan already isolates popup/dropdown primitives in 3.4 and dialogs in 5.3, so the atom roster above deliberately excludes them. Forcing them into 3.3 would create APIs that must be reworked when composed.
2. **Some demo primitives are ribbon-specific composites, not atoms.** `BigButton`, `SmallButton`, `FmtButton`, `ColorButton`, `Combo`, and `MiniStepper` are ribbon controls that will be built as molecules/organisms in Phase 4 from the atoms created now. Building them 1:1 as atoms would bake ribbon semantics into the domain-neutral library.
3. **Speculative atoms risk rework.** An atom with no consuming molecule may need API changes when composition reveals missing or wrong props. Mitigation: derive each atom from the demo's verified vocabulary plus standard library conventions, keep the serializable surface minimal, and accept that Phase 4 may tweak some atoms. The one-commit, test-gated workflow keeps rework cheap and reviewable.
4. **Bottom-up is a preference, not a hard dependency.** Atomic Design does not require every atom before any molecule; a molecule may be built as soon as its constituent atoms exist. This roster honors the atom-first preference because it reduces backfilling, but a molecule may be pulled forward if it validates composition of finished atoms.
5. **Naming is deferred.** Whether `Switch` and `ToggleButton` both ship, whether the select is `Select` or `ComboBox`, and whether status is `Badge` or `Tag` are decided at the relevant sub-step, not here.

## Styling policy

Every component consumes only shared semantic theme tokens derived from the demo's `modern-light`, `classic-light`, and `modern-dark` themes. No local color literals. This is already enforced by the component-policy check and is why finished atoms render in the Ribbon Demo visual language across all three themes. Ribbon group fixed-height geometry is a Phase 4.2 concern.
