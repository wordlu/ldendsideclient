/*
 * @Author: your name
 * @Date: 2021-07-09 14:48:54
 * @LastEditTime: 2022-01-24 11:32:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\main.js
 */
import Vue from 'vue'
import Cookies from 'js-cookie'
import axios from 'axios';

// import start from '@/micros'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'

import './styles/element-variables.scss'

import '@/styles/index.scss' // global css

import moment from 'moment'

import './public-path';
import Base64 from '@/Base64/Base64'

import App from './App'
import store from './store'
import router from './router'

import i18n from './lang' // internationalization
import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log
import './utils/elDialog'

import * as filters from './filters' // global filters

import * as echarts from 'echarts'

import vueTree from 'vue-tree-jf'

import fuzzysearch from './fuzzysearch/fuzzysearch.js'
import { api } from '@/jsonapi/api'
import systemApi from '@/jsonapi/system'
// import Keycloak from '@dsb-norge/vue-keycloak-js';

import keycloak from '@/utils/setKeycloak'

Vue.prototype.$keycloak = keycloak;

// 视频播放组件
import VideoPlayer from 'vue-video-player'
require('video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')
Vue.use(VideoPlayer)

axios.defaults.withCredentials = false;
Vue.prototype.$axios = axios;

const apiModules = new api('common')
Vue.use(apiModules)
Vue.use(systemApi)

Vue.prototype.$api = apiModules;
Vue.prototype.$systemApi = systemApi;
Vue.prototype.$icons = []

Vue.prototype.$Base64 = Base64;
Vue.prototype.$moment = moment;
Vue.prototype.$echarts = echarts;

Vue.use(vueTree)
Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(fuzzysearch);

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

// start()

Vue.config.productionTip = false

let instance = null
function render(props) {
  instance = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
  }).$mount('#app'); // 这里是挂载到自己的html中  基座会拿到这个挂载后的html 将其插入进去
}

render();