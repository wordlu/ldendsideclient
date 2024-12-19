const { defineConfig } = require('@vue/cli-service')
const path = require('path')
const packageName = require('./package.json').name;
const port = process.env.port || process.env.npm_config_port || 9081 // dev port

module.exports = defineConfig({
  transpileDependencies: true,
  // lintOnSave: false,
  publicPath: `/apps/systemanage`,
  lintOnSave:false,
  devServer:{
    port:8083,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    open: true,
    // proxy: {
    //   '/api': {
    //     target: 'http://loggertrash',
    //     ws: true,
    //     pathRewrite: { '^/api': '/api' },
    //     changeOrigin: true,
    //   },
    // },
    proxy: {
    '/api': {
      target: 'http://loggertrash',
      ws: true,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request: ${req.method} ${req.url} -> ${req.url}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`Response status: ${proxyRes.statusCode} for ${req.url}`);
      },
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
    },
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
