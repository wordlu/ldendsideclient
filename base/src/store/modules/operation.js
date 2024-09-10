import { ssoLogin, login, counters } from '@/api/user'
import { getToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import Cookies from 'js-cookie'
import axios from 'axios';
import jsonApiStore from '@/jsonapi/lib/store'
import { api } from '@/jsonapi/api'
import $systemApi from '@/jsonapi/system'
import $pyQt from '@/pyQt/main'
import Layout1 from '@/layout'
import Layout2 from '@/layouts/layout2'
import Layout3 from '@/layouts/layout3'
import Layout4 from '@/layouts/layout4'
import store from '@/store'
import { Message } from "element-ui";
import i18n from '@/lang'
import Vue from 'vue'
import { error } from 'jquery';
import keycloakInfo from '@/utils/setKeycloak'



const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  menuList:[],
  isNewTask:false,
  counters:[],
  System_id:null,
  webConfigure:{},
  communication:'',
  microApp:[],
  registerMicroApps:[
    /**
     * 临时添加内容
     */
    {
      //ld_cali
      name: "ldcalibration",
      entry: "http://localhost:5173/apps/ldcalibration",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //ld_viz
      name: "ldvizfe",
      entry: "http://localhost:5273/apps/ldvizfe",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //logger
      name: "loggerfe",
      entry: "http://localhost:8686/apps/loggerfe",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //权限管理
      name: "dmsshell",
      entry: "http://localhost:8080/apps/dmsshell",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //算法库
      name: "algorithem",
      entry: "http://localhost:9082/apps/algorithem",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //治理集成
      name: "governance",
      entry: "http://localhost:8083/apps/governance",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      //概览
      name: "landing",
      entry: "http://localhost:9081/apps/landing",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      // 数据存储
      name: "datastore",
      entry: "http://localhost:8094/apps/datastore",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },{
      // 数据存储
      name: "dataasset",
      entry: "http://localhost:8096/apps/dataasset",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
    {
      name: "tagLibrary",
      entry: "http://localhost:8086/apps/tagLibrary",
      container: "#Appmicro",
      activeRule: [],
      props:{}
    },
  ],
  localeData_route_zh:{
    route:{}
  },
  localeData_route_en:{
    route:{}
  },
  communicationInfo:[],//显示隐藏相关
  Layouts:{
    layout1:Layout1,
    layout2:Layout2,
    layout3:Layout3,
    layout4:Layout4,
  }
}

const mutations = {
  SET_MICROAPP: (state, microApp) => {
    state.microApp = microApp
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_MENULIST:(state,menuList)=>{
    state.menuList = menuList
  },
  IS_NEW_TASK:(state,NewTask)=>{
    state.isNewTask = NewTask
  },
  SET_COUNTERS_INFO:(state,counters)=>{
    state.get_counters_info = counters
  },
  SET_SYSTEM_ID:(state,counters)=>{
    state.get_counters_info = counters
  },
  SET_WEB_CONFIGURE:(state,config)=>{
    state.webConfigure = config
  },
  SET_COMMUNICATION:(state,config)=>{
    state.communication = config
  },
  SET_COMMUNICATIONINFO:(state,config)=>{
    state.communicationInfo = config
  },
}

const actions = {
  // 用户登录
  login({ commit }, params) {
    let { account , password , department , systemId } = params
    return new Promise((resolve, reject) => {
      ssoLogin({ 
        // account: account,
        // password:password,
        // department:department
        client_id: keycloakInfo.client_name,
        username: account,
        password: password
      }).then(response => {
        const data = response
        const options = {
          domain: window.server.domain,
          path: "/",
        }
        //标注需要
        // Cookies.set('account', data.account, options)
        // Cookies.set('Token', data.token, options)
        // Cookies.set('roles', data.role_ids.join(','), options)
        // const currentRoles = data.auth_info.resource_access[keycloakInfo.client_name].roles.toString()
        const currentAccess = data.auth_info.resource_access[keycloakInfo.client_name]
        if(!currentAccess){
          store.dispatch('operation/logout').then(() => {
            Message({
              message: '该账号没有该系统的权限',
              type: 'error',
              duration: 2000,
              onClose: () => {location.href = keycloakInfo.logout}
            })
          })
          reject('该账号没有该系统的权限')
        }
        const currentRoles = currentAccess.roles.toString()
        Cookies.set('roles', currentRoles, options)
        Cookies.set('account', data.auth_info.preferred_username, options)
        Cookies.set('Token', data.access_token, options)
        Cookies.set('refresh_token', data.refresh_token, options)
        Cookies.set('systemId', systemId, options)
 
        Cookies.set('account', data.auth_info.preferred_username)
        Cookies.set('Token', data.access_token)
        Cookies.set('refresh_token', data.refresh_token)
        Cookies.set('systemId', systemId)
        Cookies.set('roles', currentRoles)


        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 用户登录
  ssrlogin({ commit }, params) {
    let { code , redirect_uri , systemId } = params
    return new Promise((resolve, reject) => {
      ssoLogin({ 
        code: code,
        redirect_uri:redirect_uri,
        client_id: keycloakInfo.client_name
      }).then(response => {
        const data = response
        const options = {
          domain: window.server.domain,
          path: "/",
        }
        console.log("wodelu: ssologin")

        //标注需要
        // Cookies.set('account', data.account, options)
        // Cookies.set('Token', data.token, options)
        // Cookies.set('roles', data.role_ids.join(','), options)

        // const currentRoles = data.auth_info.resource_access[keycloakInfo.client_name].roles.toString()
        const currentAccess = data.auth_info.resource_access[keycloakInfo.client_name]
        if(!currentAccess){
          store.dispatch('operation/logout').then(() => {
            Message({
              message: '该账号没有该系统的权限',
              type: 'error',
              duration: 2000,
              onClose: () => {location.href = keycloakInfo.logout}
            })
          })
          reject('该账号没有该系统的权限')
        }
        const currentRoles = currentAccess.roles.toString()
        
        Cookies.set('roles', currentRoles, options)
        Cookies.set('account', data.auth_info.preferred_username, options)
        Cookies.set('Token', data.access_token, options)
        Cookies.set('refresh_token', data.refresh_token, options)
        Cookies.set('systemId', systemId, options)
 
        Cookies.set('account', data.auth_info.preferred_username)
        Cookies.set('Token', data.access_token)
        Cookies.set('refresh_token', data.refresh_token)
        Cookies.set('systemId', systemId)

        Cookies.set('roles', currentRoles)
        
        resolve(data)
      }).catch(error => {
        console.log("wodelu:login")
        reject(error)
      })
    })
  },
  pageCounter({ commit }, pageInfo){
    const { pageName, pageUrl } = pageInfo
    return new Promise((resolve, reject) => {
      counters({name:pageName}).then(response=>{
      }).catch(error => {
        reject(error)
      })
    })
  },
  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      commit('SET_ROLES', Cookies.get('roles'))
      resolve(Cookies.get('roles'))
    })
  },
  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      const options = {
        domain: window.server.domain,
        path: "/",
      }
      Cookies.remove('Token',options)
      Cookies.remove('refresh_token',options)
      Cookies.remove('systemId',options)
      Cookies.remove('roles',options)
      Cookies.remove('frontendArray',options)
      Cookies.remove('account',options)

      Cookies.remove('Token')
      Cookies.remove('refresh_token')
      Cookies.remove('systemId')
      Cookies.remove('roles')
      Cookies.remove('frontendArray')
      Cookies.remove('account')
    resolve('logout')
    })
  },
  // 重置登录状态
  resetToken({ commit },refresh_token) {
    return new Promise((resolve, reject) => {
      ssoLogin({ refresh_token: refresh_token }).then(response => {
        console.log("wodelu:refresh_token")
        const data = response
        //获取权限信息存入本地
        localStorage.setItem('roles',JSON.stringify({roles:data.functions}))
        const roles= localStorage.getItem('roles')
        const options = {
          domain: window.server.domain,
          path: "/",
        }
        Cookies.set('name',data.name,options)
        Cookies.set('creater_id',data.creater_id,options)
        //获取token
        Cookies.set('Token', data.access_token,options)
        Cookies.set('update_time',data.update_time,options)
        Cookies.set('refresh_token', data.refresh_token,options)

        Cookies.set('name',data.name)
        Cookies.set('creater_id',data.creater_id)
        //获取token
        Cookies.set('Token', data.access_token)
        Cookies.set('update_time',data.update_time)
        Cookies.set('refresh_token', data.refresh_token)
        //同步到全局变量
        commit('SET_ROLES', JSON.parse(roles))
        commit('SET_TOKEN', data.access_token)
        location.reload()
        resolve(JSON.parse())
      }).catch(error => {
        reject(error)
      })
    })
  },
  // dynamically modify permissions
  changeRoles({ commit, dispatch }) {
    return new Promise(async resolve => {
      await dispatch('resetToken',Cookies.get('refresh_token'))

      const roles = localStorage.getItem('roles')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve('权限重置')
    })
  },
  //获取前端配置
  getConfigure({ commit, dispatch }){
    return new Promise(async (resolve,reject) => {
      axios('/front_end_configure/').then(res=>{
        commit('SET_WEB_CONFIGURE', res.data)
        const options = {
          domain: window.server.domain,
          path: "/",
        }
        Cookies.set('WEB_CONFIGURE',JSON.stringify(res.data),options)
        resolve(res.data)
      }).catch(error => {
        reject(error)
      })
    })
  },
  //获取权限列表
  getActions(){
    return new Promise(async (resolve,reject) => {
      axios({
        url: `http://${window.server.ssoPrefix}/api/access-policy/action`,
        method: 'get',
        headers: {
          'Ld-Project': 'shell',
          'Authorization': Cookies.get('Token'),
        },
      }).then(res=>{
        const frontendArray = res.data.frontend
        if (frontendArray.length > 0) {
          Cookies.remove('shellfrontendArray')
          Cookies.set('shellfrontendArray', frontendArray.toString());
        }
        resolve(res.data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  //获取前端配置
  getConfigure_sql({ commit, dispatch },systemId){
    return new Promise(async (resolve,reject) => {
      // const cookie_name = Cookies.get('roles') ? Cookies.get('roles') : ''
      const cookie_name = 'manager,general'
      const account = Cookies.get('account')
      // $systemApi['findConfig']('client',systemId,['micro_frontend_conf'],cookie_name).then(async res=>{
      $systemApi['findSSOConfig']('client',systemId,['micro_frontend_conf'],cookie_name,keycloakInfo.client_name).then(async res=>{
        const client = res.client;
        const accessRoutes = [];
        const micro_app = res.client.micro_app;
        let setApps=[];
        let special=[];
        let layout;
        for(let key in state.Layouts){
          if(key == client.layout[0].layout_name){
            layout = state.Layouts[key];
          }
        }
        for(let i=0;i<micro_app.length;i++){
          let development;
          let isfind = false;
          setApps[i] = new Object();
          setApps[i].name = micro_app[i].app_name;
          if(process.env.NODE_ENV === 'development'){
            state.registerMicroApps.forEach((item)=>{
              if(item.name == micro_app[i].app_name){
                setApps[i].entry = item.entry;
                development = item;
                isfind = true;
              }
            })
          }else{
            setApps[i].entry = "/apps" + micro_app[i].entry;
          }
          setApps[i].proxy = micro_app[i].proxy;
          setApps[i].container = "#Appmicro";
          setApps[i].activeRule = await setRouterPrefix(micro_app[i].menu);
          setApps[i].props = new Object();
          setApps[i].props.router = await setMicroRouter(micro_app[i].menu,client.layout[0].layout_name);
          // 动态生成共享api
          jsonApiStore.prefixs.forEach((item)=>{
            setApps[i].props[`${item.api}`] = new api({alias:item.alias})
          })
          setApps[i].props.pyQt = $pyQt;
          
          setApps[i].props.menuList = state.menuList;
          setApps[i].props.icons = Vue.prototype.$icons;
          setApps[i].props.filter = Vue.prototype.$filter;
          // 增加显示隐藏设置的config
          setApps[i].props.setting = state.communicationInfo; // 显示隐藏相关communicationInfo-》setting
        }
        
        for(let i=0;i<setApps.length;i++){
          for(let j=0;j<special.length;j++){
            if(setApps[i].name == special[j].page_code.split('_')[1]){
              setApps[i].activeRule.push(`/${special[j].menu_code}${special[j].route.indexOf(':') != -1?special[j].route.split(':')[0]:special[j].route}`)
            }
          }
        }

        commit('SET_MICROAPP', setApps)

        async function setRouterPrefix(menu){
          let activeRule = []
          for(let i=0;i<menu.length;i++){
            for(let j=0;j<menu[i].page.length;j++){
              if(menu[i].page[j].page_code.indexOf('_') != -1){
                menu[i].page[j].menu_code = menu[i].menu_code
                special.push(menu[i].page[j])
              }else{
                activeRule.push(`/${menu[i].menu_code}${menu[i].page[j].route.indexOf(':') != -1?menu[i].page[j].route.split(':')[0]:menu[i].page[j].route}`)
              }
            }
          }
          return activeRule;
        }

        async function setMicroRouter(menu){
          let router = []
          
          for(let i=0;i<menu.length;i++){
            if(menu[i].page.length > 0){
              let tmp ={
                path:`/${menu[i].menu_code}`,
                meta: {
                  title: menu[i].menu_code,
                  icon: menu[i].menu_code,
                  cat: menu[i].cat,
                  policy: menu[i].menu_policy
                },
                name:menu[i].menu_code,
                children:setPage(menu[i].page,menu[i].menu_code,menu[i].cat)
              }
              state.localeData_route_zh.route[menu[i].menu_code] = menu[i].menu_cn_name
              state.localeData_route_en.route[menu[i].menu_code] = menu[i].menu_name
              router.push(tmp)
              setAccessRoutes(JSON.parse(JSON.stringify(tmp)))
            }
          }
          return router;
        }

        function setAccessRoutes(tmp){
          tmp.component = layout
          for(let i=0;i<tmp.children.length;i++){
            delete tmp.children[i].component;
          }
          if(tmp.meta.cat == 'menu'){
            state.menuList.push(tmp)
          }
          accessRoutes.push(tmp)
        }
        
        function setPage(pages,menu_code,cat){
          let pageRouter = []
          for(let i=0;i<pages.length;i++){
            pageRouter.push(
              {
                path:`/${menu_code}${pages[i].route}`,
                component_path: `@${pages[i].uri}`,
                name: `${pages[i].page_code}`,
                meta: { title: pages[i].page_code, icon: pages[i].page_code, affix: false , cat:cat },
                hidden:pages[i].hidden == 1?false:true,
              }
            )
            state.localeData_route_zh.route[pages[i].page_code] = pages[i].page_cn_name;
            state.localeData_route_en.route[pages[i].page_code] = pages[i].page_name;
          }
          return pageRouter;
        }
        // @wodelu: TODO
        if(client.client_name == 'daily-report'){
          accessRoutes.push(
            {
              path: '/',
              component: layout,
              redirect: '/dailyReport-role/index',
              hidden:true,
              name:'Dashboard'
            }
          )
        } else if (client.client_name == 'shell' && account === "liangdao.demo") {
          accessRoutes.push(
            {
              path: '/',
              component: layout,
              redirect: '/dataasset/overview',
              hidden:true,
              name:'Dashboard'
            }
          )
        } else{
          let url = new URL(location.href).searchParams.get('redirectUrl')
          if (!url) url = '/landing/landing'
          accessRoutes.push(
            {
              path: '/',
              component: layout,
              redirect: url,
              hidden:true,
              name:'Dashboard'
            }
          )
        }
        console.log(accessRoutes,'accessRoutes')
        console.log(state.localeData_route_zh,'state.localeData_route_zh')
        await i18n.mergeLocaleMessage('zh', state.localeData_route_zh)
        await i18n.mergeLocaleMessage('en', state.localeData_route_en)
        resolve(accessRoutes)
        //获取权限列表的请求
        store.dispatch('operation/getActions')
      }).catch((err)=>{
        const options = {
          domain: window.server.domain,
          path: "/",
        }
        Cookies.remove('Token',options)
        Cookies.remove('refresh_token',options)
        Cookies.remove('systemId',options)
        Cookies.remove('roles',options)
        
        Cookies.remove('Token')
        Cookies.remove('refresh_token')
        Cookies.remove('systemId')
        Cookies.remove('roles')
      })
    })
  },
  //获取子应用的返回值
  getCommunication({ commit, dispatch },info){
    return new Promise(async resolve => {
      const { msg } = info
      if(msg == 'closeSelectedTag'){
        await dispatch('tagsView/delView', router.currentRoute, { root: true })
        commit('SET_COMMUNICATION', msg)
      }
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
