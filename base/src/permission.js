/*
 * @Author: your name
 * @Date: 2021-07-09 14:48:54
 * @LastEditTime: 2021-12-13 10:32:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \data-management-system\src\permission.js
 */

import router from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
import actions from '@/micros/actions'
import Cookies from 'js-cookie'
import { loadMicroApp } from 'qiankun';
import i18n from './lang'
import axios from 'axios'

let activeApp = ''
let MicroApp;

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect','/SystemSelection'] // no redirect whitelist
const otherList = ['/forget/password','/forget/emil']

router.beforeEach(async(to, from, next) => {
  actions.setGlobalState({url:to.path});
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  const hasToken = 'Admin-Token'
  const isToken = Cookies.get('Token')

  await axios.get(`/langs/Menu/zh.json`).then(res=>{
    i18n.mergeLocaleMessage('zh', res.data)
  })
  await axios.get(`/langs/Menu/en.json`).then(res=>{
    i18n.mergeLocaleMessage('en', res.data)
  })
  await axios.get(`/langs/Menu/jp.json`).then(res=>{
    i18n.mergeLocaleMessage('jp', res.data)
  })

  await axios.get(`/langs/common/zh.json`).then(res=>{
    i18n.mergeLocaleMessage('zh', res.data)
  })
  await axios.get(`/langs/common/en.json`).then(res=>{
    i18n.mergeLocaleMessage('en', res.data)
  })
  await axios.get(`/langs/common/jp.json`).then(res=>{
    i18n.mergeLocaleMessage('jp', res.data)
  })

  if (hasToken && isToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      //判断是否获取到权限
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles && isToken) {
        let isMountApp = false
        store.getters.microApp.forEach(async item => {
          if(item.name != 'base'){
            for(let i=0;i<item.activeRule.length;i++){
              if(to.path.indexOf(item.activeRule[i]) !== -1 ){
                if(activeApp == item.activeRule[i]){
                  next()
                  isMountApp = true
                }else{
                  if(activeApp !== ''){
                    await MicroApp.unmount();
                  }
                  try{
                    MicroApp = await loadMicroApp(item)
                    next()
                    activeApp = item.activeRule[i]
                    isMountApp = true
                  }catch(err){
                    next('/404')
                  }
                }
              }
            }
          }
          if(!isMountApp){
            next()
          }
        });
      } else {
        try {
          // 兼容本地调试，否则会白屏
          if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // 在非本地地址上执行特定代码逻辑
            // 线上本地打开注释都会白屏
            // await store.dispatch('icons/getIcons')
            // await store.dispatch('icons/getTags')
          }
          await store.dispatch('operation/getInfo')
          const systemId = Cookies.get('systemId')
          //获取组件信息
          // await store.dispatch('operation/getCommandInfo')
          // 获取用户信息
          const asyncRoutes = await store.dispatch('operation/getConfigure_sql', systemId)
          // 权限筛选动态添加路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', asyncRoutes)
          // router.matcher = new Router().matcher
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          // 清除token 并返回至 login页
          next(`/login`)
          NProgress.done()
        }
      }
    }
  } else {
    /* 没有token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 是否在免费白名单
      next()
    } else {
      //匹配 otherList 匹配成功可进入，匹配不成功进入login界面
      if(otherList.includes(to.path)){
        next()
        NProgress.done()
      }else{
        // 其他没有访问权限的页面将被重定向到登录页面
        next(`/login`)
        NProgress.done()
      }
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()

})
