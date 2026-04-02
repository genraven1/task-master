import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // bind to 0.0.0.0 so any LAN device can reach the dev server
    port: 5173,
    proxy: {
      // Forward all /api requests to the Spring Boot backend.
      // The browser only ever contacts the Vite server (same hostname/port),
      // so the app works on any device that can reach the host machine.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
  },
})
