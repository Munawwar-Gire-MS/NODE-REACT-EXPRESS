import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { SERVER_PORT } from './server/config'

// https://vite.dev/config/
export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
      },
    }
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
})
