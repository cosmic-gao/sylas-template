import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { viteReactCompiler } from 'sylas/route-vite-compiler/react'
import { viteReactLayoutCompiler } from 'sylas/layout-vite-compiler/react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    viteReactCompiler({
      kebabKeepDigits: true,
      pageRoots: ['pages', 'app-pages'],
      routerOptions: {
        defaultTitle: 'Sylas Template',
      },
    }),
    viteReactLayoutCompiler({
      layoutPatterns: ['./layouts/**/*.{tsx,jsx}'],
      rootId: 'root',
      strictMode: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

