import { mkdir, mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import ts from 'typescript';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  checkComponentPolicy,
  initializeComponentNamespace,
  scaffoldComponent,
  validateAtomicLevel,
  validateComponentName,
} from '../../scripts/components/component-tooling';

let temporaryRoot: string;
let componentsRoot: string;
let publicBarrelPath: string;

beforeEach(async () => {
  temporaryRoot = await mkdtemp(path.join(tmpdir(), 'ribbon-ui-component-tooling-'));
  componentsRoot = path.join(temporaryRoot, 'components');
  publicBarrelPath = path.join(temporaryRoot, 'index.ts');
  await initializeComponentNamespace(componentsRoot);
  await writeFile(publicBarrelPath, "export * from './components';\n", 'utf8');
});

afterEach(async () => {
  await rm(temporaryRoot, { recursive: true, force: true });
});

async function scaffoldButton(): Promise<string> {
  await scaffoldComponent(componentsRoot, 'atoms', 'RibbonButton');
  return path.join(componentsRoot, 'atoms', 'RibbonButton');
}

async function directoryContents(directory: string): Promise<Record<string, string>> {
  const names = [
    'RibbonButton.css',
    'RibbonButton.schema.json',
    'RibbonButton.schema.test.ts',
    'RibbonButton.schema.types.ts',
    'RibbonButton.stories.tsx',
    'RibbonButton.test.tsx',
    'RibbonButton.tsx',
    'RibbonButton.types.ts',
    'index.ts',
  ];
  return Object.fromEntries(
    await Promise.all(
      names.map(
        async (name) => [name, await readFile(path.join(directory, name), 'utf8')] as const,
      ),
    ),
  );
}

describe('component scaffolding', () => {
  it('creates deterministic, syntactically valid component packaging with generated schema types', async () => {
    const firstPath = await scaffoldButton();
    const first = await directoryContents(firstPath);
    const secondRoot = path.join(temporaryRoot, 'second-components');
    await initializeComponentNamespace(secondRoot);
    const secondPath = path.join(secondRoot, 'atoms', 'RibbonButton');
    await scaffoldComponent(secondRoot, 'atoms', 'RibbonButton');

    expect(await directoryContents(secondPath)).toEqual(first);
    expect(Object.keys(first).sort()).toEqual(
      Object.keys(await directoryContents(firstPath)).sort(),
    );
    for (const [fileName, source] of Object.entries(first)) {
      if (!/\.tsx?$/u.test(fileName)) continue;
      const diagnostics = ts.transpileModule(source, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
        fileName,
        reportDiagnostics: true,
      }).diagnostics;
      expect(diagnostics, fileName).toEqual([]);
    }
    expect(await checkComponentPolicy(componentsRoot, publicBarrelPath)).toEqual([]);
  });

  it('refuses to overwrite an existing component or its barrel entry', async () => {
    const componentPath = await scaffoldButton();
    const before = await directoryContents(componentPath);
    const barrelPath = path.join(componentsRoot, 'atoms', 'index.ts');
    const barrelBefore = await readFile(barrelPath, 'utf8');

    await expect(scaffoldComponent(componentsRoot, 'atoms', 'RibbonButton')).rejects.toMatchObject({
      code: 'EEXIST',
    });
    expect(await directoryContents(componentPath)).toEqual(before);
    expect(await readFile(barrelPath, 'utf8')).toBe(barrelBefore);
  });

  it.each(['../Button', 'button', 'Ribbon-Button', 'Ribbon Button', 'A'.repeat(81)])(
    'rejects unsafe or non-PascalCase component name %j',
    (name) => {
      expect(() => {
        validateComponentName(name);
      }).toThrow('PascalCase identifier');
    },
  );

  it('rejects unknown atomic levels', () => {
    expect(() => {
      validateAtomicLevel('../pages');
    }).toThrow('Atomic level must be one of');
  });
});

describe('component policy checks', () => {
  it.each([
    {
      code: 'component.file.missing',
      mutate: async (componentPath: string) =>
        unlink(path.join(componentPath, 'RibbonButton.test.tsx')),
    },
    {
      code: 'component.theme.boundary',
      mutate: async (componentPath: string) =>
        writeFile(
          path.join(componentPath, 'RibbonButton.tsx'),
          'export function RibbonButton() { return null; }\n',
        ),
    },
    {
      code: 'component.theme.token',
      mutate: async (componentPath: string) =>
        writeFile(path.join(componentPath, 'RibbonButton.css'), '.button { color: #fff; }\n'),
    },
    {
      code: 'component.types.boundary',
      mutate: async (componentPath: string) =>
        writeFile(
          path.join(componentPath, 'RibbonButton.types.ts'),
          'export interface RibbonButtonProps {}\n',
        ),
    },
    {
      code: 'component.barrel.local',
      mutate: async (componentPath: string) =>
        writeFile(
          path.join(componentPath, 'index.ts'),
          "export { RibbonButton } from './RibbonButton';\n",
        ),
    },
    {
      code: 'component.storybook.documentation',
      mutate: async (componentPath: string) =>
        writeFile(path.join(componentPath, 'RibbonButton.stories.tsx'), 'export default {};\n'),
    },
    {
      code: 'component.schema.type-drift',
      mutate: async (componentPath: string) =>
        writeFile(path.join(componentPath, 'RibbonButton.schema.types.ts'), '// stale\n'),
    },
  ])('reports $code', async ({ code, mutate }) => {
    const componentPath = await scaffoldButton();
    await mutate(componentPath);

    const issues = await checkComponentPolicy(componentsRoot, publicBarrelPath);
    expect(issues.map((entry) => entry.code)).toContain(code);
  });

  it('reports schema governance and missing property descriptions', async () => {
    const componentPath = await scaffoldButton();
    const schemaPath = path.join(componentPath, 'RibbonButton.schema.json');
    const schema = JSON.parse(await readFile(schemaPath, 'utf8')) as Record<string, unknown>;
    schema['$id'] = 'urn:wrong';
    schema['properties'] = { id: { type: 'string' } };
    await writeFile(schemaPath, `${JSON.stringify(schema, undefined, 2)}\n`, 'utf8');

    const codes = (await checkComponentPolicy(componentsRoot, publicBarrelPath)).map(
      ({ code }) => code,
    );
    expect(codes).toContain('component.schema.governance');
    expect(codes).toContain('component.schema.property-description');
  });

  it('reports level, level-barrel, root-barrel, and package-barrel publication failures', async () => {
    const componentPath = await scaffoldButton();
    await writeFile(path.join(componentsRoot, 'atoms', 'index.ts'), 'export {};\n', 'utf8');
    await writeFile(path.join(componentsRoot, 'index.ts'), 'export {};\n', 'utf8');
    await writeFile(publicBarrelPath, 'export {};\n', 'utf8');
    await rm(path.join(componentsRoot, 'templates'), { recursive: true });
    expect(componentPath).toContain('RibbonButton');

    const codes = (await checkComponentPolicy(componentsRoot, publicBarrelPath)).map(
      ({ code }) => code,
    );
    expect(codes).toContain('component.barrel.level');
    expect(codes).toContain('component.barrel.root');
    expect(codes).toContain('component.barrel.public');
    expect(codes).toContain('component.level.missing');
  });

  it('reports invalid component directory names and malformed schema JSON', async () => {
    const componentPath = await scaffoldButton();
    await writeFile(path.join(componentPath, 'RibbonButton.schema.json'), '{', 'utf8');
    const invalidPath = path.join(componentsRoot, 'atoms', '..unsafe');
    await mkdir(invalidPath);

    const codes = (await checkComponentPolicy(componentsRoot, publicBarrelPath)).map(
      ({ code }) => code,
    );
    expect(codes).toContain('component.schema.invalid-json');
    expect(codes).toContain('component.name.invalid');
  });
});
