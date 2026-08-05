# Package-local legacy assets

The JavaScript files in this directory are deterministic copies of the exact package versions pinned in the root `package.json`:

- `legacy-react` (`react@18.3.1`)
- `legacy-react-dom` (`react-dom@18.3.1`)
- `@babel/standalone@7.29.0`

Run `pnpm legacy:assets:sync` after an intentional dependency upgrade. `pnpm legacy:assets:check` verifies the installed sources against reviewed SHA-384 values and verifies the deterministic local output byte-for-byte. The unused Babel source-map trailer is removed because its multi-megabyte development map is not shipped. Do not edit the generated JavaScript files directly; their upstream license notices are retained in each copied file.
