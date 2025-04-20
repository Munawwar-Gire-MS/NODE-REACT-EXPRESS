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
    // Condition to allow requests in development (no restrictions on allowedHosts)
    allowedHosts: process.env.NODE_ENV === 'production'
      ? [process.env.VITE_ALLOWED_HOSTS] // Production hosts, from environment variables
      : [],  // Empty for development (allow all hosts)
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
