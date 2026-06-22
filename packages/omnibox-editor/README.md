# cvnert-editor

A Tiptap-powered block editor kit for React.

## Install

```bash
npm install cvnert-editor
```

## Usage

```tsx
import { CvnertEditor } from "cvnert-editor"
import "cvnert-editor/style.css"

export function App() {
  return (
    <CvnertEditor
      placeholder="Start writing..."
      onUpdate={({ json, html }) => {
        console.log(json, html)
      }}
    />
  )
}
```

## Image Upload

```tsx
import { CvnertEditor, type UploadFunction } from "cvnert-editor"
import "cvnert-editor/style.css"

const uploadImage: UploadFunction = async (file, onProgress) => {
  onProgress?.({ progress: 100 })
  return URL.createObjectURL(file)
}

export function App() {
  return <CvnertEditor imageUpload={uploadImage} />
}
```

## Styling

The package ships compiled CSS at:

```ts
import "cvnert-editor/style.css"
```

The editor styles are built through Tailwind CSS v4 layers and do not require Sass.

## License

MIT

pnpm --filter cvnert-editor typecheck

在项目根目录 /Users/cvnert/Desktop/aaaa/editor 运行这一
组：

pnpm typecheck
pnpm --filter cvnert-editor test
pnpm --filter cvnert-editor build

然后进入包目录发布：

cd packages/omnibox-editor
npm whoami --registry=https://registry.npmjs.org/
npm publish --registry=https://registry.npmjs.org/ --access public

发布后验证：

npm view cvnert-editor version --registry=https://
registry.npmjs.org/
