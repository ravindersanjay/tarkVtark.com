import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Ensure public directory is used
  build: {
    outDir: 'dist',
    // Ensure _routes.json and _redirects are copied to dist root
    // (Vite copies public/ contents to dist/ root automatically)
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true, // Fail if port is already in use
    host: true, // Listen on all addresses
    // Enable SPA fallback - all routes serve index.html
    // This allows clean URLs like /hindu_vs_muslim to work
    historyApiFallback: true
  }
})
