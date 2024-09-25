import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: `pointcloud`,
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    host: '0.0.0.0',
    port: 5173, // 端口
    proxy: {
      '/api': {
        target: 'http://ca.dms.ld.10.86.14.200.sslip.io', 
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [vue()],
})
