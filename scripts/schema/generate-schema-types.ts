import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { compileFromFile } from 'json-schema-to-typescript';

const schemaRoots = ['packages/ui/src', 'test/schema'];
const generatedSuffix = '.schema.types.ts';

type Mode = 'check' | 'write';

function parseMode(arguments_: readonly string[]): Mode {
  if (arguments_.length !== 1 || !['--check', '--write'].includes(arguments_[0] ?? '')) {
    throw new Error('Expected exactly one mode: --check or --write');
  }

  return arguments_[0] === '--check' ? 'check' : 'write';
}

async function findSchemas(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch((error: unknown) => {
    const fileSystemError = error as NodeJS.ErrnoException;
    if (fileSystemError.code === 'ENOENT') {
      return [];
    }

    throw error;
  });
  const nestedSchemas = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findSchemas(entryPath);
      }

      return entry.isFile() && entry.name.endsWith('.schema.json') ? [entryPath] : [];
    }),
  );

  return nestedSchemas.flat();
}

function generatedPath(schemaPath: string): string {
  return schemaPath.replace(/\.schema\.json$/u, generatedSuffix);
}

async function generate(schemaPath: string): Promise<string> {
  const generated = await compileFromFile(schemaPath, {
    $refOptions: {
      resolve: {
        http: false,
      },
    },
    additionalProperties: false,
    bannerComment:
      '/* eslint-disable */\n/** Generated from the adjacent JSON Schema. Do not edit directly. */',
    cwd: path.dirname(schemaPath),
    declareExternallyReferenced: true,
    strictIndexSignatures: true,
    style: {
      printWidth: 100,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'all',
      useTabs: false,
    },
    unknownAny: true,
    unreachableDefinitions: false,
  });

  return generated.replaceAll('\r\n', '\n');
}

async function run(mode: Mode): Promise<void> {
  const schemaPaths = (
    await Promise.all(schemaRoots.map(async (root) => findSchemas(path.resolve(root))))
  )
    .flat()
    .sort();

  if (schemaPaths.length === 0) {
    throw new Error(`No component schemas found under: ${schemaRoots.join(', ')}`);
  }

  const driftedFiles: string[] = [];
  for (const schemaPath of schemaPaths) {
    const outputPath = generatedPath(schemaPath);
    const expected = await generate(schemaPath);

    if (mode === 'write') {
      await writeFile(outputPath, expected, 'utf8');
      process.stdout.write(`Generated ${path.relative(process.cwd(), outputPath)}\n`);
      continue;
    }

    const actual = await readFile(outputPath, 'utf8').catch(() => undefined);
    if (actual !== expected) {
      driftedFiles.push(path.relative(process.cwd(), outputPath));
    }
  }

  if (driftedFiles.length > 0) {
    throw new Error(
      `Generated schema types are missing or stale:\n${driftedFiles.map((file) => `- ${file}`).join('\n')}\nRun pnpm schema:generate.`,
    );
  }

  process.stdout.write(`Verified ${String(schemaPaths.length)} generated schema type file(s).\n`);
}

await run(parseMode(process.argv.slice(2)));
