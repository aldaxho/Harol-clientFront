import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // usa el index.html del cliente
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
  },
})