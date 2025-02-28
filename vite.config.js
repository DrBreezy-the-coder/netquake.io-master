import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist/app',
    commonjsOptions: { include: [] },
    
  },
  optimizeDeps: {
    disabled: false,
  },
  preview: {
    port: 8081,
    proxy: {
      // string shorthand
      '/api': 'https://www.netquake.io',
      // with RegEx
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },
    }
  },
  server: {
    port: 8081,
    host: '0.0.0.0',
    proxy: {
      // string shorthand
      '/api': 'https://www.netquake.io',
      // with RegEx
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },
    }
  }
})