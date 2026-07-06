import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api/* requests to the Express backend so the React app can call
    // fetch('/api/habits') without CORS issues during development.
    // Both servers must be running: npm run dev (frontend) + npm run dev (backend).
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
