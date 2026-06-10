import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api to Express only during `vite dev`. In production the
    // frontend is served by Express itself, so no proxy is needed.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
