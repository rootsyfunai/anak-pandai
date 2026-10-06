import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Hashed filenames make long-lived immutable caching safe, which is the
    // single biggest lever on Railway egress cost: a cached asset is free to
    // re-serve. Split vendor code out so app changes don't bust the vendor
    // cache for returning users.
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react'
          }
        },
      },
    },
    // Warn earlier than the 500KB default so bundle growth is caught in CI
    // rather than discovered on the Railway bill.
    chunkSizeWarningLimit: 250,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
