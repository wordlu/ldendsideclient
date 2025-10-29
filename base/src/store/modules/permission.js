import { constantRoutes } from '@/router'

const state = {
  routes: [],
  addRoutes: [],
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // 生成路由
  generateRoutes({ commit }, asyncRoutes) {
    return new Promise(resolve => {
      asyncRoutes = asyncRoutes
      let accessedRoutes;
      accessedRoutes = asyncRoutes
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  PermissioniFltering({commit}, roles) {
    return new Promise(resolve => {
      console.log(roles,'roles')
    })
  }
}



export default {
  namespaced: true,
  state,
  mutations,
  actions
}
