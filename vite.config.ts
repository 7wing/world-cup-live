import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('react-query') || id.includes('tanstack')) return 'vendor-query'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('socket.io-client')) return 'vendor-socket'
            if (id.includes('zustand')) return 'vendor-state'
            return 'vendor'
          }
        },
      },
    },
  },
})