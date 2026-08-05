import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { generatedSchemaTypePath, generateSchemaType } from '../schema/schema-type-generation';

export const atomicLevels = ['atoms', 'molecules', 'organisms', 'templates'] as const;
export type AtomicLevel = (typeof atomicLevels)[number];

export interface ComponentPolicyIssue {
  readonly code: string;
  readonly message: string;
  readonly path: string;
}

const componentNamePattern = /^[A-Z][A-Za-z0-9]*$/u;
const requiredStoryTerms = [
  'accessibility',
  'argTypes',
  'play',
  'states',
  'theme',
  'usage',
  'variants',
] as const;

function componentId(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/gu, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/gu, '$1-$2')
    .toLowerCase();
}

export function validateComponentName(name: string): void {
  if (!componentNamePattern.test(name) || name.length > 80) {
    throw new Error('Component name must be a PascalCase identifier of at most 80 characters.');
  }
}

export function validateAtomicLevel(level: string): asserts level is AtomicLevel {
  if (!atomicLevels.includes(level as AtomicLevel)) {
    throw new Error(`Atomic level must be one of: ${atomicLevels.join(', ')}.`);
  }
}

function schemaFor(name: string): Record<string, unknown> {
  const id = componentId(name);
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `urn:ribbon-ui:schema:component:${id}:1.0.0`,
    title: `${name}Config`,
    description: `Serializable configuration for the ${name} component.`,
    type: 'object',
    additionalProperties: false,
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        minLength: 1,
        description: 'Stable component instance identifier.',
      },
    },
  };
}

function templateFiles(name: string, level: AtomicLevel): Readonly<Record<string, string>> {
  const id = componentId(name);
  const storyLevel = `${level[0]?.toUpperCase() ?? ''}${level.slice(1)}`;
  return {
    [`${name}.css`]: `.ribbon-ui-${id} {
  color: var(--ribbon-ui-text-primary);
  background: var(--ribbon-ui-surface-toolbar);
}
`,
    [`${name}.schema.json`]: `${JSON.stringify(schemaFor(name), undefined, 2)}\n`,
    [`${name}.schema.test.ts`]: `import Ajv2020 from 'ajv/dist/2020.js';
import { describe, expect, it } from 'vitest';

import schema from './${name}.schema.json';
import type { ${name}Config, ${name}Props } from './${name}.types';

describe('${name} schema', () => {
  it('strictly validates the closed serializable contract without mutation', () => {
    const ajv = new Ajv2020({ allErrors: true, strict: true, useDefaults: false });
    const configuration = { id: '${id}-example' } satisfies ${name}Config;
    const before = JSON.stringify(configuration);
    const validate = ajv.compile<${name}Config>(schema);

    expect(validate(configuration)).toBe(true);
    expect(validate({ ...configuration, unsupported: true })).toBe(false);
    expect(JSON.stringify(configuration)).toBe(before);
  });

  it('keeps React-only props outside serialized configuration', () => {
    const props = { children: 'Example', id: '${id}-example' } satisfies ${name}Props;
    expect(props.children).toBe('Example');
  });
});
`,
    [`${name}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { RibbonThemeProvider } from '../../../theme';
import { ${name} } from './${name}';

const meta = {
  args: { children: '${name} example', id: '${id}-example' },
  argTypes: {
    children: { description: 'Runtime-only React content; not serialized in JSON configuration.' },
    className: { description: 'Runtime-only host layout class; must not override theme tokens.' },
    id: { description: 'Required serializable stable component instance identifier.' },
  },
  component: ${name},
  decorators: [(Story) => <RibbonThemeProvider themeId="modern-light"><Story /></RibbonThemeProvider>],
  parameters: {
    docs: {
      description: {
        component: 'Usage: replace this scaffold guidance with component-specific usage and non-goals. States and variants: document every supported state, variant, default, disabled, loading, and invalid behavior. Accessibility: document semantics, keyboard interaction, focus management, and screen-reader behavior. Theme and density: document every shared-token and density response. Add representative examples and interaction assertions before treating the component as complete.',
      },
    },
  },
  title: 'Components/${storyLevel}/${name}',
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('${name} example')).toBeVisible();
  },
};
`,
    [`${name}.test.tsx`]: `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RibbonThemeProvider } from '../../../theme';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders inside the shared theme contract', () => {
    render(
      <RibbonThemeProvider themeId="modern-light">
        <${name} id="${id}-example">Example</${name}>
      </RibbonThemeProvider>,
    );
    expect(screen.getByText('Example')).toHaveAttribute('data-ribbon-ui-component', '${id}');
  });
});
`,
    [`${name}.tsx`]: `import type { ReactElement } from 'react';

import { useRibbonTheme } from '../../../theme';
import './${name}.css';
import type { ${name}Props } from './${name}.types';

export function ${name}({ children, className, id }: ${name}Props): ReactElement {
  useRibbonTheme();
  const classes = className === undefined ? 'ribbon-ui-${id}' : \`ribbon-ui-${id} \${className}\`;

  return (
    <div className={classes} data-ribbon-ui-component="${id}" id={id}>
      {children}
    </div>
  );
}
`,
    [`${name}.types.ts`]: `import type { ReactNode } from 'react';

import type { ${name}Config } from './${name}.schema.types';

export type { ${name}Config };

export interface ${name}RuntimeProps {
  readonly children?: ReactNode;
  readonly className?: string;
}

export type ${name}Props = ${name}Config & ${name}RuntimeProps;
`,
    'index.ts': `export { ${name} } from './${name}';
export type { ${name}Config, ${name}Props, ${name}RuntimeProps } from './${name}.types';
`,
  };
}

export async function initializeComponentNamespace(root: string): Promise<void> {
  await mkdir(root, { recursive: true });
  await writeFile(
    path.join(root, 'index.ts'),
    `${atomicLevels.map((level) => `export * from './${level}';`).join('\n')}\n`,
    { encoding: 'utf8', flag: 'wx' },
  ).catch((error: unknown) => {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  });
  await Promise.all(
    atomicLevels.map(async (level) => {
      const levelPath = path.join(root, level);
      await mkdir(levelPath, { recursive: true });
      await writeFile(path.join(levelPath, 'index.ts'), 'export {};\n', {
        encoding: 'utf8',
        flag: 'wx',
      }).catch((error: unknown) => {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      });
    }),
  );
}

export async function scaffoldComponent(
  root: string,
  level: AtomicLevel,
  name: string,
): Promise<readonly string[]> {
  validateAtomicLevel(level);
  validateComponentName(name);
  const levelPath = path.resolve(root, level);
  const targetPath = path.join(levelPath, name);
  await mkdir(levelPath, { recursive: true });
  await mkdir(targetPath, { recursive: false });

  try {
    const files = templateFiles(name, level);
    for (const [fileName, contents] of Object.entries(files)) {
      await writeFile(path.join(targetPath, fileName), contents, { encoding: 'utf8', flag: 'wx' });
    }
    const schemaPath = path.join(targetPath, `${name}.schema.json`);
    const generatedPath = generatedSchemaTypePath(schemaPath);
    await writeFile(generatedPath, await generateSchemaType(schemaPath), {
      encoding: 'utf8',
      flag: 'wx',
    });

    const barrelPath = path.join(levelPath, 'index.ts');
    const barrel = await readFile(barrelPath, 'utf8').catch(() => '');
    const exports = barrel
      .split(/\r?\n/u)
      .filter((line) => line.length > 0 && line !== 'export {};')
      .concat(`export * from './${name}';`)
      .sort();
    await writeFile(barrelPath, `${exports.join('\n')}\n`, 'utf8');

    return Object.freeze(
      (await readdir(targetPath)).sort().map((fileName) => path.join(targetPath, fileName)),
    );
  } catch (error) {
    await rm(targetPath, { recursive: true, force: true });
    throw error;
  }
}

function issue(
  root: string,
  filePath: string,
  code: string,
  message: string,
): ComponentPolicyIssue {
  return Object.freeze({
    code,
    message,
    path: path.relative(root, filePath).replaceAll('\\', '/'),
  });
}

async function isDirectory(filePath: string): Promise<boolean> {
  return stat(filePath)
    .then((entry) => entry.isDirectory())
    .catch(() => false);
}

function requiredFileNames(name: string): readonly string[] {
  return [
    `${name}.css`,
    `${name}.schema.json`,
    `${name}.schema.test.ts`,
    `${name}.schema.types.ts`,
    `${name}.stories.tsx`,
    `${name}.test.tsx`,
    `${name}.tsx`,
    `${name}.types.ts`,
    'index.ts',
  ];
}

async function inspectComponent(
  root: string,
  level: AtomicLevel,
  name: string,
): Promise<ComponentPolicyIssue[]> {
  const componentPath = path.join(root, level, name);
  const issues: ComponentPolicyIssue[] = [];
  try {
    validateComponentName(name);
  } catch (error) {
    issues.push(issue(root, componentPath, 'component.name.invalid', (error as Error).message));
    return issues;
  }

  const entries = new Set(await readdir(componentPath));
  for (const fileName of requiredFileNames(name)) {
    if (!entries.has(fileName)) {
      issues.push(
        issue(
          root,
          path.join(componentPath, fileName),
          'component.file.missing',
          'Required file is missing.',
        ),
      );
    }
  }
  if (issues.some(({ code }) => code === 'component.file.missing')) return issues;

  const id = componentId(name);
  const schemaPath = path.join(componentPath, `${name}.schema.json`);
  const schemaText = await readFile(schemaPath, 'utf8');
  let schema: Record<string, unknown> | undefined;
  let schemaPropertyNames: readonly string[] = [];
  try {
    schema = JSON.parse(schemaText) as Record<string, unknown>;
  } catch {
    issues.push(
      issue(root, schemaPath, 'component.schema.invalid-json', 'Schema must be valid JSON.'),
    );
  }
  if (schema !== undefined) {
    const expectedId = `urn:ribbon-ui:schema:component:${id}:1.0.0`;
    if (
      schema['$schema'] !== 'https://json-schema.org/draft/2020-12/schema' ||
      schema['$id'] !== expectedId ||
      schema['title'] !== `${name}Config` ||
      schema['type'] !== 'object' ||
      schema['additionalProperties'] !== false ||
      !Array.isArray(schema['required']) ||
      typeof schema['description'] !== 'string' ||
      schema['description'].length === 0
    ) {
      issues.push(
        issue(
          root,
          schemaPath,
          'component.schema.governance',
          'Schema metadata or closed-object policy is invalid.',
        ),
      );
    }
    const properties = schema['properties'];
    if (typeof properties === 'object' && properties !== null) {
      schemaPropertyNames = Object.keys(properties);
    }
    if (
      typeof properties !== 'object' ||
      properties === null ||
      Object.values(properties).some(
        (property) =>
          typeof property !== 'object' ||
          property === null ||
          typeof (property as Record<string, unknown>)['description'] !== 'string',
      )
    ) {
      issues.push(
        issue(
          root,
          schemaPath,
          'component.schema.property-description',
          'Every schema property needs a description.',
        ),
      );
    }
  }

  const generatedPath = generatedSchemaTypePath(schemaPath);
  if (
    schema !== undefined &&
    (await readFile(generatedPath, 'utf8')) !== (await generateSchemaType(schemaPath))
  ) {
    issues.push(
      issue(root, generatedPath, 'component.schema.type-drift', 'Generated schema type is stale.'),
    );
  }

  const source = await readFile(path.join(componentPath, `${name}.tsx`), 'utf8');
  if (!source.includes(`import './${name}.css'`) || !source.includes('useRibbonTheme')) {
    issues.push(
      issue(
        root,
        path.join(componentPath, `${name}.tsx`),
        'component.theme.boundary',
        'Component must consume the shared theme contract and its separate CSS file.',
      ),
    );
  }
  const css = await readFile(path.join(componentPath, `${name}.css`), 'utf8');
  if (!css.includes('var(--ribbon-ui-') || /#[\da-f]{3,8}\b|\brgba?\(|\bhsla?\(/iu.test(css)) {
    issues.push(
      issue(
        root,
        path.join(componentPath, `${name}.css`),
        'component.theme.token',
        'Styles must use shared theme variables without local color literals.',
      ),
    );
  }
  const types = await readFile(path.join(componentPath, `${name}.types.ts`), 'utf8');
  if (
    !types.includes(`${name}Config`) ||
    !types.includes(`${name}RuntimeProps`) ||
    !types.includes(`${name}Props = ${name}Config & ${name}RuntimeProps`)
  ) {
    issues.push(
      issue(
        root,
        path.join(componentPath, `${name}.types.ts`),
        'component.types.boundary',
        'Config, runtime props, and public props composition must remain explicit.',
      ),
    );
  }
  const localBarrel = await readFile(path.join(componentPath, 'index.ts'), 'utf8');
  if (
    !localBarrel.includes(`from './${name}'`) ||
    !localBarrel.includes(`from './${name}.types'`)
  ) {
    issues.push(
      issue(
        root,
        path.join(componentPath, 'index.ts'),
        'component.barrel.local',
        'Local barrel must export implementation and public types.',
      ),
    );
  }
  const levelBarrel = await readFile(path.join(root, level, 'index.ts'), 'utf8').catch(() => '');
  if (!levelBarrel.includes(`export * from './${name}';`)) {
    issues.push(
      issue(
        root,
        path.join(root, level, 'index.ts'),
        'component.barrel.level',
        'Atomic-level barrel must export the component.',
      ),
    );
  }
  const storyPath = path.join(componentPath, `${name}.stories.tsx`);
  const story = await readFile(storyPath, 'utf8');
  for (const term of requiredStoryTerms) {
    if (!story.toLowerCase().includes(term.toLowerCase())) {
      issues.push(
        issue(
          root,
          storyPath,
          'component.storybook.documentation',
          `Storybook documentation must cover ${term}.`,
        ),
      );
    }
  }
  const runtimeInterface = new RegExp(
    `export interface ${name}RuntimeProps\\s*\\{(?<body>[\\s\\S]*?)\\}`,
    'u',
  ).exec(types)?.groups?.['body'];
  const runtimePropertyNames =
    runtimeInterface === undefined
      ? []
      : [...runtimeInterface.matchAll(/^\s*readonly\s+(?<name>[A-Za-z][A-Za-z0-9]*)\??\s*:/gmu)]
          .map((match) => match.groups?.['name'])
          .filter((propertyName): propertyName is string => propertyName !== undefined);
  for (const propertyName of [...schemaPropertyNames, ...runtimePropertyNames]) {
    if (!story.includes(`${propertyName}: {`)) {
      issues.push(
        issue(
          root,
          storyPath,
          'component.storybook.prop-documentation',
          `Storybook argTypes must document ${propertyName}.`,
        ),
      );
    }
  }
  return issues;
}

export async function checkComponentPolicy(
  root: string,
  publicBarrelPath?: string,
): Promise<readonly ComponentPolicyIssue[]> {
  const resolvedRoot = path.resolve(root);
  const issues: ComponentPolicyIssue[] = [];
  const rootBarrel = await readFile(path.join(resolvedRoot, 'index.ts'), 'utf8').catch(() => '');
  if (publicBarrelPath !== undefined) {
    const publicBarrel = await readFile(publicBarrelPath, 'utf8').catch(() => '');
    if (!publicBarrel.includes("export * from './components';")) {
      issues.push(
        issue(
          resolvedRoot,
          publicBarrelPath,
          'component.barrel.public',
          'Package public barrel must export the component namespace.',
        ),
      );
    }
  }
  for (const level of atomicLevels) {
    const levelPath = path.join(resolvedRoot, level);
    if (!(await isDirectory(levelPath))) {
      issues.push(
        issue(resolvedRoot, levelPath, 'component.level.missing', 'Atomic level is missing.'),
      );
      continue;
    }
    if (!rootBarrel.includes(`export * from './${level}';`)) {
      issues.push(
        issue(
          resolvedRoot,
          path.join(resolvedRoot, 'index.ts'),
          'component.barrel.root',
          `Root barrel must export ${level}.`,
        ),
      );
    }
    const entries = await readdir(levelPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        issues.push(...(await inspectComponent(resolvedRoot, level, entry.name)));
      }
    }
  }
  return Object.freeze(issues);
}
