import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      // Proxy all /api/* requests to inoptics.in to bypass CORS / 403 in dev
      '/api': {
        target: 'https://inoptics.in',
        changeOrigin: true,
        secure: true,
        // Forward production-like Origin/Referer so server doesn't 403 us
        headers: {
          Origin:  'https://inoptics.in',
          Referer: 'https://inoptics.in/',
        },
      },
    },
  },
})
