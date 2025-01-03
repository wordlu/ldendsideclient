const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const packageName = require('./package.json').name;
const port = process.env.port || process.env.npm_config_port || 9081 // dev port

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: `/apps/loggerfe`,
  lintOnSave:false,
  devServer:{
    port:8083,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    open: true,
    proxy: {
      '/api/tagging': {
        target: 'http://loggertrash',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
        // onProxyReq: (proxyReq, req, res) => {
        //   console.log(`[Proxy Request] ${req.method} ${req.originalUrl} -> ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);
        // },
        // onProxyRes: (proxyRes, req, res) => {
        //   console.log(`[Proxy Response] Status: ${proxyRes.statusCode} for ${req.originalUrl}`);
        // },
      },
      '/api': {
        target: 'http://loggertrash',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
    client:{
      overlay:false
    }
  },
  configureWebpack:{
    output: {
      library: `${packageName}`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      // jsonpFunction: `webpackJsonp_${packageName}`,
      chunkLoadingGlobal: `webpackJsonp_${packageName}`
    }
  },
  chainWebpack: config => {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(path.resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(path.resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
})
