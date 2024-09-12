import { defineStore } from 'pinia'
import { store } from '@/store'
import { Collect, CollectStatusMap } from '@/store/types/collect'
import { setCollectionStatus } from '@/api/s1/collect'
import { ElMessage } from 'element-plus'
import { useMonitorStoreWithout } from './monitor'

// const monitorStore = useMonitorStoreWithout()

export const useCollectStore = defineStore('collect', {
  state: (): Collect => ({
    // 采集状态: stop待采集默认状态,0准备,check采集中,2准备失败,3准备成功
    // stop, check, initialize, collect, push_data, push_and_collect, connect
    // pause, warning, error, fatal_error
    collectStatus: 'stop',

    triggerInCollecting: false, // 触发采集模式下,是否真实在采集

    deviceConfig: [], // 保存使能的采集设备状态

    timingDetail: {}, // 授时详情

    tagging_cache: [], // 未结束的线标签
    latestTag: {}, // 打标签回显

    isFullScreen: false, // 记录是否开启全屏,全屏模式下单独展示监控模块

    collecting_mode: '0', // 打标触发方式,0-盲采,1-打标触发采集
  }),
  getters: {
    // 是否在采集中
    isCollect: state => CollectStatusMap[state.collectStatus as keyof typeof CollectStatusMap] > 3,
    // 是否展示检查页面
    isIncheck: state => ['check', 'connect', 'error'].indexOf(state.collectStatus) > -1,
    // 是否禁用设备的增删改和使能操作
    disableEdit: state =>
      CollectStatusMap[state.collectStatus as keyof typeof CollectStatusMap] > 0,
    // 隐藏可视化页面的图像,只展示默认页面
    hideVisualize: state => {
      return ['pause', 'check'].indexOf(state.collectStatus) > -1
    },
    lidars: state => {
      return state.deviceConfig.filter(i => i.category === 'lidar')
    },
    cameras: state => {
      return state.deviceConfig.filter(i => i.category === 'camera')
    },
    cans: state => {
      return state.deviceConfig.filter(i => i.category === 'can')
    },
    coms: state => {
      return state.deviceConfig.filter(i => i.category === 'com')
    },
  },
  actions: {
    // 停止采集动作
    stopCollect() {
      setCollectionStatus({
        status: 'stop',
      }).then(res => {
        if (res.status !== 200) {
          return ElMessage.error(res.message)
        }
        // 重置采集相关状态
        this.timingDetail = {}
        this.tagging_cache = []
        this.collectStatus = 'stop'
        this.latestTag = {}
        this.deviceConfig.forEach(i => {
          i.device_status = 'stop'
        })
        this.triggerInCollecting = false
        // 重置监控相关状态
        useMonitorStoreWithout().monitorStatus = 'stop'
        useMonitorStoreWithout().monitorDetail = {}
        useMonitorStoreWithout().recordUserClicked = false
      })
    },
  },
})

// Need to be used outside the setup
export function useCollectStoreWithout() {
  return useCollectStore(store)
}
