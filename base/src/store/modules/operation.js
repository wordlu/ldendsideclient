import { ssoLogin, login, counters, getFrontendConfigs } from '@/api/user'
import { getToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import Cookies from 'js-cookie'
import axios from 'axios';
import jsonApiStore from '@/jsonapi/lib/store'
import { api } from '@/jsonapi/api'
import $systemApi from '@/jsonapi/system'
import $pyQt from '@/pyQt/main'
// import Layout from '@/layout'
import Layout1 from '@/layouts/layout1'
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
      name: "systemanage",
      entry: "http://10.86.24.22:8083/apps/systemanage",
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
  // 获取用户信息
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {

      const roles = 'manager'
      commit('SET_ROLES', roles)
      resolve(roles)
    })
  },

  //获取前端配置
  getConfigure_sql({ commit, dispatch },systemId){
    return new Promise(async (resolve,reject) => {
      const cookie_name = 'manager,general'
      const account = Cookies.get('account')
      getFrontendConfigs().then(async res=>{
        const client = res;
        const accessRoutes = [];
        const micro_app = res.apps;
        const layoutname = res.layout[0].name;
        let setApps=[];
        let special=[];
        let layout;
        for(let key in state.Layouts){
          if(key == layoutname){
            layout = state.Layouts[key];
          }
        }
        for(let i=0;i<micro_app.length;i++){
          let development;
          let isfind = false;
          setApps[i] = new Object();
          setApps[i].name = micro_app[i].name;
          if(process.env.NODE_ENV === 'development'){
            state.registerMicroApps.forEach((item)=>{
              if(item.name == micro_app[i].name){
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
          setApps[i].activeRule = await setRouterPrefix(micro_app[i].menus);
          setApps[i].props = new Object();
          setApps[i].props.router = await setMicroRouter(micro_app[i].menus,layoutname);
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
            if(setApps[i].name == special[j].code.split('_')[1]){
              setApps[i].activeRule.push(`/${special[j].menu_code}${special[j].route.indexOf(':') != -1?special[j].route.split(':')[0]:special[j].route}`)
            }
          }
        }

        commit('SET_MICROAPP', setApps)

        async function setRouterPrefix(menu){
          let activeRule = []
          for(let i=0;i<menu.length;i++){
            for(let j=0;j<menu[i].pages.length;j++){
              if(menu[i].pages[j].code.indexOf('_') != -1){
                menu[i].pages[j].menu_code = menu[i].code
                special.push(menu[i].pages[j])
              }else{
                activeRule.push(`/${menu[i].code}${menu[i].pages[j].route.indexOf(':') != -1?menu[i].pages[j].route.split(':')[0]:menu[i].pages[j].route}`)
              }
            }
          }
          return activeRule;
        }

        async function setMicroRouter(menu){
          let router = []
          
          for(let i=0;i<menu.length;i++){
            if(menu[i].pages.length > 0){
              let tmp ={
                path:`/${menu[i].code}`,
                meta: {
                  title: menu[i].code,
                  icon: menu[i].code,
                  cat: menu[i].cat,
                  policy: menu[i].menuPolicy
                },
                name:menu[i].code,
                children:setPage(menu[i].pages,menu[i].code,menu[i].cat)
              }
              state.localeData_route_zh.route[menu[i].code] = menu[i].cnname
              state.localeData_route_en.route[menu[i].code] = menu[i].name
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
                name: `${pages[i].code}`,
                meta: { title: pages[i].code, icon: pages[i].code, affix: false , cat:cat },
                hidden:pages[i].hidden == 1?false:true,
              }
            )
            state.localeData_route_zh.route[pages[i].code] = pages[i].cnname;
            state.localeData_route_en.route[pages[i].code] = pages[i].name;
          }
          return pageRouter;
        }
        // let redirectPath = accessRoutes[0].children[0].path
        // if (!url) url = "/landing/landing"
        let redirectPath = '/systemanage/sysmanage'
        accessRoutes.push(
          {
            path: '/',
            component: layout,
            redirect: redirectPath,
            hidden:true,
            name:'Dashboard'
          }
        )
        console.log(accessRoutes,'accessRoutes')
        console.log(state.localeData_route_zh,'state.localeData_route_zh')
        await i18n.mergeLocaleMessage('zh', state.localeData_route_zh)
        await i18n.mergeLocaleMessage('en', state.localeData_route_en)
        resolve(accessRoutes)
        //获取权限列表的请求
        // store.dispatch('operation/getActions')
      }).catch((err)=>{
        console.log("err====>",err)
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
