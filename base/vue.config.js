'use strict'
const path = require('path')
const fs =  require('fs')
const defaultSettings = require('./src/settings.js')
require('events').EventEmitter.defaultMaxListeners = 0
const packageName = require('./package.json').name;
function resolve(dir) {
  return path.join(__dirname, dir)
}
var webpack = require('webpack');
const { date } = require('jszip/lib/defaults')

const name = defaultSettings.title || 'LiangDao Data Management System' // page title
// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following method:
// port = 9527 npm run dev OR npm run dev --port = 9527
const port = process.env.port || process.env.npm_config_port || 1024 // dev port
const time = new Date()
const year = time.getFullYear()
const month = time.getMonth() + 1 < 10 ? "0" + (time.getMonth() + 1) : time.getMonth() + 1;
const day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();

const version = `${year}.${month}${day}.${new Date().getTime()}`
// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  // eslint代码检查
  // lintOnSave: process.env.NODE_ENV === 'development',
  lintOnSave: false,
  productionSourceMap: false,
  runtimeCompiler: true,
  devServer: {
    disableHostCheck:true,
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // airflow.ld.10.86.14.200.sslip.io
    // ca.dms.ld.10.86.14.200.sslip.io
    // keycloak.ld.10.86.14.200.sslip.io
    proxy: {
      '/api': {
        //日报管理系统
        // target: 'http://daily-report.dms.liangdao.ai.10.86.14.200.nip.io',
        //数据解决方案

        // 长安
        // target: 'http://ca.dms.ld.10.86.14.200.sslip.io',

        // 测讯
        // target: 'http://cx.dms.ld.10.86.14.200.nip.io',
        // 测讯 jf
        // target: 'http://cx.dms.ld-jf.10.86.14.200.nip.io',
        
        // 标注
        target: 'http://cx.dms.ld-label.10.86.14.200.nip.io',
        // target: 'http://cx.dms.ld-base.10.86.14.200.nip.io',

        // alt+kpi
        // target: 'http://cx.dms.ld-altkpi.10.86.14.200.nip.io',

        // target: 'http://ca.dms.10.86.46.254.nip.io',
        //zhulu.dms
        // target: "http://zhulu.dms.liangdao.ai.10.86.14.200.nip.io",
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/api':'/api'
        }
      },
      '/icon': {
        target: 'http://dms.10.86.14.200.nip.io',
        // target: 'http://ca.dms.ld.10.86.14.200.sslip.io',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/icon':'/icon'
        }
      },
      '/oss': {
        // target: 'http://ca.dms.ld.10.86.14.200.sslip.io',
        target: 'http://cx.dms.ld-jf.10.86.14.200.nip.io',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/oss':'/oss'
        }
      },
      // // ldp错误详情图片上传接口
      // '/upload/': {
      //   // 接口
      //   target: "http://zhulu.dms.liangdao.ai.10.86.14.200.nip.io",
      //   changeOrigin: true,
      //   ws: true,
      //   pathRewrite:{
      //     '^/upload':'/upload'
      //   }
      // },
      '/upload':{
        target: 'http://daily-report.dms.liangdao.ai.10.86.14.200.nip.io',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/upload':'/upload'
        }
      },
      '/micro_frontend': {
        target: 'http://10.86.24.128:9527/ld_front',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/micro_frontend':'/micro_frontend'
        }
      },
      '/auth': {
        target: 'http://keycloak.liangdao.ai.10.86.14.200.nip.io',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/auth':'/auth'
        }
      },
      '/langs': {
        target: 'http://dms.10.86.14.200.nip.io',
        changeOrigin: true,
        ws: true,
        pathRewrite:{
          '^/langs':'/langs'
        }
      }
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    // name: name,
    output: {
      // filename: 'app.js',
      library: `${packageName}`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${packageName}`,
    },
    plugins: [
      new webpack.ProvidePlugin({
        $:"jquery",
        jQuery:"jquery",
        "windows.jQuery":"jquery"
      }),
      function() {
        // 修改package.json中的版本号
        this.plugin('done', function() {
          const pkgPath = path.join(__dirname, './package.json');
          let pkg = fs.readFileSync(pkgPath);
          pkg = JSON.parse(pkg);
          // pkg.version = `${version}`;
          // fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        });
      },

      new webpack.DefinePlugin({
        'process.env.MY_VERSION': JSON.stringify(require('./package.json').version)
        // 项目中使用 process.env.MY_VERSION 输出
      })
    ],
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        '@': resolve('src')
      }
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: "javascript/auto"
        },
      ]
    }
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()

    config
      // https://webpack.js.org/configuration/devtool/#development
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()
          config
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  }
}
