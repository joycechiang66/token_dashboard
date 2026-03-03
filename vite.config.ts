import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = __dirname

export default defineConfig({
  base: '/token_dashboard/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(PROJECT_ROOT, 'src'),
    },
  },

  envDir: PROJECT_ROOT,
  root: PROJECT_ROOT,
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
