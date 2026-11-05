import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: true,
    port: 8081,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'study-guide': ['./src/components/StudyGuide.jsx'],
          'catalogs': ['./src/components/PictogramCatalog.jsx', './src/components/ToolCatalog.jsx'],
        }
      }
    }
  }
})
