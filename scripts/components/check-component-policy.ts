import path from 'node:path';
import process from 'node:process';

import { checkComponentPolicy } from './component-tooling';

if (process.argv.length !== 2) throw new Error('component:check does not accept arguments.');
const root = path.resolve('packages/ui/src/components');
const issues = await checkComponentPolicy(root, path.resolve('packages/ui/src/index.ts'));
if (issues.length > 0) {
  throw new Error(
    `Component policy violations:\n${issues.map(({ code, message, path: issuePath }) => `- [${code}] ${issuePath}: ${message}`).join('\n')}`,
  );
}
process.stdout.write(
  'Verified component packaging, schema, theme, barrel, and Storybook policies.\n',
);
