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
          <div class="tree-controls">
            <el-button size="small" @click="refreshSignalTree" :loading="signalTreeLoading">
              刷新信号树
            </el-button>
            <el-switch 
              v-model="autoRefreshSignalTree" 
              size="small"
              @change="toggleAutoRefreshSignalTree"
              style="margin-left: 8px;"
            />
            <span style="margin-left: 4px; font-size: 12px; color: #666;">自动刷新</span>
          </div>
        </div>
        <div class="tree-container">
          <!-- 当前DBC和信号合集信息 -->
          <div class="current-info" v-if="currentDbc || currentSignalCollection">
            <div class="info-item" v-if="currentDbc">
              <span class="label">当前DBC:</span>
              <span class="value">{{ currentDbc }}</span>
            </div>
            <div class="info-item" v-if="currentSignalCollection">
              <span class="label">当前信号合集:</span>
              <span class="value">{{ currentSignalCollection }}</span>
            </div>
          </div>
          
          <!-- 加载状态 -->
          <div v-if="signalTreeLoading" class="loading-state">
            <el-empty description="正在加载信号树..." />
          </div>
          
          <!-- 信号树 -->
          <el-tree
            v-else
            :data="signalTreeData"
            :props="treeProps"
            @node-click="handleNodeClick"
            :highlight-current="true"
            :expand-on-click-node="false"
            node-key="id"
            default-expand-all>
            <template #default="{ node, data }">
              <el-tooltip
                :content="getNodeTooltipContent(node, data)"
                placement="top"
                :show-after="500"
                :hide-after="0"
                popper-class="signal-tree-tooltip"
              >
                <span class="custom-tree-node">
                  <el-icon v-if="data.type === 'folder'"><Folder /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                  <span>{{ node.label }}</span>
                  <span v-if="data.id && data.size" class="signal-info">
                    (Size: {{ data.size }})
                  </span>
                </span>
              </el-tooltip>
            </template>
          </el-tree>
          
          <!-- 空状态 -->
          <div v-if="!signalTreeLoading && signalTreeData.length === 0" class="empty-state">
            <el-empty description="暂无信号数据" />
          </div>
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
const signalTreeData = ref([])
const currentDbc = ref('')
const currentSignalCollection = ref('')
const signalTreeLoading = ref(false)
const signalTreeRefreshInterval = ref(null)
const autoRefreshSignalTree = ref(true)

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

// 加载当前应用的DBC信号树数据
const loadCurrentDbcSignalTree = async () => {
  signalTreeLoading.value = true
  try {
    // 1. 获取当前使用的DBC文件
    const dbcResponse = await fetch('/can_parser/dbc/current')
    const dbcData = await dbcResponse.json()
    
    if (dbcData.status === 200 && dbcData.data) {
      currentDbc.value = dbcData.data
      console.log('当前DBC:', currentDbc.value)
      
      // 2. 获取DBC文件详情
      const detailResponse = await fetch(`/can_parser/dbc/${dbcData.data}`)
      const detailData = await detailResponse.json()
      
      if (detailData.status === 200 && detailData.data) {
        const dbcDetail = detailData.data
        currentSignalCollection.value = dbcDetail.currentSignalCollectionName
        console.log('当前信号合集:', currentSignalCollection.value)
        
        // 3. 如果有当前使用的信号合集，获取其详情
        if (dbcDetail.currentSignalCollectionName) {
          const collectionResponse = await fetch(`/can_parser/dbc/${dbcData.data}/signal-collections/${dbcDetail.currentSignalCollectionName}`)
          const collectionData = await collectionResponse.json()
          
          if (collectionData.status === 200 && collectionData.data) {
            // 构建信号树数据
            signalTreeData.value = buildSignalTreeFromCollection(collectionData.data, dbcDetail.dbc)
            console.log('从信号合集构建的树:', signalTreeData.value)
          } else {
            // 如果没有信号合集，使用DBC中的所有信号
            signalTreeData.value = buildSignalTreeFromDbc(dbcDetail.dbc)
            console.log('从DBC构建的树:', signalTreeData.value)
          }
        } else {
          // 如果没有信号合集，使用DBC中的所有信号
          signalTreeData.value = buildSignalTreeFromDbc(dbcDetail.dbc)
          console.log('从DBC构建的树:', signalTreeData.value)
        }
      }
    } else {
      console.log('没有当前DBC，使用默认数据')
      signalTreeData.value = []
    }
  } catch (error) {
    console.error('加载DBC信号树失败:', error)
    // 如果API调用失败，使用默认的空数据
    signalTreeData.value = []
  } finally {
    signalTreeLoading.value = false
  }
}

// 刷新信号树
const refreshSignalTree = async () => {
  await loadCurrentDbcSignalTree()
  ElMessage.success('信号树刷新成功')
}

// 切换自动刷新信号树
const toggleAutoRefreshSignalTree = (value: boolean) => {
  if (value) {
    startAutoRefreshSignalTree()
  } else {
    stopAutoRefreshSignalTree()
  }
}

// 开始自动刷新信号树
const startAutoRefreshSignalTree = () => {
  if (signalTreeRefreshInterval.value) {
    clearInterval(signalTreeRefreshInterval.value)
  }
  
  // 每30秒自动刷新一次信号树
  signalTreeRefreshInterval.value = setInterval(async () => {
    if (!signalTreeLoading.value) {
      await loadCurrentDbcSignalTree()
      console.log('自动刷新信号树完成')
    }
  }, 30000)
  
  console.log('开始自动刷新信号树')
}

// 停止自动刷新信号树
const stopAutoRefreshSignalTree = () => {
  if (signalTreeRefreshInterval.value) {
    clearInterval(signalTreeRefreshInterval.value)
    signalTreeRefreshInterval.value = null
  }
  console.log('停止自动刷新信号树')
}

// 获取节点的提示内容
const getNodeTooltipContent = (node: any, data: any) => {
  let content = `节点名称: ${node.label} `
  
  if (data.type === 'signal' && data.id && data.size) {
    content += `\n信号ID: ${data.id}\n数据大小: ${data.size} `
  } else if (data.type === 'folder') {
    content += `\n类型: ${data.type === 'folder' ? '文件夹' : '信号'}`
  }
  
  return content
}

// 从信号合集构建信号树
const buildSignalTreeFromCollection = (collection, dbcData) => {
  if (!collection.signals || !dbcData) return []
  
  const treeData = []
  const nodeMap = new Map() // 用于去重
  
  collection.signals.forEach((signal) => {
    const { nodeName, messageName, signalName } = signal
    
    // 查找或创建DBC节点
    let dbcNode = treeData.find(node => node.id === `dbc_${nodeName}`)
    if (!dbcNode) {
      dbcNode = {
        id: `dbc_${nodeName}`,
        label: `${nodeName} (DBC)`,
        type: 'folder',
        children: []
      }
      treeData.push(dbcNode)
    }
    
    // 查找或创建消息节点
    let messageNode = dbcNode.children.find(node => node.id === `msg_${messageName}`)
    if (!messageNode) {
      messageNode = {
        id: `msg_${messageName}`,
        label: `${messageName}`,
        type: 'folder',
        children: []
      }
      dbcNode.children.push(messageNode)
    }
    
    // 创建信号节点
    const signalNode = {
      id: `signal_${nodeName}_${messageName}_${signalName}`,
      label: signalName,
      type: 'signal',
      size: getSignalSize(dbcData, nodeName, messageName, signalName)
    }
    
    messageNode.children.push(signalNode)
  })
  
  return treeData
}

// 从DBC数据构建信号树
const buildSignalTreeFromDbc = (dbcData) => {
  if (!dbcData) return []
  
  const treeData = []
  
  Object.keys(dbcData).forEach(dbcName => {
    const dbcInfo = dbcData[dbcName]
    const dbcNode = {
      id: `dbc_${dbcName}`,
      label: `${dbcName} (DBC)`,
      type: 'folder',
      children: []
    }
    
    if (dbcInfo.messages) {
      Object.keys(dbcInfo.messages).forEach(messageId => {
        const message = dbcInfo.messages[messageId]
        const messageNode = {
          id: `msg_${message.name || messageId}`,
          label: `${message.name || messageId} (ID: ${messageId})`,
          type: 'folder',
          children: []
        }
        
        if (message.signals) {
          Object.keys(message.signals).forEach(signalName => {
            const signal = message.signals[signalName]
            const signalNode = {
              id: `signal_${dbcName}_${message.name || messageId}_${signalName}`,
              label: signalName,
              type: 'signal',
              size: signal.length || signal.size || 0
            }
            messageNode.children.push(signalNode)
          })
        }
        
        dbcNode.children.push(messageNode)
      })
    }
    
    treeData.push(dbcNode)
  })
  
  return treeData
}

// 获取信号大小
const getSignalSize = (dbcData, nodeName, messageName, signalName) => {
  try {
    // 先查找消息ID对应的消息
    const dbcInfo = dbcData[nodeName]
    if (!dbcInfo || !dbcInfo.messages) return 0
    
    // 查找匹配的消息（可能通过名称或ID查找）
    let targetMessage = null
    Object.keys(dbcInfo.messages).forEach(messageId => {
      const message = dbcInfo.messages[messageId]
      if (message.name === messageName || messageId === messageName) {
        targetMessage = message
      }
    })
    
    if (targetMessage && targetMessage.signals && targetMessage.signals[signalName]) {
      return targetMessage.signals[signalName].length || 
             targetMessage.signals[signalName].size || 0
    }
  } catch (error) {
    console.error('获取信号大小失败:', error)
  }
  return 0
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
  // 加载DBC信号树数据
  loadCurrentDbcSignalTree()
  
  // 启动自动刷新信号树
  if (autoRefreshSignalTree.value) {
    startAutoRefreshSignalTree()
  }
  
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
  
  // 清理信号树自动刷新定时器
  if (signalTreeRefreshInterval.value) {
    clearInterval(signalTreeRefreshInterval.value)
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
    width: 320px; // 增加面板宽度
    min-width: 320px; // 设置最小宽度，防止被压缩

    .tree-container {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      overflow-x: auto; // 添加横向滚动条
      height: calc(100% - 60px); // 减去header高度
      min-width: 0; // 允许容器收缩
      // 设置内容的最小宽度，确保有足够的滚动空间
      & > * {
        min-width: 320px; // 所有子元素都有足够的最小宽度
      }
        
        // 自定义滚动条样式
        &::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          
          &:hover {
            background: #a8a8a8;
          }
        }

        .current-info {
          margin-bottom: 16px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
          min-width: 320px; // 增加最小宽度，确保有足够滚动空间

          .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            white-space: nowrap; // 防止换行
            
            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #666;
              font-size: 12px;
              min-width: 100px; // 增加标签宽度，确保对齐美观
              font-weight: 500;
              flex-shrink: 0; // 防止标签被压缩
            }

            .value {
              color: #333;
              font-size: 12px;
              font-weight: 600;
              background: #e3f2fd;
              padding: 2px 8px;
              border-radius: 4px;
              flex-shrink: 0; // 防止值被压缩
              max-width: 200px; // 增加最大宽度，确保长DBC名称和信号合集名称完整显示
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }

        .loading-state,
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          min-width: 320px; // 增加最小宽度，确保有足够滚动空间
        }

                // 为树形组件添加横向滚动支持
        ::v-deep .el-tree {
          min-width: 320px; // 增加最小宽度，确保有足够滚动空间
          
          .el-tree-node__content {
            min-width: 320px; // 确保节点内容有足够宽度
            white-space: nowrap; // 防止节点内容换行
            padding-right: 16px; // 增加右侧内边距，确保内容不被截断
          }
          
          // 为树节点添加更多样式
          .el-tree-node {
            width: 100%;
            
            .el-tree-node__children {
              width: 100%;
            }
          }
        }
        
        // 自定义tooltip样式
        ::v-deep .signal-tree-tooltip {
          max-width: 300px !important;
          
          .el-tooltip__content {
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-line;
          }
        }

        .custom-tree-node {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #333;
          min-width: 320px; // 增加最小宽度，确保有足够滚动空间
          white-space: nowrap; // 防止换行
          width: 100%; // 占满可用宽度

          .el-icon {
            font-size: 16px;
            color: #666;
            flex-shrink: 0; // 防止图标被压缩
          }

          span {
            // flex: 1; // 让文本内容占据剩余空间
            min-width: 0; // 允许文本收缩
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .signal-info {
            color: #999;
            font-size: 12px;
            margin-left: 8px;
            flex-shrink: 0; // 防止信号信息被压缩
            white-space: nowrap; // 防止换行
            max-width: 220px; // 进一步增加最大宽度，确保长ID和Size信息完整显示
            overflow: hidden;
            text-overflow: ellipsis;
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