<template>
  <div class="index-page" >
    <!-- :element-loading-text="loadingtext"
    v-loading="pageLoading" > -->
    <!-- <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集</el-breadcrumb-item>
    </el-breadcrumb> -->
    <div class="panel">
      <div class="title-panel">
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备初始化</div>
          <el-switch v-model="testDevice" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="testDeviceChange"/>
        </div>
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备采集</div>
          <el-switch v-model="startCollect" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="startCollectChange"/>
        </div>
        <div class="dialog-error-desc" v-show="dialogFormVisible">
          {{dialogErrorDesc}}
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 第一列：信号树 -->
      <div class="signal-tree-panel">
        <div class="panel-header">
          <h3>信号选择</h3>
        </div>
        <div class="tree-container">
          <el-tree
            :data="signalTreeData"
            :props="treeProps"
            @node-click="handleNodeClick"
            :highlight-current="true"
            :expand-on-click-node="false"
            node-key="id"
            default-expand-all>
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <el-icon v-if="data.type === 'folder'"><Folder /></el-icon>
                <el-icon v-else><Document /></el-icon>
                <span>{{ node.label }}</span>
                <span v-if="data.id && data.size" class="signal-info">
                  (ID: {{ data.id }}, Size: {{ data.size }})
                </span>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 第二列：信号折线图 -->
      <div class="signal-chart-panel">
        <div class="panel-header">
          <h3>{{ selectedNodeTitle }}</h3>
          <div class="chart-controls">
            <el-button size="small" @click="refreshChart">刷新</el-button>
            <el-button size="small" @click="toggleAutoRefresh">
              {{ autoRefresh ? '停止自动刷新' : '开始自动刷新' }}
            </el-button>
          </div>
        </div>
        <div class="chart-container" v-if="selectedNode">
          <div class="chart-info">
            <div class="info-item">
              <span class="label">信号名称:</span>
              <span class="value">{{ selectedNode.label }}</span>
            </div>
            <div class="info-item">
              <span class="label">信号ID:</span>
              <span class="value">{{ selectedNode.id || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">数据大小:</span>
              <span class="value">{{ selectedNode.size || 'N/A' }}</span>
            </div>
          </div>
          <div class="chart-wrapper">
            <div ref="chartRef" class="chart"></div>
          </div>
        </div>
        <div class="no-selection" v-else>
          <el-empty description="请选择左侧信号节点查看数据图表" />
        </div>
      </div>

      <!-- 第三列：点云展示区域 -->
      <div class="point-cloud-panel">
        <div class="panel-header">
          <h3>点云可视化</h3>
        </div>
        <div class="point-cloud-container">
          <BasicScene 
            :allports="allports"
            :cloudpointparams="cloudpointparams"
            :currentSelectedSensor="currentSelectedSensor"  />
        </div>
      </div>

      <!-- 第四列：配置信息 -->
      <div class="config-panel">
        <div class="panel-header">
          <h3>设备配置</h3>
        </div>
        <div class="config-container">
          <sensorConfigs
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

    <!-- <el-dialog 
      v-model="dialogFormVisible"
      :show-close="false"
      :close-on-click-modal="false"
      modal-class="dialogClassImg"
      width="40%"
      >
        <img class="img-error" src="http://loggertrash/icon/default/warning.gif" alt="">
        <div class="text-error">{{ dialogErrorDesc }}</div>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="closeDialogFormVisible">
               关闭
            </el-button>
          </div>
        </template>
    </el-dialog> -->
  </div>
</template>

<script setup lang="ts">
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification, ElTree, ElIcon, ElEmpty } from 'element-plus';
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue';
import { addItem, findAll, findItem, deleteItem } from '@/api/jsonApi'
// import PointView from '@/components/visualization/PointView.vue'
import BasicScene from '@/components/visualization/index/BasicScene.vue'
import DisplayPanel from '@/components/visualization/index/DisplayPanel.vue'
import sensorConfigs from '@/components/visualization/index/sensorConfigs.vue'
import gostore from '@/services/governance-store'
import { MoreFilled, Monitor, Cpu, Folder, Document } from "@element-plus/icons-vue"
import { useRouter, useRoute } from 'vue-router';
// import * as echarts from 'echarts';

// 获取当前路由对象
const router = useRouter();
const route = useRoute()
// 创建响应式变量
const message = ref(null); // 用于存储 SSE 消息
const messageHigh = ref(null); // 用于存储 SSE cpu负载过高消息
const error = ref(null);   // 用于存储错误信息
let eventSource = null;    // 存储 EventSource 对象
const dialogFormVisible = ref(false)
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

// 信号树数据和图表相关变量
const signalTreeData = ref([
  {
    id: 'aflm',
    label: 'AFLM (AFLM)',
    type: 'folder',
    children: [
      {
        id: '1069',
        label: 'AFLS_MAIN_LIGHTS_Rx_QM',
        type: 'signal',
        size: 5
      },
      {
        id: '1070',
        label: 'AFLS_MAIN_LIGHTS_Lx_QM',
        type: 'signal',
        size: 5
      },
      {
        id: '2564485488',
        label: 'DIAGNOSTIC_RESPONSE_AFLM',
        type: 'signal',
        size: 8
      },
      {
        id: '2651930653',
        label: 'CFG_DATA_CODE_RSP_AFLM',
        type: 'signal',
        size: 6
      },
      {
        id: '2654339101',
        label: 'STATUS_C_AFLM',
        type: 'signal',
        size: 1
      },
      {
        id: '2658971433',
        label: 'ECU_APPL_AFLM',
        type: 'signal',
        size: 8
      }
    ]
  },
  {
    id: 'ahcp',
    label: 'AHCP (AHCP)',
    type: 'folder',
    children: [
      {
        id: '2001',
        label: 'AHCP_STATUS_SIGNAL',
        type: 'signal',
        size: 4
      },
      {
        id: '2002',
        label: 'AHCP_CONTROL_SIGNAL',
        type: 'signal',
        size: 3
      },
      {
        id: '2003',
        label: 'AHCP_CONFIG_SIGNAL',
        type: 'signal',
        size: 6
      }
    ]
  },
  {
    id: 'abs',
    label: 'ABS (ABS)',
    type: 'folder',
    children: [
      {
        id: '3001',
        label: 'ABS_WHEEL_SPEED_FL',
        type: 'signal',
        size: 2
      },
      {
        id: '3002',
        label: 'ABS_WHEEL_SPEED_FR',
        type: 'signal',
        size: 2
      },
      {
        id: '3003',
        label: 'ABS_WHEEL_SPEED_RL',
        type: 'signal',
        size: 2
      },
      {
        id: '3004',
        label: 'ABS_WHEEL_SPEED_RR',
        type: 'signal',
        size: 2
      }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

const selectedNode = ref(null)
const selectedNodeTitle = ref('请选择信号节点')
const chartRef = ref(null)
const chartInstance = ref(null)
const autoRefresh = ref(false)
const refreshInterval = ref(null)

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
  if (!testDevice.value) {
    ElMessage({
      message: "请先初始化设备",
      type: 'error',
    })
    switchLoading.value = false
    startCollect.value = false
    return;
  }
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

let messageInterval = null;  // 用于存储定时器
let lastMessageTime = null;  // 记录最后接收到消息的时间
const dialogErrorDesc = ref('')

const open = (msg) => {
  if (testDevice.value) {
    dialogFormVisible.value = true
    dialogErrorDesc.value = msg
  }
}

// 关闭弹窗
const closeModal = () => {
  dialogFormVisible.value = false
  dialogErrorDesc.value = ''
  clearInterval(messageInterval);  // 清除定时器
};

const closeDialogFormVisible = () => {
  closeModal()
  shutdownDevice()
  testDevice.value = false
}

onMounted(() => {
  queryCurrentDrivers()
  // 建立普通警告长连接
  eventSource = new EventSource(
    `${window.server.mecPrefix}/api/logger/events/alert?channel=high`,
    { withCredentials: true }
  )
  eventSource.addEventListener('high', (event) => {
    messageHigh.value = JSON.parse(event.data); // 更新最新消息
    const desc = `警告: ${messageHigh.value?.commonAnnotations?.description}`
    open(desc)
    // 每次收到消息时更新最后接收到消息的时间
    lastMessageTime = Date.now();
    
    // 如果弹窗已经打开，刷新定时器
    if (messageInterval) {
      clearInterval(messageInterval);
    }
    
    // 开启定时器，每秒检查一次
    messageInterval = setInterval(() => {
      if (Date.now() - lastMessageTime > 5000) {
        closeModal();
      }
    }, 1000);
  })

  // 监听服务器发送的消息
  eventSource.addEventListener('message', (event) => {
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
  })
  // 监听错误事件
  eventSource.onerror = () => {
    error.value = '连接失败或服务器错误';
    eventSource.close(); // 关闭连接
  };
})

// 树形选择相关函数
const handleNodeClick = (data) => {
  // 只处理叶子节点（没有children的节点）
  if (!data.children || data.children.length === 0) {
    selectedNode.value = data
    selectedNodeTitle.value = data.label
    nextTick(() => {
      initChart()
    })
  }
}



// 生成模拟数据
const generateMockData = (signalId) => {
  const now = new Date()
  const data = []
  const times = []
  
  for (let i = 29; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 1000)
    times.push(time.toLocaleTimeString('zh-CN', { hour12: false }))
    
    // 根据信号ID生成不同的数据模式
    let value
    const baseValue = parseInt(signalId) % 100 || 50
    const variation = Math.sin(i * 0.3) * 20 + Math.random() * 10
    
    value = Math.max(0, baseValue + variation)
    data.push(value.toFixed(2))
  }
  
  return { times, data }
}

// 初始化图表
const initChart = () => {
  if (!selectedNode.value || !chartRef.value) return
  
  const { times, data } = generateMockData(selectedNode.value.id)
  
  // 获取容器尺寸
  const containerWidth = chartRef.value.clientWidth || 600
  const containerHeight = chartRef.value.clientHeight || 300
  
  // 使用Canvas绘制简单折线图
  const canvas = document.createElement('canvas')
  canvas.width = containerWidth
  canvas.height = containerHeight
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.maxHeight = '300px' // 限制最大高度
  
  // 清空容器
  chartRef.value.innerHTML = ''
  chartRef.value.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  
  // 设置背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制网格
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1
  
  // 水平网格线
  for (let i = 0; i <= 10; i++) {
    const y = (canvas.height - 60) * i / 10 + 30
    ctx.beginPath()
    ctx.moveTo(60, y)
    ctx.lineTo(canvas.width - 20, y)
    ctx.stroke()
  }
  
  // 垂直网格线
  for (let i = 0; i <= 10; i++) {
    const x = (canvas.width - 80) * i / 10 + 60
    ctx.beginPath()
    ctx.moveTo(x, 30)
    ctx.lineTo(x, canvas.height - 30)
    ctx.stroke()
  }
  
  // 绘制坐标轴
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(60, 30)
  ctx.lineTo(60, canvas.height - 30)
  ctx.lineTo(canvas.width - 20, canvas.height - 30)
  ctx.stroke()
  
  // 绘制数据点
  const maxValue = Math.max(...data.map(v => parseFloat(v)))
  const minValue = Math.min(...data.map(v => parseFloat(v)))
  const range = maxValue - minValue || 1
  
  ctx.strokeStyle = '#13ce66'
  ctx.lineWidth = 3
  ctx.fillStyle = '#13ce66'
  
  // 绘制折线
  ctx.beginPath()
  data.forEach((value, index) => {
    const x = 60 + (canvas.width - 80) * index / (data.length - 1)
    const y = canvas.height - 30 - (parseFloat(value) - minValue) / range * (canvas.height - 60)
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
  
  // 绘制数据点
  data.forEach((value, index) => {
    const x = 60 + (canvas.width - 80) * index / (data.length - 1)
    const y = canvas.height - 30 - (parseFloat(value) - minValue) / range * (canvas.height - 60)
    
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
  })
  
  // 绘制标题
  ctx.fillStyle = '#333'
  ctx.font = '14px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(`${selectedNode.value.label} (ID: ${selectedNode.value.id})`, canvas.width / 2, 20)
  
  // 绘制Y轴标签
  ctx.textAlign = 'right'
  ctx.font = '12px Arial'
  for (let i = 0; i <= 5; i++) {
    const value = minValue + range * i / 5
    const y = canvas.height - 30 - (canvas.height - 60) * i / 5
    ctx.fillText(value.toFixed(1), 55, y + 4)
  }
  
  // 绘制X轴标签
  ctx.textAlign = 'center'
  ctx.font = '10px Arial'
  for (let i = 0; i < times.length; i += 3) {
    const x = 60 + (canvas.width - 80) * i / (times.length - 1)
    ctx.fillText(times[i], x, canvas.height - 10)
  }
  
  chartInstance.value = canvas
}

// 刷新图表
const refreshChart = () => {
  if (selectedNode.value) {
    initChart()
  }
}

// 切换自动刷新
const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      refreshChart()
    }, 3000) // 每3秒刷新一次
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
  }
}

onUnmounted(() => {
  // 在组件卸载时关闭 SSE 连接
  if (eventSource) {
    eventSource.close();
  }
  
  // 清理定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
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
    align-items: center;

    .dialog-error-desc {
      color: red;
      font-size: 18px;
      margin-left: 20px;
    }
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

  // 新增布局样式
  .main-content {
    display: flex;
    flex: 1;
    gap: 16px;
    margin-top: 20px;
    height: calc(100vh - 300px); // 更合理的高度，防止拉伸
    min-height: 600px; // 设置最小高度
  }

  // 通用面板样式
  .signal-tree-panel,
  .signal-chart-panel,
  .point-cloud-panel,
  .config-panel {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    height: 100%; // 固定高度

    .panel-header {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        color: #333;
        font-size: 16px;
      }

      .chart-controls {
        display: flex;
        gap: 8px;
      }
    }
  }

  // 第一列：信号树
  .signal-tree-panel {
    width: 280px;

    .tree-container {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      height: calc(100% - 60px); // 减去header高度

      .custom-tree-node {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #333;

        .el-icon {
          font-size: 16px;
          color: #666;
        }

        .signal-info {
          color: #999;
          font-size: 12px;
          margin-left: 8px;
        }
      }
    }
  }

  // 第二列：信号折线图
  .signal-chart-panel {
    width: 350px;
    height: 100%;

    .chart-container {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: calc(100% - 60px); // 减去header高度
      max-height: 400px; // 限制最大高度

      .chart-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        flex-shrink: 0; // 防止压缩

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;

          .label {
            color: #666;
            font-size: 12px;
            min-width: 60px;
          }

          .value {
            color: #333;
            font-weight: 500;
            font-size: 12px;
          }
        }
      }

      .chart-wrapper {
        flex: 1;
        position: relative;
        min-height: 0; // 重要：允许flex子项收缩
        max-height: 300px; // 限制最大高度

        .chart {
          width: 100%;
          height: 100%;
          min-height: 200px;
          max-height: 300px; // 限制最大高度
        }
      }
    }

    .no-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(100% - 60px); // 减去header高度
    }
  }

  // 第三列：点云展示区域
  .point-cloud-panel {
    flex: 1;

    .point-cloud-container {
      flex: 1;
      padding: 16px;
      height: calc(100% - 60px); // 减去header高度
    }
  }

  // 第四列：配置信息
  .config-panel {
    width: 300px;

    .config-container {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      height: calc(100% - 60px); // 减去header高度
    }
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

.alert-box {
  .el-button--primary {
    background: #f56c6c;
    border: none;
  }
}
.dialogClassImg {
  .el-dialog {
    background: #000;
  }
  .el-dialog__body {
    padding: 0;
    background: #000;
  }
  .el-dialog__header {
    display: none;
  }
  .img-error {
    width: auto;
    height: 50vh;
  }
  .text-error {
    background: #000;
    color: #fff;
    font-size: 18px;
    text-align: center;
    margin: 0 0 20px;
  }
  .el-dialog__footer {
    background: #000;
  }
}
</style>