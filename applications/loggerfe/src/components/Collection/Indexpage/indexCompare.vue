<template>
  <div class="index-page-compare" >
    <div class="panel">
      <div class="title-panel">
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;color: #606266;font-weight: 600;">设备初始化</div>
          <el-switch v-model="testDevice" :disabled="!startupDisabled && !testDevice" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="testDeviceChange"/>
        </div>
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备采集</div>
          <el-switch v-model="startCollect" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="startCollectChange"/>
        </div>
      </div>
      <el-button type="primary" size="small" @click="dialogVisible = true">
        摄像头数据
      </el-button>
      <el-checkbox :disabled="startCollect" v-model="cameraChecked" style="margin-left: 10px;" >采集摄像头数据</el-checkbox>

    </div>
    <div
      v-loading="showLoading"
      element-loading-background="rgba(200, 200, 200, 0.6)"
      class="visible">
      <div class="point">
        <BasicScene 
          ref="basicSceneRef"
          :testDevice="testDevice"
          :viewportId="viewportId"
          :viewports="viewports"
          :allports="allports"
          :runningDevice="runningDevice"
          :cloudpointparams="cloudpointparams"
          :currentSelectedSensor="currentSelectedSensor" 
          @selectDevice="selectDevice"
        />
        <sensorConfigs
          v-show="viewportId !== 'changcheng'"
          ref="sensorConfigsRef" 
          :viewports="viewports"
          :viewportId="viewportId"
          :testDevice="testDevice"
          :startCollect="startCollect"
          @changeProps="changeProps"
          @update:leafNodes="handleLeafNodes" 
          @setAllTreeKeys="setAllTreeKeys" />
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="摄像头数据"
      draggable
      :modal="false"
      :close-on-click-modal="false"
      width="357"
      :before-close="handleClose"
    >
     <div>
      <iframe class="iframe" :src="'/pointcloud/realvisualization?showCameras=1&allports='+JSON.stringify(allports)+'&portarray='+allCameraPorts.toString()+'&cloudpointparams='+JSON.stringify(cloudpointparams)+'&fresh='+Math.random()" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
     </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification } from 'element-plus';
import { ref, computed, reactive, onMounted, onBeforeUnmount, onUnmounted, defineProps } from 'vue';
import { addItem, findAll, findItem, deleteItem } from '@/api/jsonApi'
// import PointView from '@/components/visualization/PointView.vue'
import BasicScene from '@/components/visualization/index/BasicScene.vue'
import DisplayPanel from '@/components/visualization/index/DisplayPanel.vue'
import sensorConfigs from '@/components/visualization/index/sensorConfigs.vue'
import gostore from '@/services/governance-store'
import { MoreFilled } from "@element-plus/icons-vue"
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  viewportId: String,
  viewports: Object,
});
interface Option {
  key: number
  label: string
  data: object
}
const showTree = ref(false)
// 获取当前路由对象
const router = useRouter();
const route = useRoute()
// 创建响应式变量
const message = ref(null); // 用于存储 SSE 消息
const error = ref(null);   // 用于存储错误信息
let eventSource = null;    // 存储 EventSource 对象
const dialogVisible = ref(false)
const runningDevice = ref([])
const basicSceneRef = ref()
const allCameraPorts = ref([])
const cameraChecked = ref(false)
// 状态管理
const state = reactive({
  select1: '', // 第一个下拉框的值
  select2: '', // 第二个下拉框的值
});

// 按钮状态：当两个下拉框都有值时启用
const startupDisabled = computed(() => state.select1 !== '' && state.select2 !== '');

// 监听选择事件
const selectDevice = (key, value) => {
  // if (value) {
    state[key] = value; // 更新对应的下拉值
  // }
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
// const viewportId = ref('')
// const viewports = ref([])
const selectedLeafNodes = ref([]);


const currentSelectedSensor = ref([])

// 调试
const testDeviceChange = async (val) => {
  switchLoading.value = true
  if (val) {
    startupDevice()
  } else {
    const currentStatus = await findItem('/viewport_status', props.viewportId)
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
  // getCurrentPorts()
  // if (sensorConfigsRef.value) {
  //   sensorConfigsRef.value.selectAllNodes(); // 调用子组件的方法
  // }
  const device1 = basicSceneRef.value?.value1
  const device2 = basicSceneRef.value?.value2
  const viewportDevices = props.viewports[0]['devices']
  const cameras = viewportDevices.filter((item) => item.type === 'camera').map(it => it.id)
  allCameraPorts.value = viewportDevices.filter((item) => item.type === 'camera').map(it => it['display-port'])
  const ods = viewportDevices.filter((item) => item.type === 'perception' && (item?.id.indexOf(device1) !== -1 || item?.id.indexOf(device2) !== -1)).map(it => it.id)
  const devicesArr = [device1, device2, ...cameras, ...ods, ]
  if (!device1 || !device2) {
    ElMessage({
      message: "请先选择设备",
      type: 'error',
    })
    return;
  }
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "startup",
        "devices": devicesArr,
        "viewport": props.viewportId
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
        "viewport": props.viewportId
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
  if (!testDevice.value) {
    ElMessage({
      message: "请先初始化设备",
      type: 'error',
    })
    switchLoading.value = false
    startCollect.value = false
    return;
  }
  const device1 = basicSceneRef.value?.value1
  const device2 = basicSceneRef.value?.value2
  const viewportDevices = props.viewports[0]['devices']
  const cameras = viewportDevices.filter((item) => item.type === 'camera').map(it => it.id)
  allCameraPorts.value = viewportDevices.filter((item) => item.type === 'camera').map(it => it['display-port'])
  const ods = viewportDevices.filter((item) => item.type === 'perception' && (item?.id.indexOf(device1) !== -1 || item?.id.indexOf(device2) !== -1)).map(it => it.id)
  const devicesArr = [device1, device2, ...ods, ]
  if (cameraChecked.value) {
    devicesArr.push(...cameras)
  }
  if (!device1 || !device2) {
    ElMessage({
      message: "请先选择设备",
      type: 'error',
    })
    return;
  }
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "recordOn",
        "devices": devicesArr,
        "viewport": props.viewportId
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
  // getCurrentPorts()
  const currentSelectedSensorId = state.select1 && state.select2 ? [state.select1, state.select2] : []
  if (!currentSelectedSensorId.length) {
    ElMessage({
      message: "结束采集失败：缺少设备信息",
      type: 'error',
    })
    return;
  }
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "recordOff",
        "devices": currentSelectedSensorId,
        "viewport": props.viewportId
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
const queryCurrentDrivers = async() => {
  allCameraPorts.value = props.viewports[0].devices.filter((item: any) => item.type === 'camera').map((it: any) => it['display-port'])
  await getCurrentStatus(props.viewportId)
}

// 通过action接口获取正在运行的设备
const getLuanchingDevices = () => {
  findAll('/models/actions', {
    'sort': '-created',
    'page[limit]': 1,
    'filter[command]':'startup',
    'filter[viewport]': props.viewportId
  }).then((res: any) => {
    gostore.reset()
    gostore.sync(res.data)
    const actions = gostore.findAll('actions')
    const devices = actions[0] ? actions[0].devices : []
    if (devices && devices.length > 2) {
      runningDevice.value = [{"deviceKey": devices[0]}, {"deviceKey": devices[1]}]
      state.select1 = devices[0]
      state.select2 = devices[1]
    }
  }).catch((err: any) => {
    console.log(err, 'err')
  })
}

// 获取设备调试、采集状态
const getCurrentStatus = (viewportId: string) => {
  try {
    findItem('/viewport_status', viewportId).then((res: any) => {
      testDevice.value = res.data.isluanching || false
      if (testDevice.value) {
        getLuanchingDevices()
      }
      startCollect.value = res.data.isrecording || false
      switchLoading.value = false
      const data = res.data.details.filter((item: any) => (item.deviceKey.indexOf('lidar') > -1 && item.deviceKey.indexOf('lidarod') === -1) && item.isrunning)
      if (data.length > 1) {
        runningDevice.value = data
        state.select1 = data[0]['deviceKey']
        state.select2 = data[1]['deviceKey']
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
  queryCurrentDrivers()
})

onUnmounted(() => {
});

</script>

<style lang="scss" scoped>
.iframe {
  width: 100%;
  height: 250px;
  border: none;
}
.index-page-compare {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  .panel {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

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
    margin: 0;
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
.el-dialog__header {
  display: flex;
}
.event-notification {
  .el-notification__content {
    text-align: left;

    p {
      word-break: break-all;
    }
  }
}
</style>