import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../packages/omnibox-editor/src'),
      'cvnert-editor': path.resolve(
        __dirname,
        '../../packages/omnibox-editor/src/index.ts'
      ),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('@tiptap') || id.includes('prosemirror')) {
            return 'editor-core'
          }

          if (
            id.includes('@radix-ui') ||
            id.includes('@ariakit') ||
            id.includes('@floating-ui') ||
            id.includes('@base-ui')
          ) {
            return 'editor-ui'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          return 'vendor'
        },
      },
    },
  },
})
