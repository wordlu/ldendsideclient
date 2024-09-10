import Globalactions from '@/micros/actions'
import store from '@/store'

function hasMethod(method){
  let methods = ['GET', 'DELETE', 'POST', 'PATCH']
  try {
    if(methods.includes(method)){
      
    } else {
      throw `Method type error: No ${method} type exists,please entry ${methods}`
    }
  }catch(err) {
    console.error(err)
  }
}

function createRequest(method){
  method
}

const state = {
  
}

const mutations = {
  
}

const actions = {
  callResourceModule({ commit , dispatch },modules){
    return new Promise(async (resolve,rejecet)=>{
      if(modules){
        const { module , method  } = modules
        hasMethod(method)
        // await store.dispatch(`jv/${method}`,module)
        // .then(res=>{
        //   Globalactions.setGlobalState({apiData:res._jv});
        //   resolve(res)
        // }).catch(error=>{
        //   rejecet(error)
        // })
      }
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}