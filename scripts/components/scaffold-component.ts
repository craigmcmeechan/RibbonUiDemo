import path from 'node:path';
import process from 'node:process';

import { scaffoldComponent, validateAtomicLevel, validateComponentName } from './component-tooling';

function optionValue(arguments_: readonly string[], option: string): string {
  const index = arguments_.indexOf(option);
  const value = index === -1 ? undefined : arguments_[index + 1];
  if (value === undefined) throw new Error(`Missing required ${option} value.`);
  return value;
}

const arguments_ = process.argv.slice(2);
if (arguments_.length !== 5 || arguments_.at(-1) !== '--write') {
  throw new Error(
    'Usage: pnpm component:scaffold --level <atomic-level> --name <PascalCase> --write',
  );
}
const level = optionValue(arguments_, '--level');
const name = optionValue(arguments_, '--name');
validateAtomicLevel(level);
validateComponentName(name);
const files = await scaffoldComponent(path.resolve('packages/ui/src/components'), level, name);
process.stdout.write(
  `Scaffolded ${name}:\n${files.map((file) => `- ${path.relative(process.cwd(), file)}`).join('\n')}\n`,
);
