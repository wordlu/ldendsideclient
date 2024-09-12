<template>
  <el-container class="h100">
    <!-- <el-header>
      <Header :title="t('common.title')" />
    </el-header> -->
    <el-container class="main-con">
      <!-- 侧边栏菜单 -->
      <el-aside>
        <AsideMenu :menu-list="menuList" />
      </el-aside>
      <el-main id="main-cont">
        <router-view />
      </el-main>
    </el-container>

    <Monitor />
  </el-container>
</template>
<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useI18n } from 'vue-i18n'
import Header from '@/components/layout/Header.vue'
import AsideMenu from '@/components/layout/AsideMenu.vue'
import Emitter from 'tiny-emitter/instance'
import { setWsClient } from '@/basic_data/web_socket'
import { setBaseUrl } from '@/utils/http'
import { getEnableDevices } from '@/api/s1/device'
import { getCollectionStatus, getMonitorStatus, getSettings } from '@/api/s1/collect'
import { useCollectStore } from '@/store/modules/collect'
import { useMonitorStore } from '@/store/modules/monitor'
import { CollectStatusMap } from '@/store/types/collect'
import { ElMessage } from 'element-plus'
import { menuList } from '@/utils'
import Monitor from '@/components/monitor/Index.vue'

const { t } = useI18n()
const collectStore = useCollectStore()
const monitorStore = useMonitorStore()

const envParam = import.meta.env
const baseUrl = envParam.PROD ? location.hostname + envParam.VITE_BASE_URL : envParam.VITE_BASE_URL

// setWsClient(`ws://${location.host}/ws/`)

// 建立socket连接
setWsClient(`ws://${baseUrl}/ws/`)

// 设置i请求路径
setBaseUrl(`http://${baseUrl}`)

onBeforeMount(async () => {
  sessionStorage.setItem('collectStatusReady', '0')
  // 获取使能的设备,需要await:会在获取到采集状态之后,设置设备状态
  const dRes = await getEnableDevices()
  if (dRes.status === 200) {
    collectStore.deviceConfig = dRes.data
  }

  if (location.pathname !== '/system_manage')
    // 获取系统通用设置: 触发采集方式
    await getSysSetting()

  // 获取采集状态
  const cRes = await getCollectionStatus()
  if (cRes.status !== 200) {
    return ElMessage.error(cRes.message)
  }
  // collectStore.collectStatus = 'pause'
  collectStore.collectStatus = cRes.data.status || 'stop'
  // 如果是检查状态,根据返回的设备状态设置设备和授时状态
  if (collectStore.collectStatus === 'check') {
    // 设置授时状态
    collectStore.timingDetail = { status: cRes.data.timing_status }
    if (cRes.data.timing_status === 'failed') {
      collectStore.collectStatus = 'error'
    }
    // 设置设备状态
    const status_list = cRes.data.devices_status || []
    let connect_num = 0 // 记录连接状态的雷达个数
    collectStore.deviceConfig.forEach(i => {
      const target = status_list.find(t => t.name === i.name)
      if (target) {
        // 如果有设备连接失败,则采集状态置为失败
        if (collectStore.collectStatus !== 'error' && target.status === 'disconnect') {
          collectStore.collectStatus = 'error'
        }
        i.device_status = target.status
        // 检查状态时,以下几个状态的设备都是已连接
        if (CollectStatusMap[target.status as keyof typeof CollectStatusMap] > 1) {
          i.device_status = 'connect'
          connect_num++
        }
      }
    })
    // 如果授时成功且设备全部连接时,则采集状态为连接
    if (cRes.data.timing_status === 'successed' && connect_num === status_list.length) {
      collectStore.collectStatus = 'connect'
    }
  }
  if (cRes.data.status.indexOf('collect') > -1) {
    monitorStore.monitorStatus = 'run'
    if (collectStore.collecting_mode !== '0') {
      collectStore.triggerInCollecting = true
    }
  }
  // 记录系统初始化时是否获取到了采集状态,有些操作需要等获取到采集状态之后再进行,记录标识
  sessionStorage.setItem('collectStatusReady', '1')
  // collectStore.collectStatus = 'connect'
  Emitter.emit('collectStatusReady')

  // 获取监控状态
  getMonitorStatus().then(res => {
    if (res.status === 200) {
      monitorStore.monitorStatus = res.data.monitor_status
      monitorStore.showMonitor = res.data.monitor === 'fail'
    }
  })
})

async function getSysSetting() {
  const res = await getSettings()
  console.log(res)
  if (res.status !== 200) {
    return ElMessage.error(res.message)
  }
  collectStore.collecting_mode = res.data.collecting_mode || '0'
}
</script>

<style scoped lang="scss">
.el-header {
  display: flex;
  height: 60px;
  justify-content: space-between;
  padding: 0;
  background-color: $bg-color1;
  align-items: center;
  color: $text-color1;
  font-size: 20px;
  border-bottom: 2px solid $el-color-primary-light-3;
  padding: 0 0.8rem;
}
.h100 {
  height: 100%;
}
.main-con {
  height: calc(100% - 0px);
}
.el-aside {
  background: $bg-color1;
  width: auto;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.el-main {
  background:#fff;
  // background-image: url('../assets/load1.gif');
}
</style>

<style>
.el-dialog {
  min-width: 25rem;
}
.el-button:focus-visible {
  outline: none !important;
}
.el-table .cell {
  padding: 0 6px !important;
}
.el-form-item__label {
  word-break: break-all;
}

@keyframes breath {
  100% {
    opacity: 0.6;
  }
  0% {
    opacity: 1;
  }
}
</style>
