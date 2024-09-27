import WsClientClass from '@/utils/websocket'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Device } from '@/api/s1/model/device'
import { formatMonitorData } from '@/utils'
import { setScenePcDataByProto, setImageData } from './visualization'
import { useCollectStoreWithout } from '@/store/modules/collect'
import { useMonitorStoreWithout } from '@/store/modules/monitor'
import { useVisualizeStoreWithout } from '@/store/modules/visualize'
import { i18nInstance } from '@/locales'

const t = (i18nInstance?.global as any)?.t

const wsClient = new WsClientClass()
const collectStore = useCollectStoreWithout()
const monitorStore = useMonitorStoreWithout()
const visualizeStore = useVisualizeStoreWithout()
let wsUrl = '' // ws链接,用于ws意外关闭时重连
let retryCount = 0 /// ws断开时的重连次数限制

// setTimeout(wsClient.disconnect(), 10000)

// 连接成功回调函数
wsClient.addListener('connected', () => {
  // 每次链接设置一个随机ws名称
  const name = `logger${Math.random().toString(36).substring(2)}`
  sessionStorage.setItem('viewClientName', name)
  // 向ws发送该名称
  wsClient.sendCmd('setClientType', {
    clientType: 'viewClient',
    name,
  })
  retryCount = 0
})

// 出现错误回调函数
wsClient.addListener('error', err => {
  ElMessage.error(err)
})

// ws关闭时尝试进行重连
wsClient.addListener('close', () => {
  console.log('-------------ws链接断开,尝试重连---------------')
  // 重连3次,如果还是失败,给出刷新页面提示
  if (retryCount < 3) {
    wsClient.connect(wsUrl)
    retryCount++
  } else {
    ElMessageBox.alert(t('common.wsTip'), t('common.tips'), {
      confirmButtonText: t('common.confirm'),
      callback: (action: any) => {
        console.log(action)
        if (action === 'confirm') {
          window.location.reload()
        }
      },
    })
  }
})

/**
 * 更新设备连接状态
 */
wsClient.addListener('updateDevice', data => {
  const device: Device = data.devices[0] || {}
  const config = collectStore.deviceConfig

  // 更新设备连接状态: 是否连接
  config.forEach(item => {
    if (item.name === device.name) {
      item.device_status = device.status
    }
  })
  collectStore.deviceConfig = config

  // 处于采集流程中 - 检查状态时,更新设备状态
  if (collectStore.collectStatus === 'check') {
    if (device) {
      // 如果有设备连接失败,则设置采集状态为准备失败
      if (device.status === 'disconnect') {
        collectStore.collectStatus = 'error'
      }
    }
  } else {
    // 不在采集状态时,可视化页面收到设备状态变化(可视化页面:直接查看可视化,后端需要先进行连接再推送数据)
    const temp_index = visualizeStore.tempDevice.findIndex(i => i === device.name)
    if (temp_index > -1) {
      // 当设备返回状态时,从缓存中移除
      visualizeStore.tempDevice.splice(temp_index, 1)
    }

    if (device.status === 'disconnect') {
      // 连接失败时toast提示,并从选中状态中移除
      const sel_lidar_index = visualizeStore.selLidars.findIndex(i => i === device.name)
      if (sel_lidar_index > -1) {
        ElMessage.error(`${device.name}连接失败`)
        visualizeStore.selLidars.splice(sel_lidar_index, 1)
      } else {
        const sel_camera_index = visualizeStore.selCameras.findIndex(i => i === device.name)
        if (sel_camera_index > -1) {
          ElMessage.error(`${device.name}连接失败`)
          visualizeStore.selCameras.splice(sel_camera_index, 1)
        }
      }
    }

    // 缓存中的设备全部连接时,则可视化的隐藏loading
    if (visualizeStore.tempDevice.length === 0 && visualizeStore.showLoading) {
      visualizeStore.showLoading = false
    }
  }
})

// 更新采集状态
wsClient.addListener('updateCollectStatus', data => {
  collectStore.collectStatus = data.collection_status
})

// 更新监控状态
wsClient.addListener('updateMonitorStatus', data => {
  monitorStore.monitorStatus = data.status
})

// 更新授时状态
wsClient.addListener('updateTimingStaus', data => {
  if (data.status === 'failed' && !collectStore.isCollect) {
    // 如果授时失败,则设置采集状态为失败
    collectStore.collectStatus = 'error'
  }
  collectStore.timingDetail = data
})

/**
 * 更新监控详情里设备授时时间戳信息
 */
wsClient.addListener('updateDeviceTiming', data => {
  const device = monitorStore.monitorDetail.dir_speed_log
  const update = data.detail.devices_log
  update?.forEach(d => {
    device?.find(i => {
      if (d.name === i.device_name) {
        i.offset = {
          level: d.log_level,
          value: d.offset,
        }
        return true
      }
    })
  })
  monitorStore.monitorDetail.dir_speed_log = device
})

// 处理采集过程中log推送
wsClient.addListener('handleLog', data => {
  if (data.log_node === 'Monitor') {
    // 监控节点
    monitorStore.monitorDetail = formatMonitorData(data.detail)
    monitorStore.monitorStatus = data.level
  }
})

// 接收点云回调函数,更新场景点云
wsClient.addListener('pcDataRec', pc => {
  if (visualizeStore.showLoading) {
    visualizeStore.showLoading = false
  }
  setScenePcDataByProto(pc)
})

// 接收到摄像头图像数据
wsClient.addListener('imageData', data => {
  setImageData(data)
})

wsClient.addListener('updateTriggerCollectStatus', status => {
  if (status === 'collect') {
    collectStore.collectStatus = 'collect'
    collectStore.triggerInCollecting = true
  } else if (status === 'pause') {
    collectStore.collectStatus = 'pause'
    collectStore.triggerInCollecting = false
  }
})

export default wsClient

export const setWsClient = (url: string) => {
  wsClient.connect(url)
  wsUrl = url
}
