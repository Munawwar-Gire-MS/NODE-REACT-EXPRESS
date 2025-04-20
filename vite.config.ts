import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { SERVER_PORT } from './server/config';

// https://vite.dev/config/
export default defineConfig({
  root: './client',
  build: {
    outDir: '../dist/client',
    emptyOutDir: true,
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || `http://localhost:${SERVER_PORT}`, // Use the API URL from .env or fallback to local
        changeOrigin: true,
      },
    },
    allowedHosts: [
      'node-react-expres2.azurewebsites.net',  
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
});
