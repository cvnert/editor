# omnibox-editor

A Tiptap-powered block editor kit for React.

## Install

```bash
npm install omnibox-editor
```

## Usage

```tsx
import { OmniboxEditor } from "omnibox-editor"
import "omnibox-editor/style.css"

export function App() {
  return (
    <OmniboxEditor
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
import { OmniboxEditor, type UploadFunction } from "omnibox-editor"
import "omnibox-editor/style.css"

const uploadImage: UploadFunction = async (file, onProgress) => {
  onProgress?.({ progress: 100 })
  return URL.createObjectURL(file)
}

export function App() {
  return <OmniboxEditor imageUpload={uploadImage} />
}
```

## Styling

The package ships compiled CSS at:

```ts
import "omnibox-editor/style.css"
```

The editor styles are built through Tailwind CSS v4 layers and do not require Sass.

## License

MIT
