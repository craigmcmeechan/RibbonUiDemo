import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { generatedSchemaTypePath, generateSchemaType } from './schema-type-generation';

const schemaRoots = ['packages/ui/src', 'test/schema'];

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
    const outputPath = generatedSchemaTypePath(schemaPath);
    const expected = await generateSchemaType(schemaPath);

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
