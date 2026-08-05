# Project Expectations

These are user-declared requirements for future project work. They do not describe the current legacy RibbonUI implementation and are not an implementation plan.

## Required foundations

- The project will use React.
- Vite will provide the development and build toolchain.
- pnpm will be the package manager.
- UI components will follow the Atomic Design pattern.

## Component packaging convention

Each component will have its own public barrel file and separate implementation concerns, including:

- Component implementation.
- Barrel export file.
- CSS/CSS Module styling file.
- Interface/type declarations.
- Tests.
- Storybook stories.

The exact folder names, atomic-level pluralization, file names, and whether interfaces and other types occupy one file or separate files remain naming-convention decisions. No decision about JSON schema files or other future architecture is added by this note.
