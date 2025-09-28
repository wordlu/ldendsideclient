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
            <el-button size="small" @click="selectAllSignals" :disabled="signalTreeLoading">
              全选
            </el-button>
            <el-button size="small" @click="clearAllSignals" :disabled="signalTreeLoading">
              清空
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
            ref="treeRef"
            :data="signalTreeData"
            :props="treeProps"
            @node-click="handleNodeClick"
            @check="handleNodeCheck"
            :highlight-current="true"
            :expand-on-click-node="false"
            :check-strictly="false"
            :check-on-click-node="false"
            show-checkbox
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
                <span 
                  v-if="!data.children || data.children.length === 0" 
                  class="signal-color-indicator"
                  :style="{ backgroundColor: getSignalNodeColor(data.label) }"
                ></span>
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
          
          <!-- 已选信号显示区域 -->
          <div v-if="selectedSignals.length > 0" class="selected-signals">
            <div class="selected-header">
              <h4>已选信号 ({{ selectedSignals.length }})</h4>
              <div class="signal-status">
                <span class="status-indicator" :class="{ 'monitoring': websocketConnected }"></span>
                <span class="status-text">{{ websocketConnected ? '监控中' : '未连接' }}</span>
              </div>
            </div>
            <div class="selected-list">
              <div 
                v-for="signal in selectedSignals" 
                :key="signal.id"
                class="selected-item"
                :class="{ 
                  'active': selectedNode && selectedNode.id === signal.id,
                  'has-data': getSignalHasData(signal.label)
                }"
                @click="selectSignalForView(signal)"
              >
                <div class="signal-info">
                  <span 
                    class="signal-color-indicator"
                    :style="{ backgroundColor: getSignalNodeColor(signal.label) }"
                  ></span>
                  <span class="signal-name">{{ signal.label }}</span>
                  <span v-if="signal.size" class="signal-size">({{ signal.size }}bit)</span>
                </div>
                <div class="signal-status-indicator">
                  <span v-if="getSignalHasData(signal.label)" class="data-indicator">●</span>
                  <span v-else class="no-data-indicator">○</span>
                </div>
              </div>
            </div>
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
              <span class="value real-time">{{ realTimeData.currentValue?.toFixed(6) }}</span>
              <span class="debug-info" style="font-size: 10px; color: #666; margin-left: 10px;">
                (信号: {{ selectedSignalName }})
              </span>
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
              <span class="value updating">{{ updateThrottle }}ms</span>
            </div>
            <!-- 数据平滑设置 -->
            <div class="info-item">
              <span class="label">平滑程度:</span>
              <el-slider
                v-model="smoothingFactor"
                :min="0.1"
                :max="1"
                :step="0.1"
                :show-tooltip="false"
                style="width: 100px; margin-left: 10px;"
                @change="onSmoothingChange"
              />
              <span class="value" style="margin-left: 10px;">{{ (smoothingFactor * 100).toFixed(0) }}%</span>
            </div>
          </div>
          
          <div class="chart-wrapper">
            <SimpleEcgChart
              :selectedSignals="selectedSignals"
              :websocketConnected="websocketConnected"
              :signalData="ecgChartSignalData"
              :signalColors="signalNodeColors"
            />
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
import { ElButton, ElMessage, ElNotification, ElTree, ElIcon, ElEmpty, ElTooltip, ElSlider } from 'element-plus';
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { addItem, findAll, findItem } from '@/api/jsonApi'
// import PointView from '@/components/visualization/PointView.vue'
import BasicScene from '@/components/visualization/index/BasicScene.vue'
import sensorConfigs from '@/components/visualization/index/sensorConfigs.vue'
import { Folder, Document } from "@element-plus/icons-vue"
import { useRouter } from 'vue-router';
// import * as echarts from 'echarts';

// 导入 WebSocket 和信号数据管理相关模块
import { WebSocketManager } from '@/utils/websocket-manager';
import { SignalDataManager } from '@/utils/signal-data-manager';
import { RosTopicMessage } from '@/utils/flatbuffers-parser';
import SimpleEcgChart from '@/components/DataVisualization/SimpleEcgChart.vue';

// 获取当前路由对象
const router = useRouter();
// 创建响应式变量
const message = ref(null); // 用于存储 SSE 消息
const messageHigh = ref(null); // 用于存储 SSE cpu负载过高消息
const error = ref(null);   // 用于存储错误信息
let eventSource = null;    // 存储 EventSource 对象
const dialogFormVisible = ref(false)

const cloudpointparams = ref({
  color: "00ffff",
  size: 0.01,
})
const changeProps = (obj) => {
  cloudpointparams.value = Object.assign(cloudpointparams.value, obj)
}

// const pageLoading = ref(false)
const switchLoading = ref(true)
const testDevice = ref(false)
const startCollect = ref(false)
const sensorConfigsRef = ref(null);
const viewportId = ref('')

const selectedLeafNodes = ref([]);


const currentSelectedSensor = ref([])

// 信号树数据和图表相关变量
const signalTreeData = ref([])
const currentDbc = ref('')
const currentSignalCollection = ref('')
const signalTreeLoading = ref(false)

// 信号树勾选相关变量
const checkedSignals = ref([])
const selectedSignals = ref([])
const treeRef = ref(null)

// SimpleEcgChart数据
const ecgChartSignalData = ref([])

// 信号节点颜色管理
const signalNodeColors = ref(new Map()) // 存储每个信号节点的颜色
const colorPalette = [
  '#FF6B6B', // 红色
  '#4ECDC4', // 青色
  '#45B7D1', // 蓝色
  '#96CEB4', // 绿色
  '#FFEAA7', // 黄色
  '#DDA0DD', // 紫色
  '#FFB347', // 橙色
  '#87CEEB', // 天蓝色
  '#F0E68C', // 卡其色
  '#FF69B4', // 热粉色
  '#20B2AA', // 浅海绿色
  '#FFA07A', // 浅鲑鱼色
  '#98FB98', // 浅绿色
  '#F0E68C', // 卡其色
  '#DDA0DD', // 李子色
  '#FFB6C1', // 浅粉色
  '#87CEFA', // 浅天蓝色
  '#F5DEB3', // 小麦色
  '#FFE4E1', // 薄雾玫瑰色
  '#E0E0E0'  // 浅灰色
]

// 数据验证和防抖相关变量
const lastUpdateTime = ref(0)
const updateThrottle = 100 // 100ms防抖间隔
const dataValidation = {
  minValue: -10000,
  maxValue: 10000,
  maxChangeRate: 1000 // 每秒最大变化率
}

// 数据平滑相关变量
const smoothedValues = ref(new Map()) // 存储平滑后的数值
const smoothingFactor = 0.3 // 平滑因子，0-1之间，越小越平滑

// WebSocket 和信号数据管理相关变量
const websocketManager = ref<WebSocketManager | null>(null)
const signalDataManager = ref<SignalDataManager | null>(null)
const websocketConnected = ref(false)
const websocketStatus = ref('未连接')
const selectedSignalName = ref('')
const realTimeData = ref<any>(null)

// 调试信息相关变量
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
            // 初始化信号节点颜色
            initializeSignalColors(signalTreeData.value)
          } else {
            // 如果没有信号合集，使用DBC中的所有信号
            signalTreeData.value = buildSignalTreeFromDbc(dbcDetail.dbc)
            console.log('从DBC构建的树:', signalTreeData.value)
            // 初始化信号节点颜色
            initializeSignalColors(signalTreeData.value)
          }
        } else {
          // 如果没有信号合集，使用DBC中的所有信号
          signalTreeData.value = buildSignalTreeFromDbc(dbcDetail.dbc)
          console.log('从DBC构建的树:', signalTreeData.value)
          // 初始化信号节点颜色
          initializeSignalColors(signalTreeData.value)
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

// 全选信号
const selectAllSignals = () => {
  if (treeRef.value) {
    // 获取所有信号节点
    const allSignalNodes = getAllSignalNodes(signalTreeData.value);
    const signalKeys = allSignalNodes.map(node => node.id);
    const previousSelectedSignals = [...selectedSignals.value];
    
    treeRef.value.setCheckedKeys(signalKeys);
    selectedSignals.value = allSignalNodes;
    checkedSignals.value = signalKeys;
    
    // 更新信号监控
    updateSignalMonitoring(previousSelectedSignals, allSignalNodes);
    
    ElMessage.success(`已选择 ${allSignalNodes.length} 个信号`);
  }
}

// 清空选择
const clearAllSignals = () => {
  if (treeRef.value) {
    const previousSelectedSignals = [...selectedSignals.value];
    
    treeRef.value.setCheckedKeys([]);
    selectedSignals.value = [];
    checkedSignals.value = [];
    selectedNode.value = null;
    selectedNodeTitle.value = '请选择信号节点';
    selectedSignalName.value = '';
    realTimeData.value = null;
    
    // 停止所有信号监控
    updateSignalMonitoring(previousSelectedSignals, []);
    
    ElMessage.success('已清空所有选择');
  }
}

// 获取所有信号节点（递归遍历树）
const getAllSignalNodes = (nodes) => {
  let signalNodes = [];
  nodes.forEach(node => {
    if (node.type === 'signal') {
      signalNodes.push(node);
    }
    if (node.children && node.children.length > 0) {
      signalNodes = signalNodes.concat(getAllSignalNodes(node.children));
    }
  });
  return signalNodes;
}

// 选择信号进行查看
const selectSignalForView = (signal) => {
  console.log('选择信号进行查看:', signal);
  
  selectedNode.value = signal;
  selectedNodeTitle.value = signal.label;
  selectedSignalName.value = signal.label;
  
  // 立即更新实时数据
  updateCurrentSignalData(signal.label);
  
  nextTick(() => {
    initChart();
  });
}

// 更新当前信号的实时数据
const updateCurrentSignalData = (signalName) => {
  if (!signalDataManager.value) {
    console.log('信号数据管理器未初始化');
    return;
  }
  
  // 验证信号名称是否与当前选中的信号一致
  if (selectedSignalName.value !== signalName) {
    console.warn(`信号名称不匹配: 当前选中=${selectedSignalName.value}, 更新信号=${signalName}`);
    return;
  }
  
  const signalData = signalDataManager.value.getSignalData(signalName);
  if (signalData && signalData.dataPoints && signalData.dataPoints.length > 0) {
    const rawValue = signalData.dataPoints[signalData.dataPoints.length - 1]?.value || 0;
    const smoothedValue = smoothValue(signalName, rawValue);
    
    realTimeData.value = {
      currentValue: smoothedValue,
      timestamp: new Date(signalData.lastUpdateTime).toLocaleTimeString('zh-CN', { hour12: false }),
      dataPoints: signalData.dataPoints.length
    };
    
    console.log(`更新当前信号 ${signalName} 的实时数据:`, realTimeData.value);
  } else {
    // 如果没有数据，清空实时数据
    realTimeData.value = null;
    console.log(`信号 ${signalName} 暂无数据`);
  }
}

// 验证实时数据一致性
const validateRealTimeData = () => {
  if (realTimeData.value && selectedSignalName.value) {
    // 这里可以添加额外的验证逻辑
    console.log(`实时数据验证: 信号=${selectedSignalName.value}, 值=${realTimeData.value.currentValue}`);
  }
}

// 从本地存储加载颜色
const loadColorsFromStorage = () => {
  try {
    const storedColors = localStorage.getItem('signalNodeColors');
    if (storedColors) {
      const colorMap = new Map(JSON.parse(storedColors));
      signalNodeColors.value = colorMap;
      console.log('从本地存储加载颜色:', colorMap);
    }
  } catch (error) {
    console.error('加载颜色失败:', error);
  }
}

// 保存颜色到本地存储
const saveColorsToStorage = () => {
  try {
    const colorArray = Array.from(signalNodeColors.value.entries());
    localStorage.setItem('signalNodeColors', JSON.stringify(colorArray));
    console.log('颜色已保存到本地存储');
  } catch (error) {
    console.error('保存颜色失败:', error);
  }
}

// 获取或分配信号节点颜色
const getSignalNodeColor = (signalName) => {
  if (!signalNodeColors.value.has(signalName)) {
    // 如果还没有颜色，分配一个随机颜色
    const usedColors = Array.from(signalNodeColors.value.values());
    let availableColors = colorPalette.filter(color => !usedColors.includes(color));
    
    // 如果所有颜色都用完了，重新开始
    if (availableColors.length === 0) {
      availableColors = [...colorPalette];
    }
    
    // 随机选择一个颜色
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const selectedColor = availableColors[randomIndex];
    
    signalNodeColors.value.set(signalName, selectedColor);
    console.log(`为信号 ${signalName} 分配颜色: ${selectedColor}`);
    
    // 保存到本地存储
    saveColorsToStorage();
  }
  
  return signalNodeColors.value.get(signalName);
}

// 初始化所有信号节点的颜色
const initializeSignalColors = (treeData) => {
  // 首先尝试从本地存储加载颜色
  loadColorsFromStorage();
  
  const initializeNodeColors = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // 递归处理子节点
        initializeNodeColors(node.children);
      } else {
        // 叶子节点（信号节点）
        getSignalNodeColor(node.label);
      }
    });
  };
  
  if (treeData && treeData.length > 0) {
    initializeNodeColors(treeData);
    console.log('信号节点颜色初始化完成:', signalNodeColors.value);
  }
}

// 检查信号是否有数据
const getSignalHasData = (signalName) => {
  if (!signalDataManager.value) return false;
  const signalData = signalDataManager.value.getSignalData(signalName);
  return signalData && signalData.dataPoints && signalData.dataPoints.length > 0;
}

// 数据验证函数
const validateSignalData = (signalName, value, timestamp) => {
  // 检查数值范围
  if (value < dataValidation.minValue || value > dataValidation.maxValue) {
    console.warn(`信号 ${signalName} 数值超出范围: ${value}`);
    return false;
  }
  
  // 检查是否为有效数字
  if (!isFinite(value) || isNaN(value)) {
    console.warn(`信号 ${signalName} 数值无效: ${value}`);
    return false;
  }
  
  // 检查变化率（防止异常跳跃）
  if (signalDataManager.value) {
    const signalData = signalDataManager.value.getSignalData(signalName);
    if (signalData && signalData.dataPoints.length > 0) {
      const lastValue = signalData.dataPoints[signalData.dataPoints.length - 1].value;
      const timeDiff = (timestamp - signalData.lastUpdateTime) / 1000; // 秒
      const valueDiff = Math.abs(value - lastValue);
      const changeRate = timeDiff > 0 ? valueDiff / timeDiff : 0;
      
      if (changeRate > dataValidation.maxChangeRate) {
        console.warn(`信号 ${signalName} 变化率过大: ${changeRate.toFixed(2)}/s`);
        return false;
      }
    }
  }
  
  return true;
}

// 防抖更新函数
const throttledUpdate = (callback) => {
  const now = Date.now();
  if (now - lastUpdateTime.value >= updateThrottle) {
    lastUpdateTime.value = now;
    callback();
  } else {
    // 延迟执行
    setTimeout(() => {
      if (Date.now() - lastUpdateTime.value >= updateThrottle) {
        lastUpdateTime.value = Date.now();
        callback();
      }
    }, updateThrottle - (now - lastUpdateTime.value));
  }
}

// 数据平滑函数
const smoothValue = (signalName, newValue) => {
  if (!smoothedValues.value.has(signalName)) {
    smoothedValues.value.set(signalName, newValue);
    return newValue;
  }
  
  const previousValue = smoothedValues.value.get(signalName);
  const smoothedValue = previousValue + smoothingFactor * (newValue - previousValue);
  smoothedValues.value.set(signalName, smoothedValue);
  
  return smoothedValue;
}

// 清理平滑数据
const clearSmoothedData = (signalName) => {
  smoothedValues.value.delete(signalName);
}

// 平滑程度变化处理
const onSmoothingChange = (value) => {
  console.log('平滑程度已调整为:', value);
  // 重置所有平滑数据，让新的平滑因子生效
  smoothedValues.value.clear();
  ElMessage.success(`数据平滑程度已调整为 ${(value * 100).toFixed(0)}%`);
}

// 信号状态更新定时器
let signalStatusUpdateTimer = null;

// 启动信号状态更新定时器
const startSignalStatusUpdater = () => {
  // 每2秒更新一次信号状态显示
  signalStatusUpdateTimer = setInterval(() => {
    // 强制更新组件，触发getSignalHasData重新计算
    if (selectedSignals.value.length > 0) {
      // 这里可以添加一些状态更新逻辑
      // Vue的响应式系统会自动处理getSignalHasData的重新计算
    }
  }, 2000);
}

// 停止信号状态更新定时器
const stopSignalStatusUpdater = () => {
  if (signalStatusUpdateTimer) {
    clearInterval(signalStatusUpdateTimer);
    signalStatusUpdateTimer = null;
  }
}

// 通知SimpleEcgChart组件更新数据
const notifySimpleEcgChart = (message: any) => {
  // 处理CAN信号数据并更新ecgChartSignalData
  if (message.data && message.data.can_signals && message.data.can_signals.signals) {
    const selectedSignalNames = selectedSignals.value.map(signal => signal.label);
    const signalDataArray = [];
    
    message.data.can_signals.signals.forEach((signal: any) => {
      if (signal.signalName && typeof signal.value === 'number' && selectedSignalNames.includes(signal.signalName)) {
        signalDataArray.push({
          signalName: signal.signalName,
          value: signal.value,
          timestamp: message.timestamp
        });
      }
    });
    
    // 传递所有勾选信号的数据
    if (signalDataArray.length > 0) {
      ecgChartSignalData.value = signalDataArray;
      console.log('=== 通知SimpleEcgChart更新数据 ===');
      console.log('信号数据数组:', signalDataArray);
      console.log('数组长度:', signalDataArray.length);
      signalDataArray.forEach((data, index) => {
        console.log(`信号 ${index + 1}: ${data.signalName} = ${data.value}`);
      });
    }
  }
}

// 更新信号监控 - 只监控勾选的信号
const updateSignalMonitoring = (previousSignals, currentSignals) => {
  if (!signalDataManager.value) return;
  
  const previousSignalNames = previousSignals.map(s => s.label);
  const currentSignalNames = currentSignals.map(s => s.label);
  
  // 停止监控不再勾选的信号
  previousSignalNames.forEach(signalName => {
    if (!currentSignalNames.includes(signalName)) {
      console.log(`停止监控信号: ${signalName}`);
      signalDataManager.value.removeDataUpdateCallback(signalName);
      // 清空该信号的数据
      signalDataManager.value.clearSignalData(signalName);
      // 清理平滑数据
      clearSmoothedData(signalName);
    }
  });
  
  // 开始监控新勾选的信号
  currentSignalNames.forEach(signalName => {
    if (!previousSignalNames.includes(signalName)) {
      console.log(`开始监控信号: ${signalName}`);
      if (websocketConnected.value) {
        startSignalMonitoring(signalName);
      }
    }
  });
  
  // 如果当前查看的信号仍然在勾选列表中，继续监控
  if (selectedSignalName.value && currentSignalNames.includes(selectedSignalName.value)) {
    if (websocketConnected.value) {
      startSignalMonitoring(selectedSignalName.value);
    }
  }
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


onMounted(() => {
  queryCurrentDrivers()
  // 加载DBC信号树数据
  loadCurrentDbcSignalTree()
  
  // 初始化 WebSocket 连接
  initWebSocket()
  
  // 启动信号状态更新定时器
  startSignalStatusUpdater()
  
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
    
    // 立即更新实时数据
    updateCurrentSignalData(data.label);
    
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

// 处理节点勾选事件
const handleNodeCheck = (data, { checkedNodes, checkedKeys, halfCheckedKeys }) => {
  console.log('节点勾选变化:', data);
  console.log('已勾选节点:', checkedNodes);
  console.log('已勾选键值:', checkedKeys);
  
  // 过滤出信号节点（叶子节点）
  const signalNodes = checkedNodes.filter(node => node.type === 'signal');
  const previousSelectedSignals = [...selectedSignals.value];
  selectedSignals.value = signalNodes;
  checkedSignals.value = checkedKeys;
  
  console.log('已选择的信号:', selectedSignals.value);
  
  // 更新信号监控 - 只监控勾选的信号
  updateSignalMonitoring(previousSelectedSignals, signalNodes);
  
  // 如果当前选中的信号被取消勾选，清空图表
  if (selectedNode.value && !checkedKeys.includes(selectedNode.value.id)) {
    selectedNode.value = null;
    selectedNodeTitle.value = '请选择信号节点';
    selectedSignalName.value = '';
    realTimeData.value = null;
  }
  
  // 如果只有一个信号被选中，自动设置为当前查看的信号
  if (signalNodes.length === 1) {
    const signalNode = signalNodes[0];
    selectedNode.value = signalNode;
    selectedNodeTitle.value = signalNode.label;
    selectedSignalName.value = signalNode.label;
    
    nextTick(() => {
      initChart();
    });
  }
}

// WebSocket 连接管理
const initWebSocket = () => {
  try {
    // 创建信号数据管理器
    signalDataManager.value = new SignalDataManager(100);

    // 尝试连接到真实的 WebSocket 服务器
    websocketManager.value = new WebSocketManager({
      url: 'ws://10.86.14.25:18011/ros_ws',
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
        // 连接断开时不显示任何数据
        websocketStatus.value = '未连接';
        websocketConnected.value = false;
        // 清空实时数据
        realTimeData.value = null;
      }
    });

    // 添加消息处理器
    websocketManager.value.addMessageHandler((message: RosTopicMessage) => {
      console.log('=== WebSocket 接收到消息 ===');
      console.log('完整消息结构:', JSON.stringify(message, null, 2));
      
      // 直接打印所有可能的数据字段
      console.log('=== 消息数据字段 ===');
      console.log('topic_name:', message.topic_name);
      console.log('topic_type:', message.topic_type);
      console.log('timestamp:', message.timestamp);
      console.log('data字段:', message.data);
      
      if (message.data) {
        console.log('=== data字段内容 ===');
        Object.keys(message.data).forEach(key => {
          console.log(`${key}:`, message.data[key]);
        });
        
        // 检查can_signals字段
        if (message.data.can_signals) {
          console.log('=== can_signals数据 ===');
          console.log('can_signals:', message.data.can_signals);
          if (message.data.can_signals.signals) {
            console.log('信号数量:', message.data.can_signals.signals.length);
            message.data.can_signals.signals.forEach((signal: any, index: number) => {
              console.log(`信号 ${index + 1}:`, signal);
            });
          }
        }
        
        // 检查raw_str字段
        if (message.data.raw_str) {
          console.log('=== raw_str数据 ===');
          console.log('raw_str:', message.data.raw_str);
          if (message.data.raw_str.raw_data) {
            console.log('raw_data:', message.data.raw_str.raw_data);
          }
        }
      }
      
      // 处理信号数据 - 只处理勾选的信号
      if (message.data && message.data.can_signals && message.data.can_signals.signals) {
        // 获取当前勾选的信号名称列表
        const selectedSignalNames = selectedSignals.value.map(signal => signal.label);
        
        message.data.can_signals.signals.forEach((signal: any) => {
          if (signal.signalName && typeof signal.value === 'number') {
            // 只处理勾选的信号
            if (selectedSignalNames.includes(signal.signalName)) {
              const timestamp = message.timestamp / 1000000;
              
              // 数据验证
              if (validateSignalData(signal.signalName, signal.value, timestamp)) {
                console.log(`=== 处理勾选信号: ${signal.signalName} = ${signal.value} ===`);
                console.log('当前选中的信号:', selectedSignalName.value);
                console.log('信号数据管理器状态:', !!signalDataManager.value);
                
                if (signalDataManager.value) {
                  signalDataManager.value.addSignalData(signal.signalName, signal.value, timestamp);
                  console.log(`信号 ${signal.signalName} 数据已添加到管理器`);
                } else {
                  console.error('信号数据管理器未初始化');
                }
              } else {
                console.warn(`跳过无效信号数据: ${signal.signalName} = ${signal.value}`);
              }
            } else {
              console.log(`跳过未勾选信号: ${signal.signalName}`);
            }
          }
        });
      }
      
      // 实时更新：如果有选中的信号且该信号被勾选，使用防抖更新图表
      if (selectedSignalName.value && signalDataManager.value) {
        const isSignalSelected = selectedSignals.value.some(signal => signal.label === selectedSignalName.value);
        if (isSignalSelected) {
          console.log('接收到新数据，准备更新图表:', selectedSignalName.value);
          throttledUpdate(() => {
            updateChartWithRealData(selectedSignalName.value);
          });
        } else {
          console.log('当前查看的信号未被勾选，跳过图表更新:', selectedSignalName.value);
        }
      }
      
      // 通知SimpleEcgChart组件更新数据
      notifySimpleEcgChart(message);
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
            websocketStatus.value = '连接异常';
            websocketConnected.value = false;
            // 清空实时数据
            realTimeData.value = null;
          }
        }
      }, 1000);
      
    }).catch(error => {
      console.error('WebSocket 连接失败:', error);
      ElMessage.error('WebSocket 连接失败: ' + error.message);
      websocketStatus.value = '连接失败';
      websocketConnected.value = false;
      // 清空实时数据
      realTimeData.value = null;
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
    ElMessage.warning('初始化 WebSocket 失败: ' + error.message);
    websocketStatus.value = '初始化失败';
    websocketConnected.value = false;
    // 清空实时数据
    realTimeData.value = null;
  }
};














// 开始信号监控
const startSignalMonitoring = (signalName: string) => {
  if (!signalDataManager.value) return;

  // 检查信号是否被勾选
  const isSignalSelected = selectedSignals.value.some(signal => signal.label === signalName);
  if (!isSignalSelected) {
    console.log(`信号 ${signalName} 未被勾选，跳过监控设置`);
    return;
  }

  console.log(`开始监控信号: ${signalName}`);

  // 清除之前的回调（如果有的话）
  if (selectedSignalName.value) {
    signalDataManager.value.removeDataUpdateCallback(selectedSignalName.value);
  }

  // 添加新的数据更新回调
  signalDataManager.value.onDataUpdate(signalName, (signalData) => {
    console.log(`=== 信号 ${signalName} 数据更新回调触发 ===`);
    console.log('信号数据:', signalData);
    console.log('当前选中的信号:', selectedSignalName.value);
    console.log('当前选中的节点:', selectedNode.value);
    console.log('WebSocket连接状态:', websocketConnected.value);
    
    // 再次检查信号是否仍然被勾选
    const isStillSelected = selectedSignals.value.some(signal => signal.label === signalName);
    console.log(`信号 ${signalName} 是否仍被勾选:`, isStillSelected);
    
    if (!isStillSelected) {
      console.log(`信号 ${signalName} 已被取消勾选，停止数据处理`);
      return;
    }
    
    // 只更新当前选中信号的实时数据
    if (selectedNode.value && selectedNode.value.label === signalName) {
      console.log(`=== 更新当前选中信号 ${signalName} 的实时数据 ===`);
      
      // 使用防抖更新实时数据
      throttledUpdate(() => {
        const rawValue = signalData.dataPoints[signalData.dataPoints.length - 1]?.value || 0;
        const smoothedValue = smoothValue(signalName, rawValue);
        
        // 更新实时数据（使用平滑后的数值）
        realTimeData.value = {
          currentValue: smoothedValue,
          timestamp: new Date(signalData.lastUpdateTime).toLocaleTimeString('zh-CN', { hour12: false }),
          dataPoints: signalData.dataPoints.length
        };

        console.log('=== 实时数据已更新 ===');
        console.log('实时数据:', realTimeData.value);
        console.log(`原始值: ${rawValue}, 平滑值: ${smoothedValue.toFixed(6)}`);

        // 更新图表数据
        console.log('准备更新图表数据...');
        updateChartWithRealData(signalName);
      });
    } else {
      console.log(`信号 ${signalName} 不是当前选中的信号，跳过实时数据更新`);
      console.log('当前选中节点标签:', selectedNode.value?.label);
    }
  });

  console.log(`信号监控已设置: ${signalName}`);
};

// 使用实时数据更新图表
const updateChartWithRealData = (signalName: string) => {
  if (!signalDataManager.value) return;

  // 检查信号是否被勾选
  const isSignalSelected = selectedSignals.value.some(signal => signal.label === signalName);
  if (!isSignalSelected) {
    console.log(`信号 ${signalName} 未被勾选，跳过图表更新`);
    return;
  }

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
    ctx.fillText(`当前值: ${lastValue.toFixed(6)}`, 70, canvas.height - 40);
    ctx.fillText(`更新时间: ${lastTime}`, 70, canvas.height - 20);
  }

  chartInstance.value = canvas;
};




// 初始化图表
const initChart = () => {
  if (!selectedNode.value || !chartRef.value) return
  
  // 不生成模拟数据，只显示空图表等待真实数据
  const times = []
  const data = []
  
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
  
  // 如果没有数据，显示等待提示
  if (data.length === 0) {
    // 绘制等待提示
    ctx.fillStyle = '#999'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('等待ROS WebSocket数据...', canvas.width / 2, canvas.height / 2)
    ctx.fillText('请确保WebSocket连接正常', canvas.width / 2, canvas.height / 2 + 25)
    
    // 绘制标题
    ctx.fillStyle = '#333'
    ctx.font = '14px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${selectedNode.value.label} (等待数据)`, canvas.width / 2, 20)
    
    chartInstance.value = canvas
    return
  }
  
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
  
  // 停止信号状态更新定时器
  stopSignalStatusUpdater();
  
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

        .selected-signals {
          margin-top: 16px;
          padding: 12px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          min-width: 320px;

          .selected-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            
            h4 {
              margin: 0;
              color: #0369a1;
              font-size: 14px;
              font-weight: 600;
            }

            .signal-status {
              display: flex;
              align-items: center;
              gap: 4px;

              .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #dc2626;
                transition: background-color 0.3s ease;

                &.monitoring {
                  background: #16a34a;
                  animation: pulse 2s infinite;
                }
              }

              .status-text {
                font-size: 11px;
                color: #666;
                font-weight: 500;
              }
            }
          }

          .selected-list {
            max-height: 200px;
            overflow-y: auto;
            
            .selected-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 6px 8px;
              margin-bottom: 4px;
              background: white;
              border: 1px solid #e0f2fe;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.2s ease;
              white-space: nowrap;

              &:hover {
                background: #e0f2fe;
                border-color: #0369a1;
              }

              &.active {
                background: #0369a1;
                color: white;
                border-color: #0369a1;

                .signal-name {
                  color: white;
                }

                .signal-size {
                  color: #bae6fd;
                }

                .data-indicator {
                  color: #bae6fd;
                }

                .no-data-indicator {
                  color: #bae6fd;
                }
              }

              &.has-data {
                border-left: 3px solid #16a34a;
              }

              &:last-child {
                margin-bottom: 0;
              }

              .signal-info {
                display: flex;
                align-items: center;
                flex: 1;
                min-width: 0;
                gap: 6px;

                .signal-color-indicator {
                  width: 10px;
                  height: 10px;
                  border-radius: 50%;
                  border: 1px solid #fff;
                  box-shadow: 0 0 0 1px #ddd;
                  flex-shrink: 0;
                }

                .signal-name {
                  color: #333;
                  font-size: 12px;
                  font-weight: 500;
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .signal-size {
                  color: #666;
                  font-size: 11px;
                  margin-left: 8px;
                  flex-shrink: 0;
                }
              }

              .signal-status-indicator {
                margin-left: 8px;
                flex-shrink: 0;

                .data-indicator {
                  color: #16a34a;
                  font-size: 12px;
                  font-weight: bold;
                }

                .no-data-indicator {
                  color: #9ca3af;
                  font-size: 12px;
                }
              }
            }
          }
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

        .signal-color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #ddd;
          flex-shrink: 0;
        }

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
    width: 400px; // 增加宽度
    height: 100%;
    min-height: 700px; // 增加最小高度

    .chart-container {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: calc(100% - 60px); // 减去header高度
      min-height: 600px; // 增加最小高度
      max-height: none; // 移除最大高度限制

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
        min-height: 400px; // 增加最小高度
        height: 100%; // 使用100%高度，适应父容器
        display: flex;
        flex-direction: column;

        .chart {
          width: 100%;
          height: 100%;
          flex: 1;
          min-height: 300px; // 增加最小高度
          overflow: visible; // 允许内容溢出，避免被裁剪
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