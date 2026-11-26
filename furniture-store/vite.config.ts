/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages serves the app from /Furniture-Store-App/ (npm run deploy uses --mode ghpages).
  // Everywhere else (local dev, Vercel) the app is served from the root.
  base: mode === 'ghpages' ? '/Furniture-Store-App/' : '/',
  plugins: [
    react(),
    legacy()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
}))
