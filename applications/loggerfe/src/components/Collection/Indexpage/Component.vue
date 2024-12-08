<template>
  <div class="index-page" >
    <!-- :element-loading-text="loadingtext"
    v-loading="pageLoading" > -->
    <el-breadcrumb :separator-icon="ArrowRight" v-show="!realtime">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel" v-show="!realtime">
      <div class="title-panel">
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备初始化</div>
          <el-switch v-model="testDevice" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="testDeviceChange"/>
        </div>
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备采集</div>
          <el-switch v-model="startCollect" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="startCollectChange"/>
        </div>
      </div>
    </div>
    <div
      v-loading="showLoading"
      element-loading-background="rgba(200, 200, 200, 0.6)"
      class="visible">
      <div class="point">
        <BasicScene 
          :allports="allports"
          :cloudpointparams="cloudpointparams"
          :currentSelectedSensor="currentSelectedSensor"  />
        <sensorConfigs v-show="!realtime" 
          ref="sensorConfigsRef" 
          :viewportId="viewportId"
          :testDevice="testDevice"
          :startCollect="startCollect"
          @changeProps="changeProps"
          @update:leafNodes="handleLeafNodes" 
          @setAllTreeKeys="setAllTreeKeys" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification } from 'element-plus';
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted  } from 'vue';
import { addItem, findAll, findItem, deleteItem } from '@/api/jsonApi'
// import PointView from '@/components/visualization/PointView.vue'
import BasicScene from '@/components/visualization/index/BasicScene.vue'
import DisplayPanel from '@/components/visualization/index/DisplayPanel.vue'
import sensorConfigs from '@/components/visualization/index/sensorConfigs.vue'
import gostore from '@/services/governance-store'
import { MoreFilled } from "@element-plus/icons-vue"
import { useRouter, useRoute } from 'vue-router';

// 获取当前路由对象
const router = useRouter();
const route = useRoute()
const realtime = ref(false)
// 创建响应式变量
const message = ref(null); // 用于存储 SSE 消息
const error = ref(null);   // 用于存储错误信息
let eventSource = null;    // 存储 EventSource 对象

interface Option {
  key: number
  label: string
  data: object
}

const cloudpointparams = ref({
  color: "00ffff",
  size: 0.01,
})
const changeProps = (obj) => {
  cloudpointparams.value = Object.assign(cloudpointparams.value, obj)
}

const loadingtext = ref('')
// const pageLoading = ref(false)
const switchLoading = ref(true)
const showRecordOnDevice = ref(false)
const testDevice = ref(false)
const startCollect = ref(false)
const sensorConfigsRef = ref(null);
const isAsideExpanded = ref(true);
const isAsideExpanded1 = ref(true);
const viewportId = ref('')

const selectedLeafNodes = ref([]);


const currentSelectedSensor = ref([])

// 调试
const testDeviceChange = async (val) => {
  switchLoading.value = true
  if (val) {
    startupDevice()
  } else {
    const currentStatus = await findItem('/viewport_status', viewportId.value)
    // 若为采集中，不可关闭
    if (currentStatus.data.isrecording) {
      ElMessage({
        message: "设备正在采集中，请先停止采集",
        type: 'error',
      })
      switchLoading.value = false;
      testDevice.value = true
      return;
    }
    shutdownDevice()
  }
}

// 采集
const startCollectChange = (val) => {
  switchLoading.value = true
  if (val) {
    recordOnDevice()
  } else {
    recordOffDevice()
  }
}

//iframe参数：所有端口
const allports = ref([])
const setAllTreeKeys = (keys) => {
  allports.value = keys
}

const handleLeafNodes = (leafNodes) => {
  selectedLeafNodes.value = leafNodes;
  getCurrentPorts()
};


const directive = ref('')
// 开始调试
const startupDevice = () => {
  getCurrentPorts()
  if (sensorConfigsRef.value) {
    sensorConfigsRef.value.selectAllNodes(); // 调用子组件的方法
  }
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "startup",
        "devices": [],
        "viewport": viewportId.value
      }
    }
  }
  addItem('/models/actions', params).then((res: any) => {
    switchLoading.value = false
  }).catch((err: any) => {
    switchLoading.value = false
    console.error(err, 'err')
    const errmsg = err?.response?.data?.errors[0]?.detail
    testDevice.value = false
    ElMessage({
      message: "启动设备失败: "+errmsg,
      type: 'error',
    })
  })
}
// 结束调试
const shutdownDevice = async () => {
  getCurrentPorts()
  if (sensorConfigsRef.value) {
    sensorConfigsRef.value.clearAllNodes(); // 调用子组件的方法
  }
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "shutdown",
        "devices":[],
        "viewport": viewportId.value
      }
    }
  }
  addItem('/models/actions', params).then((res: any) => {
    switchLoading.value = false
  }).catch((err: any) => {
    switchLoading.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    console.error(err, 'err')
    testDevice.value = true
    ElMessage({
      message: "关闭设备失败: "+errmsg,
      type: 'error',
    })
  })
}
// 开始采集
const recordOnDevice = () => {
  getCurrentPorts()
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "recordOn",
        "devices": currentSelectedSensorId.value,
        "viewport": viewportId.value
      }
    }
  }
  addItem('/models/actions', params).then((res: any) => {
    switchLoading.value = false
  }).catch((err: any) => {
    console.error(err, 'err')
    switchLoading.value = false
    startCollect.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    ElMessage({
      message: "设备采集失败: "+errmsg,
      type: 'error',
    })
  })
}
// 结束采集
const recordOffDevice = () => {
  getCurrentPorts()
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "recordOff",
        "devices": currentSelectedSensorId.value,
        "viewport": viewportId.value
      }
    }
  }
  addItem('/models/actions', params).then((res: any) => {
    switchLoading.value = false
  }).catch((err: any) => {
    switchLoading.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    console.error(err, 'err')
    startCollect.value = true
    ElMessage({
      message: "结束采集失败: "+errmsg,
      type: 'error',
    })
  })
}

const currentSelectedSensorId = ref([])

const getCurrentPorts = () => {
  currentSelectedSensor.value = selectedLeafNodes.value.filter(it => it.type !== 'radar' && it.type !== 'imu').map(node => node.port)
  currentSelectedSensorId.value = selectedLeafNodes.value.map(node => node.deviceid)
}

//获取设备树
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {'filter[using]': true}).then(async (res: any) => {
      viewportId.value = res.data.data[0].id
      await getCurrentStatus(viewportId.value)
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

// 获取设备调试、采集状态
const getCurrentStatus = (viewportId: string) => {
  try {
    findItem('/viewport_status', viewportId).then((res: any) => {
      testDevice.value = res.data.isluanching || false
      startCollect.value = res.data.isrecording || false
      switchLoading.value = false
      if(testDevice.value && !startCollect.value) {
        // 设备调试初始化中但未采集，自动勾选全部设备
        if (sensorConfigsRef.value) {
          sensorConfigsRef.value.selectAllNodes(); // 调用子组件的方法
        }
      } else if (testDevice.value && startCollect.value) {
        // 设备采集中，勾选状态为采集中的设备
        const isrecordingNodes = res.data.details.filter((item: any) => item.isrecording)
        if (sensorConfigsRef.value) {
          sensorConfigsRef.value.selectSomeNodes(isrecordingNodes); // 调用子组件的方法
        }
      }

    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const gotologsanalyze = () => {
  const routeUrl = router.resolve({ path: '/systemanage/statusmonitor' }).href;
  window.open(routeUrl, '_blank');
}

onMounted(() => {
  if (route.query?.type === 'realtime') {
    realtime.value = true
  }
  queryCurrentDrivers()
  // 建立长连接
  eventSource =new EventSource(
    `${window.server.mecPrefix}/api/logger/events/alert`,
    { withCredentials: true }
  )

  // 监听服务器发送的消息
  eventSource.onmessage = (event) => {
    message.value = JSON.parse(event.data); // 更新最新消息
    const title = message.value?.alerts[0]?.labels?.alertname
    const content = message.value?.commonAnnotations?.summary
    const severity = message.value?.alerts[0]?.labels?.severity
    const state = message.value?.alerts[0]?.labels?.state

    if (state === '0') {
      // pageLoading.value = false
      ElNotification({
        title: '收到一条新事件',
        type: severity !== '2' ? 'warning' : 'error',
        message: content,
        customClass: 'event-notification',
        duration: 8000,
        position: 'bottom-right',
        onClick() {
          gotologsanalyze();
        },
      })
    } else if (state == '1') {
      // pageLoading.value = false
      // 接收成功和失败的消息
    }
    
  };

  // 监听错误事件
  eventSource.onerror = () => {
    error.value = '连接失败或服务器错误';
    eventSource.close(); // 关闭连接
  };
})

onUnmounted(() => {
  // 在组件卸载时关闭 SSE 连接
  if (eventSource) {
    eventSource.close();
  }
});

</script>

<style lang="scss" scoped>

.index-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  .point {
    display: flex;
    height: 100%;
  }

  .el-button--primary {
    background: #FF7900;
    border: none;
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;
    margin: 20px 0;
    color: #606266;
  }

  &-top {
    height: 4.5rem;
  }
  .devices {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
  }
  .visible {
    flex: 1;
  }
}
</style>

<style lang="scss">
.event-notification {
  .el-notification__content {
    text-align: left;

    p {
      word-break: break-all;
    }
  }
}
</style>