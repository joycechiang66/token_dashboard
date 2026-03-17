import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'
import { vitePluginManusRuntime } from 'vite-plugin-manus-runtime'

const PROJECT_ROOT = import.meta.dirname

export default defineConfig({
  plugins: [vue(), vitePluginManusRuntime()],
  resolve: {
    alias: {
      '@': path.resolve(PROJECT_ROOT, 'src'),
    },
  },

  envDir: PROJECT_ROOT,
  root: PROJECT_ROOT,
  base: '/token_dashboard/',
  build: {
    outDir: path.resolve(PROJECT_ROOT, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true,
    allowedHosts: [
      '.manuspre.computer',
      '.manus.computer',
      '.manus-asia.computer',
      '.manuscomputer.ai',
      '.manusvm.computer',
      'localhost',
      '127.0.0.1',
    ],
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
})
