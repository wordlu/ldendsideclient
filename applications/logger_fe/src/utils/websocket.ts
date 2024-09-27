/**
 *  创建 websocket 类连接到后端。
 */
import Emitter from 'tiny-emitter/instance'
import { ElMessage } from 'element-plus'
import { ComMsg } from '@/basic_data/proto/com_msg'
import { PointCloud as pcMsg } from '@/basic_data/proto/point_cloud'
import { DataBlockIndices as dbIndicesProto } from '@/basic_data/proto/data_block_idx'

// ws监听事件类型
interface EventMap {
  connected: () => void
  updateDevice: (data: { devices: [] }) => void
  updateCollectStatus: (data: { collection_status: ''; collection_status_detail: any }) => void
  updateMonitorStatus: (data: { [key: string]: any }) => void
  updateTimingStaus: (data: { [key: string]: any }) => void
  updateDeviceTiming: (data: { [key: string]: any }) => void
  handleLog: (data: { [key: string]: any }) => void
  pcDataRec: (status: { pc: Uint8Array }) => void
  imageData: (data: any) => void
  updateTriggerCollectStatus: (data: string) => void
  error: (error?: string) => void
  close: () => void
}

export default class WsClient {
  private ws: WebSocket | null = null
  emitter: any

  constructor() {
    this.emitter = Emitter
  }

  addListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this.emitter.off(event, cb)
    this.emitter.on(event, cb)
  }

  removeListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this.emitter.off(event, cb)
  }

  connect(url: string) {
    this.ws = new WebSocket(url)
    this.ws.binaryType = 'arraybuffer'
    this.ws.onopen = () => {
      // this.sendMsg('hello')
      // this.sendCmd('hello', {})
      // this.sendCmd('getConnectStatus', {})
    }
    this.ws.onmessage = ev => {
      const buf = new Uint8Array(ev.data)
      const recMsg = ComMsg.fromBinary(buf)
      if (recMsg.msg === 'json') {
        // json 数据
        const recData = JSON.parse(recMsg.strData)
        this.parseServerJson(recData)
      } else if (recMsg.msg === 'P') {
        // 点云数据
        this.parsePc(recMsg.binData)
      } else if (recMsg.msg === 'FI') {
        // 索引帧
        const dbIndices = dbIndicesProto.fromBinary(recMsg.binData)
        // 目前后端传上来的时间戳以 ns 为单位, 而 Date 构造函数中使用的是 ms
        const processData: any[] = []

        dbIndices.indices.forEach(item => {
          processData.push(new Date(Number(item.timestamp / BigInt(1e6))))
        })
        this.emitter.emit('dbIndicesRec', processData)
      } else if (recMsg.msg === 'json_with_bin') {
        const info = JSON.parse(recMsg.strData)
        info.bin_data = recMsg.binData
        this.emitter.emit('imageData', info)
      } else {
        console.log(recMsg)
      }
    }
    this.ws.onclose = e => {
      this.emitter.emit('close')
      console.log(e)
    }
    this.ws.onerror = () => {
      ElMessage.error('ws连接失败')
    }
  }

  // 断开连接
  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }

  // 私有函数, 发送一个命令,
  // param 必须是 {string: string} 这样的字典. 可以为 {}.
  sendCmd(cmd: string, param: any) {
    const command = {
      type: 'command',
      cmd,
      ...param,
    }
    // websocket协议传输使用指定的格式,创建comMsg消息
    const payload = { msg: 'json', strData: JSON.stringify(command), binData: new Uint8Array() }
    const comMsg = ComMsg.create(payload)
    // 转译成Uint8Array格式发送
    const sendMsg = ComMsg.toBinary(comMsg)
    this.ws?.send(sendMsg)
  }

  sendMsg(msg: string) {
    this.ws?.send(msg)
  }

  // 私有函数，解析服务器发送的 json 数据
  parseServerJson(data: any) {
    const type = data.type
    const status = data.status
    if (status === 400 && data.cmd === 'getConnectStatus') {
      // 错误请求
      const message = data.message
      this.emitter.emit('error', message)
      return
    }
    console.log(data)

    if (type === 'notification') {
      // 命令返回值
      const name = data.name
      // 状态不是200,则不成功,返回错误
      // if (status !== 200) {
      //   if (cmd === 'setClientType') {
      //     this.disconnect()
      //   }
      //   return this.emitter.emit('error', data.message)
      // }

      switch (name) {
        // 更新设备状态
        case 'device_status':
          this.emitter.emit('updateDevice', data.data)
          break
        // 更新采集状态
        case 'collection_status':
          this.emitter.emit('updateCollectStatus', data.data)
          break
        // 更新监控状态
        case 'monitor_status':
          this.emitter.emit('updateMonitorStatus', data.data)
          break
        // 更新授时状态
        case 'timing_status':
          this.emitter.emit('updateTimingStaus', data.data)
          break
        // 更新监控详情里设备授时相关信息
        case 'device_timing_log':
          this.emitter.emit('updateDeviceTiming', data.data)
          break
        case 'log':
          this.emitter.emit('handleLog', data.data)
          break
        // 更新可视化相机图像
        case 'img_data':
          this.emitter.emit('imageData', data.data)
          break
        // 更新触发时的采集状态
        case 'trigger_collecting_status':
          this.emitter.emit('updateTriggerCollectStatus', data.data)
          break
        /**
         * 其他消息
         */
        default:
          this.emitter.emit(name)
      }
    }
  }

  // 私有函数，解析点云数据
  parsePc(data: Uint8Array) {
    const pc = pcMsg.fromBinary(data)
    this.emitter.emit('pcDataRec', pc)
  }
}
