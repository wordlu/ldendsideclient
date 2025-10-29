import $dmsApi from '@/jsonapi/dms'
import filterData from '@/utils/filterData'
import Vue from 'vue'

const state = {
  icons: []
}

const mutations = {
  SET_ICONS: (state, icons) => {
    state.icons = icons
  }
}

const actions = {
  getIcons({ commit }) {
    return new Promise(async (resolve, reject) => {
      await $dmsApi.findAll('icons').then(res=>{
        Vue.prototype.$icons = res.data;
        commit('SET_ICONS', res.data)
        resolve(res.data)
      }).catch(error=>{
        reject(error)
      })
    })
  },
  getTags() {
    return new Promise(async (resolve, reject) => {
      $dmsApi.findAll('tags').then(res=>{
        Vue.prototype.$filter = new filterData({ tags: res.data })
        resolve(res.data)
      }).catch(error=>{
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
