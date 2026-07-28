import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  define: {
    // Build version: prefer VITE_APP_VERSION env var (set in Vercel dashboard),
    // fall back to ISO date so every build has a unique identifier.
    __APP_VERSION__: JSON.stringify(
      process.env.VITE_APP_VERSION ?? new Date().toISOString().slice(0, 10),
    ),
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
