import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import qiankun from 'vite-plugin-qiankun'
const packageName = require('./package.json').name;
const useDevMode = true
// https://vitejs.dev/config/
export default ({ command, mode }: any): any => {
  if (!command) return
  const root = process.cwd()
  const env = loadEnv(mode, root)
  return {
    // base: env.VITE_PUBLIC_PATH,
    base: `/apps/loggerfe`,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
         'vue': 'vue/dist/vue.esm-bundler.js'
      },
    },
    css: {
      // css 预处理器
      preprocessorOptions: {
        // 引入 全局.scss, 最后别忘了加上 ;
        scss: {
          additionalData: `@use "@/styles/element/index.scss" as *;`,
          // additionalData: '@import "@/styles/element/index.scss";',
        },
      },
    },
    plugins: [
      vue(),
      qiankun('loggerfe', {useDevMode}),
      AutoImport({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      }),
      // ElementPlus({
      // useSource: true,
      // }),
    ],
    output: {
      library: `${packageName}`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      // jsonpFunction: `webpackJsonp_${packageName}`,
      chunkLoadingGlobal: `webpackJsonp_${packageName}`
    },
    build: {
      // target: 'es2020',
      target: ['edge90', 'chrome90', 'firefox90', 'safari15'],
      outDir: 'ld_logger_fe', // 根据项目实际情况进行配置
      sourcemap: true,
    },
    server: {
      host: '0.0.0.0',
      port: 8686,
      proxy: {
        '/api': {
          target: 'http://10.86.24.56:8100',
          ws: true,
          changeOrigin: true,
        },
        '/ws': {
          target: 'ws://10.86.24.56:8100',
          ws: true,
          changeOrigin: true,
        },
        '^/element-plus': {
          target: 'https://unpkg.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/element-plus/, ''),
        }
      },
    },
  }
}
