import { createStore,Store} from 'vuex'
import { ComponentCustomProperties } from 'vue'

// eslint-disable-next-line
declare module '@vue/runtime-core' {
  // 声明自己的 store state  之后state中定义的内容都需要在接口中声明
  interface State {
    count: number
  }

  // 为 `this.$store` 提供类型声明
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

const store = createStore({
  state() {
    return {
        count: 1
    }
  },
  mutations: {
    increment(state:any):void {
      state.count ++
    }
  }
})
export default store