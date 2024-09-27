import { defineStore } from 'pinia'
import { store } from '@/store'
import { Monitor } from '@/store/types/monitor'
import { useCollectStore } from './collect'

export const useMonitorStore = defineStore('monitor', {
  state: (): Monitor => ({
    showMonitor: false, // 控制监控详情弹窗的展示

    // 监测状态:run, normal, warning, error, critical, fail.
    monitorStatus: '',

    // 监控详情
    monitorDetail: {},

    recordUserClicked: false, // 记录监控告警提示是否继续采集时,记录用户是否点击了继续操作,点击之后在本次采集中不再提示
  }),
  getters: {
    // 是否监控失败
    monitorFailed: state => {
      return state.monitorStatus === 'fail' && useCollectStore().isCollect
    },
    // 是否在监控中
    inMonitoring: state =>
      ['run', 'info', 'normal', 'warning', 'critical', 'error'].indexOf(state.monitorStatus) > -1,
  },
})

// Need to be used outside the setup
export function useMonitorStoreWithout() {
  return useMonitorStore(store)
}
