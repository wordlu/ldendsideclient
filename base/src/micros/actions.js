import { initGlobalState } from "qiankun";
import store from "../store";

let initialState = {
  msg:'',
  lang:'',
  url:'',
  /**
   * type { 交换类型 } 
   * setting { 全局设置类数据监听 }
   * data { 数据存取 }
   * api { 接口调用 }
   */
  type:null,
  //数据交换
  dataActions:{
    
  },
  //api请求
  apiActions:{
    
  }
};

// 初始化 state
const actions = initGlobalState(initialState);
actions.onGlobalStateChange(async(state, prev) => {
  if(state.type == 'api'){
    await actions.setGlobalState({type:null})
    await store.dispatch('communication/callResourceModule',state.api)
  }else if(state.type == 'setting'){
    await store.dispatch('operation/getCommunication',state)
  }else if(state.type == 'data'){
    await store.dispatch('operation/getCommunication',state)
  }
});

export default actions;