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
