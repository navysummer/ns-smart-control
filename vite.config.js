import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// vite.config.js 用于 uni-app x 多端 vite 构建
// 开发/生产构建：npm run dev:h5 / npm run build:h5
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/uni.scss";`
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: false
  },
  build: {
    outDir: 'dist/build/h5',
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  }
})
