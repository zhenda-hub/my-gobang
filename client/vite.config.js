import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://game-server:3000',
        changeOrigin: true
      }
    },
    fs: {
      strict: true
    }
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  optimizeDeps: {
    force: true
  }
}) 