# cvnert-editor workspace

This repository is a pnpm workspace for the `cvnert-editor` npm package and its local playground.

`cvnert-editor` is a React block editor package built on Tiptap. The package source lives in `packages/omnibox-editor`, and the preview app lives in `apps/playground`.

## Structure

```text
apps/
  playground/          Vite app for local preview and integration testing
packages/
  omnibox-editor/      Published npm package: cvnert-editor
scripts/               Build helper scripts
```

## Requirements

- Node.js
- pnpm

Install dependencies from the repository root:

```bash
pnpm install
```

## Preview

Start the local playground:

```bash
pnpm dev
```

Open:

```text
http://127.0.0.1:4173
```

The playground imports `cvnert-editor` through the workspace dependency, so it behaves like a consuming React app while still using the local package code.

## Local Development

Use the playground while editing the package:

```bash
pnpm dev
```

Then edit package source under:

```text
packages/omnibox-editor/src
```

The playground depends on the package with:

```json
"cvnert-editor": "workspace:*"
```

That means local package changes are used by the playground without publishing to npm.

Before committing or publishing, run:

```bash
pnpm typecheck
pnpm build
```

For a focused package-only loop, run:

```bash
pnpm --filter cvnert-editor typecheck
pnpm --filter cvnert-editor build
```

If the playground needs a production build check, run:

```bash
pnpm --filter playground build
```

## Build

Build every workspace package and app:

```bash
pnpm build
```

Build only the npm package:

```bash
pnpm --filter cvnert-editor build
```

The package build outputs compiled files to:

```text
packages/omnibox-editor/dist
```

## Type Check

Run TypeScript checks for all workspaces:

```bash
pnpm typecheck
```

Check only the package:

```bash
pnpm --filter cvnert-editor typecheck
```

## Package Usage

Install from npm:

```bash
npm install cvnert-editor
```

Use it in a React app:

```tsx
import { CvnertEditor } from "cvnert-editor"
import "cvnert-editor/style.css"

export function App() {
  return <CvnertEditor placeholder="Start writing..." />
}
```

More package-level usage notes are in `packages/omnibox-editor/README.md`.

## Local Pack

Create a local tarball for testing package installation:

```bash
pnpm --filter cvnert-editor pack:local
```

The tarball is written under:

```text
packages/omnibox-editor/dist-pack
```

Install that tarball in another local project when you want to test the exact package artifact before publishing.

## Publishing

The publishable package is:

```text
packages/omnibox-editor
```

Before publishing, update the package version in:

```text
packages/omnibox-editor/package.json
```

Then run the release checks from the repository root:

```bash
pnpm typecheck
pnpm build
```

Check the files that npm will publish:

```bash
cd packages/omnibox-editor
npm publish --dry-run
```

If the dry run looks correct, publish:

```bash
npm publish --access public
```

The package uses `publishConfig.access = public`, but passing `--access public` keeps the command explicit.

If npm authentication is not configured on the machine, log in first:

```bash
npm login
npm whoami
```

Do not commit npm tokens or registry credentials into README files, examples, or source code. Keep authentication in your local npm configuration or CI secret store.

## License

MIT
