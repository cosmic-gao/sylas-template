import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { viteReactCompiler } from '@sylas/route-vite-compiler/react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteReactCompiler({
      pageRoots: ['pages', 'app-pages'],
      routerOptions: {
        defaultTitle: 'Sylas Template',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

