import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

const assets = [
  {
    destination: 'legacy-editor-claude-design-template/vendor/react.development.js',
    integrity: 'sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L',
    source: 'node_modules/legacy-react/umd/react.development.js',
  },
  {
    destination: 'legacy-editor-claude-design-template/vendor/react-dom.development.js',
    integrity: 'sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm',
    source: 'node_modules/legacy-react-dom/umd/react-dom.development.js',
  },
  {
    destination: 'legacy-editor-claude-design-template/vendor/babel.min.js',
    integrity: 'sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y',
    source: 'node_modules/@babel/standalone/babel.min.js',
    stripSourceMapReference: true,
  },
] as const;

type Mode = 'check' | 'write';

function parseMode(arguments_: readonly string[]): Mode {
  if (arguments_.length !== 1 || !['--check', '--write'].includes(arguments_[0] ?? '')) {
    throw new Error('Expected exactly one mode: --check or --write');
  }

  return arguments_[0] === '--check' ? 'check' : 'write';
}

function integrity(content: Uint8Array): string {
  return `sha384-${createHash('sha384').update(content).digest('base64')}`;
}

function localContent(sourceContent: Buffer, asset: (typeof assets)[number]): Buffer {
  if (!('stripSourceMapReference' in asset)) {
    return sourceContent;
  }

  return Buffer.from(
    sourceContent
      .toString('utf8')
      .replace(/\r?\n\/\/# sourceMappingURL=babel\.min\.js\.map\s*$/u, '\n'),
  );
}

async function run(mode: Mode): Promise<void> {
  const driftedAssets: string[] = [];

  for (const asset of assets) {
    const sourcePath = path.join(repositoryRoot, asset.source);
    const destinationPath = path.join(repositoryRoot, asset.destination);
    const sourceContent = await readFile(sourcePath);
    const sourceIntegrity = integrity(sourceContent);

    if (sourceIntegrity !== asset.integrity) {
      throw new Error(
        `Installed package asset does not match its reviewed integrity: ${asset.source}`,
      );
    }
    const expectedContent = localContent(sourceContent, asset);

    if (mode === 'write') {
      await mkdir(path.dirname(destinationPath), { recursive: true });
      await writeFile(destinationPath, expectedContent);
      process.stdout.write(`Synchronized ${asset.destination}\n`);
      continue;
    }

    const destinationContent = await readFile(destinationPath).catch(() => undefined);
    if (destinationContent === undefined || !expectedContent.equals(destinationContent)) {
      driftedAssets.push(asset.destination);
    }
  }

  if (driftedAssets.length > 0) {
    throw new Error(
      `Legacy package assets are missing or stale:\n${driftedAssets.map((asset) => `- ${asset}`).join('\n')}\nRun pnpm legacy:assets:sync.`,
    );
  }

  process.stdout.write(`Verified ${String(assets.length)} package-local legacy asset(s).\n`);
}

await run(parseMode(process.argv.slice(2)));
