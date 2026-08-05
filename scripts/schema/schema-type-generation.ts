import path from 'node:path';

import { compileFromFile } from 'json-schema-to-typescript';

const generatedSuffix = '.schema.types.ts';

export function generatedSchemaTypePath(schemaPath: string): string {
  return schemaPath.replace(/\.schema\.json$/u, generatedSuffix);
}

export async function generateSchemaType(schemaPath: string): Promise<string> {
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
