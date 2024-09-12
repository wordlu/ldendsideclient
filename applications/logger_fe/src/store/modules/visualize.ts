import { defineStore } from 'pinia'
import { store } from '@/store'
import { Visualize } from '@/store/types/visualize'
import { useCollectStoreWithout } from './collect'

const collectStore = useCollectStoreWithout()

export const useVisualizeStore = defineStore('Visualize', {
  state: (): Visualize => ({
    activePath: location.pathname || '/index', // 左侧菜单当前定位的菜单项

    showPoint: true, // 控制可视化视图展示点云还是图像

    selCameras: [], // 当前选中的相机集合

    selLidars: [], // 当前选中的雷达集合

    // 图像可视化图片地址
    imageUrl: '',

    showLoading: false, // 设备是否正处于连接状态,如果正在连接,则可视化页面展示loading
    tempDevice: [], // 记录正在连接中的设备,设备全部返回连接状态,则去掉loading
  }),
  getters: {
    // 根据当前点云index获取当前操作的点云
    devicePoints: state => {
      return (
        collectStore.lidars.filter(i => {
          if (state.selLidars.indexOf(i.name) > -1) {
            i.color = i.color || '#ff0000'
            return true
          }
        }) || []
      )
    },
    deviceImage: state => {
      return collectStore.cameras.filter(i => state.selCameras.indexOf(i.name) > -1) || []
    },
  },
  actions: {
    // 关闭可视化页面,重置可视化页面相关参数
    closeVisualization() {
      this.selCameras = []
      this.selLidars = []
      this.imageUrl = ''
      this.showPoint = true
    },
  },
})

// Need to be used outside the setup
export function useVisualizeStoreWithout() {
  return useVisualizeStore(store)
}
