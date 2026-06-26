import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const packageJson = require("./package.json")

const externalPackages = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]

function isExternal(id: string) {
  if (id.endsWith(".css")) {
    return false
  }

  return externalPackages.some(
    (packageName) => id === packageName || id.startsWith(`${packageName}/`)
  )
}

function toGlobalName(id: string) {
  if (id === "react") return "React"
  if (id === "react-dom") return "ReactDOM"
  if (id === "react/jsx-runtime") return "jsxRuntime"

  return id
    .replace(/^@/, "")
    .replace(/[/-]+(\w)/g, (_, char: string) => char.toUpperCase())
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "OmniboxEditor",
      fileName: "omnibox-editor",
    },
    rollupOptions: {
      external: isExternal,
      output: {
        globals: toGlobalName,
      },
    },
  },
})
