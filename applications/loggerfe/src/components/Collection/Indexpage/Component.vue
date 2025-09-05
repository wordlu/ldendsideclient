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
          <!-- WebSocket 连接状态 -->
          <div class="websocket-status">
            <div class="status-item">
              <span class="label">WebSocket:</span>
              <span class="value" :class="{ 'connected': websocketConnected, 'disconnected': !websocketConnected }">
                {{ websocketStatus }}
              </span>
            </div>
          </div>
          
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
              <span class="label">{{ selectedNode.size || 'N/A' }}</span>
            </div>
            <!-- 实时数据显示 -->
            <div class="info-item" v-if="realTimeData">
              <span class="label">当前值:</span>
              <span class="value real-time">{{ realTimeData.currentValue }}</span>
            </div>
            <div class="info-item" v-if="realTimeData">
              <span class="label">更新时间:</span>
              <span class="value">{{ realTimeData.timestamp }}</span>
            </div>
            <div class="info-item" v-if="realTimeData">
              <span class="label">数据点数:</span>
              <span class="value">{{ realTimeData.dataPoints }}</span>
            </div>
            <!-- 实时更新状态 -->
            <div class="info-item">
              <span class="label">更新状态:</span>
              <span class="value" :class="{ 'updating': websocketConnected && selectedSignalName, 'idle': !websocketConnected || !selectedSignalName }">
                {{ websocketConnected && selectedSignalName ? '实时更新中' : '等待数据' }}
              </span>
            </div>
            <!-- 最后更新时间 -->
            <div class="info-item" v-if="lastChartUpdate">
              <span class="label">图表更新:</span>
              <span class="value">{{ lastChartUpdate }}</span>
            </div>
            <!-- 实时更新频率 -->
            <div class="info-item">
              <span class="label">更新频率:</span>
              <span class="value updating">500ms</span>
            </div>
          </div>
          <!-- 调试控制按钮 -->
          <div class="debug-controls" v-if="websocketConnected">
            <!-- <div class="debug-header"> -->
              <div class="debug-buttons" style="display: flex; align-items: center;">
                <el-button size="small" type="primary" @click="testDataFlow">测试数据流</el-button>
                <el-button size="small" type="success" @click="testWebSocketMessage">测试WS消息</el-button>
                <el-button size="small" type="info" @click="refreshDebugInfo">刷新</el-button>
                <el-button size="small" type="warning" @click="clearDebugInfo">清空</el-button>
              </div>
            <!-- </div> -->
          </div>
          
          <div class="chart-wrapper">
            <div ref="chartRef" class="chart"></div>
          </div>
          
          <!-- 调试信息显示区域 -->
          <div class="debug-info" v-if="websocketConnected">
            
            <!-- 连接状态 -->
            <div class="debug-section">
              <div class="section-title">连接状态</div>
              <div class="debug-content">
                <div class="debug-item">
                  <span class="label">状态:</span>
                  <span class="value" :class="{ 'connected': websocketConnected, 'disconnected': !websocketConnected }">
                    {{ websocketStatus }}
                  </span>
                </div>
                <div class="debug-item">
                  <span class="label">连接地址:</span>
                  <span class="value">ws://10.86.14.25:8001/ros_ws</span>
                </div>
                <div class="debug-item">
                  <span class="label">连接状态:</span>
                  <span class="value">{{ getWebSocketState() }}</span>
                </div>
                <div class="debug-item">
                  <span class="label">最后更新:</span>
                  <span class="value">{{ lastWebSocketUpdate || '无' }}</span>
                </div>
                <div class="debug-item">
                  <span class="label">消息计数:</span>
                  <span class="value">{{ websocketMessageCount }}</span>
                </div>
              </div>
            </div>
            
            <!-- 原始数据 -->
            <!-- <div class="debug-section">
              <div class="section-title">原始数据 (最新5条)</div>
              <div class="debug-content">
                <div v-if="rawWebSocketData.length === 0" class="no-data">
                  暂无数据
                </div>
                <div v-else class="raw-data-list">
                  <div v-for="(item, index) in rawWebSocketData.slice(-5)" :key="index" class="raw-data-item">
                    <div class="data-header">
                      <span class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
                      <span class="topic-name">{{ item.topic_name }}</span>
                    </div>
                    <div class="data-content">
                      <pre>{{ JSON.stringify(item, null, 2) }}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
            
            <!-- 解析后的信号数据 -->
            <!-- <div class="debug-section">
              <div class="section-title">解析后的信号数据</div>
              <div class="debug-content">
                <div v-if="parsedSignalData.length === 0" class="no-data">
                  暂无解析数据
                </div>
                <div v-else class="parsed-data-list">
                  <div v-for="(item, index) in parsedSignalData.slice(-5)" :key="index" class="parsed-data-item">
                    <div class="data-header">
                      <span class="timestamp">{{ formatTimestamp(item.timestamp) }}</span>
                      <span class="signal-name">{{ item.signalName }}</span>
                      <span class="signal-value">{{ item.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
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
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification, ElTree, ElIcon, ElEmpty, ElTooltip } from 'element-plus';
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

// 导入 WebSocket 和信号数据管理相关模块
import { WebSocketManager } from '@/utils/websocket-manager';
import { SignalDataManager } from '@/utils/signal-data-manager';
import { RosTopicMessage } from '@/utils/flatbuffers-parser';

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

// WebSocket 和信号数据管理相关变量
const websocketManager = ref<WebSocketManager | null>(null)
const signalDataManager = ref<SignalDataManager | null>(null)
const websocketConnected = ref(false)
const websocketStatus = ref('未连接')
const selectedSignalName = ref('')
const realTimeData = ref<any>(null)

// 调试信息相关变量
const rawWebSocketData = ref<any[]>([])
const parsedSignalData = ref<any[]>([])
const websocketMessageCount = ref(0)
const lastWebSocketUpdate = ref('')
const lastChartUpdate = ref('')

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
  
  // 初始化 WebSocket 连接
  initWebSocket()
  
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
    console.log('选中信号节点:', data);
    
    selectedNode.value = data
    selectedNodeTitle.value = data.label
    selectedSignalName.value = data.label // 设置选中的信号名称
    
    console.log('设置选中的信号名称:', selectedSignalName.value);
    
    // 如果 WebSocket 已连接，开始监听该信号的数据
    if (websocketConnected.value && signalDataManager.value) {
      console.log('WebSocket 已连接，开始信号监控');
      startSignalMonitoring(data.label)
    } else {
      console.log('WebSocket 未连接或信号数据管理器未初始化');
      console.log('websocketConnected:', websocketConnected.value);
      console.log('signalDataManager:', !!signalDataManager.value);
    }
    
    nextTick(() => {
      console.log('初始化图表...');
      initChart()
    })
  }
}

// WebSocket 连接管理
const initWebSocket = () => {
  try {
    // 创建信号数据管理器
    signalDataManager.value = new SignalDataManager(100);

    // 尝试连接到真实的 WebSocket 服务器
    websocketManager.value = new WebSocketManager({
      url: 'ws://10.86.14.25:8001/ros_ws',
      reconnectInterval: 3000,
      maxReconnectAttempts: 10 // 增加重连次数，确保连接稳定
    });

    // 添加连接状态处理器
    websocketManager.value.addConnectionHandler((connected: boolean) => {
      console.log('WebSocket 连接状态变化:', connected);
      websocketConnected.value = connected;
      websocketStatus.value = connected ? '已连接' : '未连接';
      
      if (connected) {
        ElMessage.success('WebSocket 连接已建立');
        console.log('WebSocket 连接成功，开始监听消息');
        // 如果已有选中的信号，开始监听
        if (selectedSignalName.value && signalDataManager.value) {
          startSignalMonitoring(selectedSignalName.value);
        }
      } else {
        ElMessage.warning('WebSocket 连接已断开');
        console.log('WebSocket 连接断开，尝试重连...');
        // 连接失败时启动模拟模式
        startMockMode();
      }
    });

    // 添加消息处理器
    websocketManager.value.addMessageHandler((message: RosTopicMessage) => {
      console.log('WebSocket 接收到消息:', message);
      console.log('消息类型:', typeof message);
      console.log('消息结构:', JSON.stringify(message, null, 2));
      
      if (signalDataManager.value) {
        signalDataManager.value.processRosMessage(message);
      }
      
      // 添加到调试信息
      console.log('准备调用 addDebugInfo...');
      addDebugInfo(message);
      console.log('addDebugInfo 调用完成');
      
      // 实时更新：如果有选中的信号，立即更新图表
      if (selectedSignalName.value && signalDataManager.value) {
        console.log('接收到新数据，立即更新图表:', selectedSignalName.value);
        // 延迟一小段时间确保数据处理完成
        setTimeout(() => {
          updateChartWithRealData(selectedSignalName.value);
        }, 100);
      }
    });
    
    // 测试消息处理器是否正常工作
    console.log('消息处理器已注册，等待消息...');

    // 连接到 WebSocket 服务器
    console.log('开始连接 WebSocket...');
    websocketManager.value.connect().then(() => {
      console.log('WebSocket 连接请求已发送');
      
      // 连接成功后，立即检查连接状态
      setTimeout(() => {
        if (websocketManager.value) {
          const ws = (websocketManager.value as any).ws;
          if (ws && ws.readyState === 1) {
            console.log('WebSocket 连接成功！');
            websocketConnected.value = true;
            websocketStatus.value = '已连接';
            ElMessage.success('WebSocket 连接成功');
            
            // 如果已有选中的信号，开始监听
            if (selectedSignalName.value && signalDataManager.value) {
              startSignalMonitoring(selectedSignalName.value);
            }
          } else {
            console.log('WebSocket 连接状态异常:', ws?.readyState);
            startMockMode();
          }
        }
      }, 1000);
      
    }).catch(error => {
      console.error('WebSocket 连接失败:', error);
      ElMessage.error('WebSocket 连接失败: ' + error.message);
      startMockMode();
    });
    
    // 监控 WebSocket 状态变化
    let connectionCheckInterval = setInterval(() => {
      if (websocketManager.value) {
        const ws = (websocketManager.value as any).ws;
        if (ws) {
          console.log('WebSocket 状态:', ws.readyState);
          console.log('WebSocket 连接数:', ws.bufferedAmount);
          console.log('WebSocket URL:', ws.url);
        }
      }
    }, 5000);
    
    // 清理定时器
    onUnmounted(() => {
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    });

  } catch (error) {
    console.error('初始化 WebSocket 失败:', error);
    ElMessage.warning('初始化 WebSocket 失败，启动模拟模式: ' + error.message);
    startMockMode();
  }
};

// 启动模拟模式，生成模拟数据来测试实时更新
const startMockMode = () => {
  websocketStatus.value = '模拟模式';
  websocketConnected.value = false;
  
  ElMessage.warning('WebSocket 连接失败，启动模拟模式进行测试');
  
  // 启动模拟数据生成器
  startMockDataGenerator();
};

// 模拟数据生成器
let mockDataInterval = null;
const startMockDataGenerator = () => {
  if (mockDataInterval) {
    clearInterval(mockDataInterval);
  }
  
  mockDataInterval = setInterval(() => {
    if (selectedSignalName.value && signalDataManager.value) {
      // 生成模拟数据
      const mockValue = Math.random() * 100;
      const mockTimestamp = Date.now();
      
      console.log('生成模拟数据:', selectedSignalName.value, mockValue);
      
      // 添加到信号数据管理器
      signalDataManager.value.addSignalData(selectedSignalName.value, mockValue, mockTimestamp);
      
      // 立即更新图表
      updateChartWithRealData(selectedSignalName.value);
      
      // 更新调试信息
      websocketMessageCount.value++;
      lastWebSocketUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      
      // 更新实时数据
      if (realTimeData.value) {
        realTimeData.value.currentValue = mockValue;
        realTimeData.value.timestamp = new Date(mockTimestamp).toLocaleTimeString('zh-CN', { hour12: false });
        realTimeData.value.dataPoints++;
      }
    }
  }, 1000); // 每秒生成一个模拟数据点
  
  console.log('模拟数据生成器已启动');
};

// 添加调试信息
const addDebugInfo = (message: RosTopicMessage) => {
  console.log('addDebugInfo 被调用，消息:', message);
  
  // 添加原始数据
  rawWebSocketData.value.push({
    ...message,
    timestamp: Date.now()
  });
  
  // 限制原始数据数量，最多保存20条
  if (rawWebSocketData.value.length > 20) {
    rawWebSocketData.value = rawWebSocketData.value.slice(-20);
  }
  
  // 更新消息计数
  websocketMessageCount.value++;
  lastWebSocketUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  
  console.log('原始数据数组长度:', rawWebSocketData.value.length);
  console.log('消息计数:', websocketMessageCount.value);
  
  // 尝试解析信号数据
  console.log('检查消息结构...');
  console.log('message.data:', message.data);
  console.log('message.data.raw_str:', message.data?.raw_str);
  console.log('message.data.raw_str?.raw_data:', message.data?.raw_str?.raw_data);
  
  if (message.data?.raw_str?.raw_data) {
    try {
      const rawData = message.data.raw_str.raw_data;
      console.log('原始数据内容:', rawData);
      
      const parsedData = parseRawDataToSignals(rawData, message.timestamp);
      console.log('解析后的信号数据:', parsedData);
      
      // 添加解析后的信号数据
      parsedData.forEach(signal => {
        parsedSignalData.value.push({
          ...signal,
          timestamp: Date.now()
        });
        
        // 重要：将解析后的信号数据添加到信号数据管理器
        if (signal.signalName && typeof signal.value === 'number') {
          console.log(`添加信号数据到管理器: ${signal.signalName} = ${signal.value}`);
          signalDataManager.value.addSignalData(signal.signalName, signal.value, message.timestamp / 1000000);
        }
      });
      
      // 限制解析数据数量，最多保存20条
      if (parsedSignalData.value.length > 20) {
        parsedSignalData.value = parsedSignalData.value.slice(-20);
      }
      
      console.log('解析数据数组长度:', parsedSignalData.value.length);
    } catch (error) {
      console.error('解析信号数据失败:', error);
    }
  } else {
    console.log('消息中没有 raw_str 或 raw_data，尝试其他字段...');
    
    // 尝试其他可能的数据字段
    if (message.data) {
      console.log('可用的数据字段:', Object.keys(message.data));
      
      // 如果直接有数据字段，尝试解析
      Object.keys(message.data).forEach(key => {
        const value = message.data[key];
        if (typeof value === 'string' && (value.includes('{') || value.includes('='))) {
          console.log(`尝试解析字段 ${key}:`, value);
          try {
            const parsedData = parseRawDataToSignals(value, message.timestamp);
            if (parsedData.length > 0) {
              parsedData.forEach(signal => {
                parsedSignalData.value.push({
                  ...signal,
                  timestamp: Date.now()
                });
                
                // 重要：将解析后的信号数据添加到信号数据管理器
                if (signal.signalName && typeof signal.value === 'number') {
                  console.log(`字段 ${key} 解析成功，添加信号: ${signal.signalName} = ${signal.value}`);
                  signalDataManager.value.addSignalData(signal.signalName, signal.value, message.timestamp / 1000000);
                }
              });
              console.log(`字段 ${key} 解析成功，添加了 ${parsedData.length} 个信号`);
            }
          } catch (error) {
            console.error(`解析字段 ${key} 失败:`, error);
          }
        }
      });
    }
  }
  
  // 如果有选中的信号，实时更新图表
  if (selectedSignalName.value && signalDataManager.value) {
    console.log('检测到选中信号，准备更新图表:', selectedSignalName.value);
    
    // 检查是否有有效数据
    const currentData = signalDataManager.value.getChartData(selectedSignalName.value);
    if (currentData && currentData.times && currentData.values && currentData.values.length > 0) {
      console.log('有有效数据，立即更新图表');
      updateChartWithRealData(selectedSignalName.value);
    } else {
      console.log('暂无有效数据，等待数据...');
    }
    
    // 设置定时器，持续更新图表（但只在有数据时更新）
    if (window.chartUpdateTimer) {
      clearInterval(window.chartUpdateTimer);
    }
    
    // 更智能的更新：只在有数据时更新
    window.chartUpdateTimer = setInterval(() => {
      if (selectedSignalName.value && signalDataManager.value) {
        const data = signalDataManager.value.getChartData(selectedSignalName.value);
        if (data && data.times && data.values && data.values.length > 0) {
          console.log('定时器触发图表更新:', selectedSignalName.value);
          updateChartWithRealData(selectedSignalName.value);
        } else {
          console.log('定时器检查：暂无有效数据');
        }
      }
    }, 1000); // 降低更新频率，减少无效更新
  }
};

// 解析原始数据为信号数据
const parseRawDataToSignals = (rawData: string, timestamp: number): any[] => {
  console.log('parseRawDataToSignals 开始解析:', rawData);
  console.log('数据类型:', typeof rawData);
  console.log('数据长度:', rawData?.length);
  
  if (!rawData || typeof rawData !== 'string') {
    console.log('原始数据无效，返回空数组');
    return [];
  }
  
  const signals: any[] = [];
  
  try {
    // 尝试解析为 JSON
    const data = JSON.parse(rawData);
    console.log('JSON 解析成功:', data);
    console.log('JSON 数据类型:', typeof data);
    console.log('JSON 数据键:', Object.keys(data));
    
    if (data.signals) {
      console.log('找到 signals 字段:', data.signals);
      // 如果有 signals 字段，遍历所有信号
      Object.keys(data.signals).forEach(signalName => {
        const value = data.signals[signalName];
        console.log(`检查信号 ${signalName}:`, value, '类型:', typeof value);
        if (typeof value === 'number' || !isNaN(parseFloat(value))) {
          const numValue = typeof value === 'number' ? value : parseFloat(value);
          signals.push({
            signalName,
            value: numValue,
            timestamp: timestamp / 1000000
          });
          console.log(`添加信号: ${signalName} = ${numValue}`);
        }
      });
    } else {
      console.log('没有 signals 字段，尝试直接解析');
      // 尝试从其他字段中提取数值
      Object.keys(data).forEach(key => {
        const value = data[key];
        console.log(`检查字段 ${key}:`, value, '类型:', typeof value);
        if (typeof value === 'number' || !isNaN(parseFloat(value))) {
          const numValue = typeof value === 'number' ? value : parseFloat(value);
          signals.push({
            signalName: key,
            value: numValue,
            timestamp: timestamp / 1000000
          });
          console.log(`添加信号: ${key} = ${numValue}`);
        }
      });
    }
  } catch (error) {
    console.log('JSON 解析失败，尝试文本解析:', error);
    // 如果不是 JSON，尝试其他解析方式
    const pattern = /(\w+)=([^,\s]+)/g;
    let match;
    
    while ((match = pattern.exec(rawData)) !== null) {
      const signalName = match[1];
      const valueStr = match[2];
      const value = parseFloat(valueStr);
      
      if (!isNaN(value)) {
        signals.push({
          signalName,
          value,
          timestamp: timestamp / 1000000
        });
        console.log(`文本解析添加信号: ${signalName} = ${value}`);
      }
    }
  }
  
  console.log('最终解析结果:', signals);
  console.log('解析到的信号数量:', signals.length);
  return signals;
};

// 格式化时间戳
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false });
};

// 清空调试信息
const clearDebugInfo = () => {
  rawWebSocketData.value = [];
  parsedSignalData.value = [];
  websocketMessageCount.value = 0;
  lastWebSocketUpdate.value = '';
  ElMessage.success('调试信息已清空');
};

// 刷新调试信息
const refreshDebugInfo = () => {
  console.log('刷新调试信息...');
  console.log('原始数据数组:', rawWebSocketData.value);
  console.log('原始数据数组:', rawWebSocketData.value);
  console.log('解析数据数组:', parsedSignalData.value);
  console.log('消息计数:', websocketMessageCount.value);
  console.log('最后更新:', lastWebSocketUpdate.value);
  
  // 强制触发响应式更新
  rawWebSocketData.value = [...rawWebSocketData.value];
  parsedSignalData.value = [...parsedSignalData.value];
  
  ElMessage.success('调试信息已刷新');
};

// 测试数据流
const testDataFlow = () => {
  console.log('=== 开始测试数据流 ===');
  
  // 检查当前状态
  console.log('当前选中信号:', selectedSignalName.value);
  console.log('WebSocket 连接状态:', websocketConnected.value);
  console.log('信号数据管理器:', !!signalDataManager.value);
  
  if (selectedSignalName.value && signalDataManager.value) {
    // 检查当前数据状态
    const currentData = signalDataManager.value.getChartData(selectedSignalName.value);
    console.log('当前图表数据:', currentData);
    
    // 检查信号数据管理器的内部状态
    const allSignals = signalDataManager.value.getAllSignalNames();
    console.log('信号数据管理器中的所有信号:', allSignals);
    
    if (allSignals.includes(selectedSignalName.value)) {
      const signalData = signalDataManager.value.getSignalData(selectedSignalName.value);
      console.log('当前信号的详细数据:', signalData);
    }
    
    // 手动添加测试数据
    const testValue = Math.random() * 100;
    const testTimestamp = Date.now();
    
    console.log('添加测试数据:', testValue, '时间戳:', testTimestamp);
    
    signalDataManager.value.addSignalData(selectedSignalName.value, testValue, testTimestamp);
    
    // 再次检查数据状态
    const updatedData = signalDataManager.value.getChartData(selectedSignalName.value);
    console.log('添加测试数据后的图表数据:', updatedData);
    
    // 更新图表
    if (updatedData) {
      updateChart(updatedData.times, updatedData.values);
      ElMessage.success('测试数据流成功，图表已更新');
      
      // 更新实时数据
      if (realTimeData.value) {
        realTimeData.value.currentValue = testValue;
        realTimeData.value.timestamp = new Date(testTimestamp).toLocaleTimeString('zh-CN', { hour12: false });
        realTimeData.value.dataPoints = updatedData.values.length;
      }
      
      // 更新最后图表更新时间
      lastChartUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    } else {
      ElMessage.error('测试数据流失败，无法获取图表数据');
    }
  } else {
    ElMessage.warning('请先选择一个信号节点');
  }
  
  console.log('=== 测试数据流完成 ===');
};

// 测试WebSocket消息处理
const testWebSocketMessage = () => {
  console.log('=== 测试WebSocket消息处理 ===');
  
  if (!websocketManager.value) {
    ElMessage.error('WebSocket管理器未初始化');
    return;
  }
  
  // 创建测试消息
  const testMessage: RosTopicMessage = {
    topic_name: 'test_topic',
    topic_type: 0,
    timestamp: Date.now() * 1000000,
    data: {
      raw_str: {
        header: {
          stamp: Date.now() * 1000000,
          frame_id: 'test_frame',
          seq: 1
        },
        raw_data: JSON.stringify({
          AFSFaultSts: Math.random() * 100,
          test_signal: Math.random() * 50
        }),
        extra_data: 'Test message'
      }
    },
    extra_data: ''
  };
  
  console.log('发送测试消息:', testMessage);
  
  // 直接调用消息处理器
  if (signalDataManager.value) {
    signalDataManager.value.processRosMessage(testMessage);
  }
  
  // 调用调试信息处理
  addDebugInfo(testMessage);
  
  ElMessage.success('测试消息已发送');
  console.log('=== 测试WebSocket消息处理完成 ===');
};

// 获取 WebSocket 状态
const getWebSocketState = () => {
  if (!websocketManager.value) return '未初始化';
  
  try {
    const ws = (websocketManager.value as any).ws;
    if (!ws) return 'WebSocket 实例不存在';
    
    const states = {
      0: '连接中',
      1: '已连接',
      2: '关闭中',
      3: '已关闭'
    };
    
    return `${states[ws.readyState] || '未知'} (${ws.readyState})`;
  } catch (error) {
    return '状态获取失败';
  }
};



// 开始信号监控
const startSignalMonitoring = (signalName: string) => {
  if (!signalDataManager.value) return;

  console.log(`开始监控信号: ${signalName}`);

  // 清除之前的回调
  signalDataManager.value.removeDataUpdateCallback(selectedSignalName.value);

  // 添加新的数据更新回调
  signalDataManager.value.onDataUpdate(signalName, (signalData) => {
    console.log(`信号 ${signalName} 数据更新:`, signalData);
    
    // 更新实时数据
    realTimeData.value = {
      currentValue: signalData.dataPoints[signalData.dataPoints.length - 1]?.value || 0,
      timestamp: new Date(signalData.lastUpdateTime).toLocaleTimeString('zh-CN', { hour12: false }),
      dataPoints: signalData.dataPoints.length
    };

    console.log('实时数据已更新:', realTimeData.value);

    // 如果图表已初始化，更新图表数据
    if (selectedNode.value && selectedNode.value.label === signalName) {
      console.log('准备更新图表数据...');
      updateChartWithRealData(signalName);
    }
  });

  console.log(`信号监控已设置: ${signalName}`);
};

// 使用实时数据更新图表
const updateChartWithRealData = (signalName: string) => {
  if (!signalDataManager.value) return;

  console.log(`准备更新图表，信号: ${signalName}`);
  
  const chartData = signalDataManager.value.getChartData(signalName);
  console.log('获取到的图表数据:', chartData);
  
  if (chartData && chartData.times && chartData.values) {
    console.log('实时更新图表:', signalName, chartData);
    console.log('时间数组长度:', chartData.times.length);
    console.log('数值数组长度:', chartData.values.length);
    
    // 更新图表数据
    updateChart(chartData.times, chartData.values);
    
    // 更新最后图表更新时间
    lastChartUpdate.value = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  } else {
    console.log('图表数据无效:', chartData);
  }
};

// 更新图表数据
const updateChart = (times: string[], values: number[]) => {
  if (!chartRef.value) return;

  console.log('更新图表，数据点数:', values.length, '时间范围:', times[0], '到', times[times.length - 1]);

  // 获取容器尺寸
  const containerWidth = chartRef.value.clientWidth || 600;
  const containerHeight = chartRef.value.clientHeight || 300;

  // 使用Canvas绘制动态折线图
  const canvas = document.createElement('canvas');
  canvas.width = containerWidth;
  canvas.height = containerHeight;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.maxHeight = '300px';

  // 清空容器
  chartRef.value.innerHTML = '';
  chartRef.value.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  // 设置背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制网格
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;

  // 水平网格线
  for (let i = 0; i <= 10; i++) {
    const y = (canvas.height - 60) * i / 10 + 30;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(canvas.width - 20, y);
    ctx.stroke();
  }

  // 垂直网格线
  for (let i = 0; i <= 10; i++) {
    const x = (canvas.width - 80) * i / 10 + 60;
    ctx.beginPath();
    ctx.moveTo(x, 30);
    ctx.lineTo(x, canvas.height - 30);
    ctx.stroke();
  }

  // 绘制坐标轴
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 30);
  ctx.lineTo(60, canvas.height - 30);
  ctx.lineTo(canvas.width - 20, canvas.height - 30);
  ctx.stroke();

  // 绘制数据点和折线
  if (values.length > 0) {
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    // 绘制折线（使用渐变色）
    const gradient = ctx.createLinearGradient(60, 30, canvas.width - 20, canvas.height - 30);
    gradient.addColorStop(0, '#13ce66');
    gradient.addColorStop(1, '#409eff');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 绘制平滑折线
    ctx.beginPath();
    values.forEach((value, index) => {
      const x = 60 + (canvas.width - 80) * index / (values.length - 1);
      const y = canvas.height - 30 - (value - minValue) / range * (canvas.height - 60);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 绘制数据点（带阴影效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    values.forEach((value, index) => {
      const x = 60 + (canvas.width - 80) * index / (values.length - 1);
      const y = canvas.height - 30 - (value - minValue) / range * (canvas.height - 60);

      // 绘制数据点
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#409eff';
      ctx.fill();
      
      // 绘制高亮效果
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // 重置阴影
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制Y轴标签
    ctx.textAlign = 'right';
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666';
    for (let i = 0; i <= 5; i++) {
      const value = minValue + range * i / 5;
      const y = canvas.height - 30 - (canvas.height - 60) * i / 5;
      ctx.fillText(value.toFixed(1), 55, y + 4);
    }
  }

  // 绘制标题
  ctx.fillStyle = '#333';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${selectedNode.value?.label || '未知信号'} (实时数据)`, canvas.width / 2, 20);

  // 绘制X轴标签（时间轴）
  ctx.textAlign = 'center';
  ctx.font = '10px Arial';
  ctx.fillStyle = '#666';
  
  // 实时更新优化：智能显示时间标签，避免重叠
  const maxLabels = Math.min(8, times.length); // 限制标签数量，确保可读性
  const step = Math.max(1, Math.floor(times.length / maxLabels));
  
  for (let i = 0; i < times.length; i += step) {
    const x = 60 + (canvas.width - 80) * i / (times.length - 1);
    const timeLabel = times[i]; // 显示完整时间
    
    // 确保关键时间点显示：开始、结束、中间点
    if (i === 0 || i === times.length - 1 || i % step === 0) {
      ctx.fillText(timeLabel, x, canvas.height - 10);
    }
  }
  
  // 实时更新指示器：在最新数据点处显示"LIVE"标记
  if (times.length > 0) {
    const lastIndex = times.length - 1;
    const lastX = 60 + (canvas.width - 80) * lastIndex / (times.length - 1);
    
    ctx.fillStyle = '#ff4757';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LIVE', lastX, canvas.height - 25);
  }

  // 绘制实时数据指示器
  if (values.length > 0) {
    const lastValue = values[values.length - 1];
    const lastTime = times[times.length - 1];
    
    ctx.fillStyle = '#ff4757';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`当前值: ${lastValue.toFixed(2)}`, 70, canvas.height - 40);
    ctx.fillText(`更新时间: ${lastTime}`, 70, canvas.height - 20);
  }

  chartInstance.value = canvas;
};



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
  

  
  // 清理 WebSocket 连接和信号数据管理器
  if (websocketManager.value) {
    websocketManager.value.destroy();
  }
  if (signalDataManager.value) {
    signalDataManager.value.destroy();
  }
  
  // 清理图表更新定时器
  if (window.chartUpdateTimer) {
    clearInterval(window.chartUpdateTimer);
    window.chartUpdateTimer = null;
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
    height: calc(100vh - 200px); // 增加高度，给内容更多空间
    min-height: 700px; // 增加最小高度
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
    min-height: 600px; // 确保有足够的最小高度

    .chart-container {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: calc(100% - 60px); // 减去header高度
        min-height: 500px; // 设置最小高度，确保有足够空间
        max-height: 600px; // 增加最大高度，避免内容被压缩

        .websocket-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding: 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          flex-shrink: 0;

          .status-item {
            display: flex;
            align-items: center;
            gap: 8px;

            .label {
              color: #856404;
              font-size: 12px;
              min-width: 80px;
              font-weight: 500;
            }

            .value {
              color: #856404;
              font-weight: 600;
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 4px;
              
              &.connected {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
              }
              
              &.disconnected {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
              }
            }
          }
        }

      .chart-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        flex-shrink: 0; // 防止压缩
          min-height: 120px; // 确保有足够高度显示所有信息

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
            min-height: 20px; // 确保每行有足够高度

          .label {
            color: #666;
            font-size: 12px;
              min-width: 80px; // 增加标签宽度，确保对齐
              flex-shrink: 0; // 防止标签被压缩
          }

          .value {
            color: #333;
            font-weight: 500;
            font-size: 12px;
              flex: 1; // 让值占据剩余空间
              word-break: break-all; // 允许长文本换行
              
              &.real-time {
                color: #13ce66;
                font-weight: 700;
                font-size: 14px;
              }
              
              &.updating {
                color: #409eff;
                font-weight: 700;
                animation: pulse 1.5s ease-in-out infinite;
              }
              
              &.idle {
                color: #909399;
                font-weight: 500;
              }
            }
        }
      }

      .chart-wrapper {
        flex: 1;
        position: relative;
        min-height: 0; // 重要：允许flex子项收缩
          height: 300px; // 固定高度，确保图表完整显示

        .chart {
          width: 100%;
          height: 100%;
          min-height: 200px;
          max-height: 300px; // 限制最大高度
            overflow: visible; // 允许内容溢出，避免被裁剪
          }
        }
        
        // 调试控制按钮样式
        .debug-controls {
          // margin-bottom: 16px;
          padding: 12px;
          // background: #f8f9fa;
          // border: 1px solid #e9ecef;
          // border-radius: 6px;
          flex-shrink: 0;
          max-height: 120px; // 限制最大高度
          overflow-y: auto; // 添加竖向滚动条

          .el-button+.el-button {
            margin-left: 4px;
          }
          
          // 自定义滚动条样式
          &::-webkit-scrollbar {
            width: 6px;
          }
          
          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          
          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
            
            &:hover {
              background: #a8a8a8;
            }
          }
          
          .debug-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start; // 改为顶部对齐，适应滚动
            
            h4 {
              margin: 0;
              color: #333;
              font-size: 14px;
              font-weight: 600;
              flex-shrink: 0; // 防止标题被压缩
            }
            
            .debug-buttons {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              flex: 1; // 让按钮区域占据剩余空间
              justify-content: flex-end; // 按钮右对齐
            }
          }
        }
        
        // 调试信息样式
        .debug-info {
          margin-top: 16px;
          border-top: 1px solid #e9ecef;
          padding-top: 16px;
          flex-shrink: 0; // 防止被压缩
          min-height: 200px; // 确保有足够高度显示调试信息
          
          .debug-section {
            margin-bottom: 20px;
            
            .section-title {
              font-size: 13px;
              font-weight: 600;
              color: #666;
              margin-bottom: 8px;
              padding: 4px 8px;
              background: #f8f9fa;
              border-radius: 4px;
            }
            
            .debug-content {
              .debug-item {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                
                .label {
                  color: #666;
                  font-size: 12px;
                  min-width: 80px;
                  font-weight: 500;
                }
                
                .value {
                  color: #333;
                  font-size: 12px;
                  font-weight: 600;
                  
                  &.connected {
                    color: #13ce66;
                  }
                  
                  &.disconnected {
                    color: #f56c6c;
                  }
                }
              }
              
              .no-data {
                color: #999;
                font-size: 12px;
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 4px;
              }
              
              .raw-data-list,
              .parsed-data-list {
                .raw-data-item,
                .parsed-data-item {
                  margin-bottom: 12px;
                  padding: 8px;
                  background: #f8f9fa;
                  border-radius: 4px;
                  border: 1px solid #e9ecef;
                  
                  .data-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 6px;
                    
                    .timestamp {
                      color: #666;
                      font-size: 11px;
                      background: #e9ecef;
                      padding: 2px 6px;
                      border-radius: 3px;
                    }
                    
                    .topic-name,
                    .signal-name {
                      color: #333;
                      font-size: 12px;
                      font-weight: 600;
                    }
                    
                    .signal-value {
                      color: #13ce66;
                      font-size: 12px;
                      font-weight: 700;
                    }
                  }
                  
                  .data-content {
                    pre {
                      margin: 0;
                      font-size: 11px;
                      color: #666;
                      background: #fff;
                      padding: 8px;
                      border-radius: 3px;
                      border: 1px solid #e9ecef;
                      max-height: 120px;
                      overflow-y: auto;
                      white-space: pre-wrap;
                      word-break: break-all;
                    }
                  }
                }
              }
            }
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

// 添加脉冲动画
@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>