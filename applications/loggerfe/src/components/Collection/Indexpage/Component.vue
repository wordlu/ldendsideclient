<template>
  <div class="index-page" 
    :element-loading-text="loadingtext"
    v-loading="pageLoading" >
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <!-- <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备初始化</div>
          <el-switch v-model="testDevice" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="testDeviceChange"/>
        </div> -->
        <div style="display: flex;align-items: center;font-size: 14px;margin-right: 10px;">
          <div style="margin-right: 4px;">设备采集</div>
          <el-switch v-model="startCollect" :loading="switchLoading"  style="--el-switch-on-color: #13ce66;--el-switch-off-color: #ccc;" @change="startCollectChange"/>
        </div>
        <el-button class="info-btn" @click="addTaskTags">添加作业标签</el-button>
        <el-button class="info-btn" @click="checkTags">查看已打标签</el-button>
      </div>
    </div>
    <div
      v-loading="showLoading"
      element-loading-background="rgba(200, 200, 200, 0.6)"
      class="visible">
      <div class="point">
        <BasicScene :allports="allports"
          :cloudpointparams="cloudpointparams"
          :currentSelectedSensor="currentSelectedSensor"  />
        <sensorConfigs ref="sensorConfigsRef" 
          @changeProps="changeProps"
          @update:leafNodes="handleLeafNodes" 
          @setAllTreeKeys="setAllTreeKeys" />
        <tagConfigs :tagData="tagDataProp" @selectTag="handleSelectTag"/>
      </div>
    </div>
    <el-dialog
      v-model="dialogVisible"
      title="添加作业标签"
      width="680"
      :before-close="handleClose"
    >
      <el-transfer
        class="tags-transfer"
        v-model="transferDataValue"
        :titles="['全部标签', '作业标签']"
        filter-placeholder="搜索标签名称"
        :data="transferData"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddTags">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="checkTagsDialogVisible"
      title="已打标签"
      width="800"
      :before-close="handleCheckTagsClose"
    >
      <el-table :data="taggingsTableData" height="360">
        <el-table-column prop="tagname" label="标签名称"  show-overflow-tooltip/>
        <!-- <el-table-column prop="tagtype" label="标签类型" width="100" show-overflow-tooltip/> -->
        <el-table-column prop="tagcategory" label="标签分类"  width="150" show-overflow-tooltip/>
        <el-table-column label="开始时间" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatter(scope.row.starttime, "yyyy-MM-dd hh:mm:ss") }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatter(scope.row.endtime, "yyyy-MM-dd hh:mm:ss") }}</template>
        </el-table-column>
        <el-table-column
          property="name"
          label="操作"
          width="50">
          <template #default="scope">
            <el-dropdown @command="(val) => handleCommand(val, scope.row)">
              <span class="el-dropdown-link">
                <el-button @click="handleClick(scope.row)" type="text" size="small" :icon="MoreFilled"></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="删除" :icon="MoreFilled">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkTagsDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification } from 'element-plus';
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted  } from 'vue';
import { addItem, findAll, deleteItem } from '@/api/jsonApi'
// import PointView from '@/components/visualization/PointView.vue'
import BasicScene from '@/components/visualization/index/BasicScene.vue'
import DisplayPanel from '@/components/visualization/index/DisplayPanel.vue'
import sensorConfigs from '@/components/visualization/index/sensorConfigs.vue'
import tagConfigs from '@/components/visualization/index/tagConfigs.vue'
import gostore from '@/services/governance-store'
import { MoreFilled } from "@element-plus/icons-vue"
import { useRouter } from 'vue-router';

// 获取当前路由对象
const router = useRouter();
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
  size: 0.1,
})
const changeProps = (obj) => {
  cloudpointparams.value = Object.assign(cloudpointparams.value, obj)
}

const loadingtext = ref('')
const pageLoading = ref(false)
const switchLoading = ref(false)
const showRecordOnDevice = ref(false)
const testDevice = ref(false)
const startCollect = ref(false)
const sensorConfigsRef = ref(null);
const isAsideExpanded = ref(true);
const isAsideExpanded1 = ref(true);
const viewportId = ref('')

const selectedLeafNodes = ref([]);
const checkTagsDialogVisible = ref(false)
const taggingsTableData = ref([])

const currentSelectedSensor = ref([])

// 调试
const testDeviceChange = (val) => {
  switchLoading.value = true
  if (val) {
    startupDevice()
  } else {
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

const handleCheckTagsClose = (done: () => void) => {
  checkTagsDialogVisible.value = false
}

const dialogVisible = ref(false)
const addTaskTags = () => {
  dialogVisible.value = true
}

const handleClose = (done: () => void) => {
  dialogVisible.value = false
}

const tagDataProp = ref([])
const confirmAddTags = () => {
  dialogVisible.value = false
  tagDataProp.value = tagData.value.filter(it => transferDataValue.value.includes(it.id))
}

const checkTags = () => {
  getTaggings()
  checkTagsDialogVisible.value = true
}

const getTaggings = (lidarname: string) => {
  try {
    findAll('/models/taggings', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('taggings')
      taggingsTableData.value = datavalue
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const transferData = ref<Option[]>()
const transferDataValue = ref([])
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
    // showRecordOnDevice.value = true
    switchLoading.value = false
    pageLoading.value = true
    loadingtext.value = '设备启动中，请稍后...'
    ElMessage({
      message: "设备正在启动中",
      type: 'success',
    })
  }).catch((err: any) => {
    // showRecordOnDevice.value = true
    switchLoading.value = false
    console.error(err, 'err')
    const errmsg = err?.response?.data?.errors[0]?.detail

    ElMessage({
      message: "启动设备失败"+errmsg,
      type: 'error',
    })
  })
}
// 结束调试
const shutdownDevice = () => {
  getCurrentPorts()
  if (sensorConfigsRef.value) {
    sensorConfigsRef.value.clearAllNodes(); // 调用子组件的方法
  }
  // directive.value = 'shutdown'
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
    // showRecordOnDevice.value = false
    switchLoading.value = false
    ElMessage({
      message: "设备关闭中",
      type: 'success',
    })
  }).catch((err: any) => {
    switchLoading.value = false
    // showRecordOnDevice.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    console.error(err, 'err')
    ElMessage({
      message: "关闭设备失败"+errmsg,
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
    // showRecordOnDevice.value = false
    switchLoading.value = false
    pageLoading.value = true
    loadingtext.value = '设备采集中，请稍后...'
    ElMessage({
      message: "设备正在采集中",
      type: 'success',
    })
  }).catch((err: any) => {
    console.error(err, 'err')
    switchLoading.value = false
    // showRecordOnDevice.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    ElMessage({
      message: "设备采集失败"+errmsg,
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
    // showRecordOnDevice.value = true
    switchLoading.value = false
    pageLoading.value = true
    loadingtext.value = '设备结束采集中，请稍后...'
    ElMessage({
      message: "设备正在结束采集中",
      type: 'success',
    })
  }).catch((err: any) => {
    // showRecordOnDevice.value = true
    switchLoading.value = false
    const errmsg = err?.response?.data?.errors[0]?.detail
    console.error(err, 'err')
    ElMessage({
      message: "结束采集失败"+errmsg,
      type: 'error',
    })
  })
}

const currentSelectedSensorId = ref([])

const getCurrentPorts = () => {
  currentSelectedSensor.value = selectedLeafNodes.value.map(node => node.port)
  currentSelectedSensorId.value = selectedLeafNodes.value.map(node => node.deviceid)
}

//获取设备树
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {}).then((res: any) => {
      viewportId.value = res.data.data[0].id
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

//获取标签列表
const tagData = ref([])
const getTags = (lidarname: string) => {
  try {
    findAll('/models/tags', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('tags')
      tagData.value = datavalue
      transferData.value = datavalue.map((item: any) => {
        return {
          key: item.id,
          label: item.name,
          data: item
        }
      })
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const handleSelectTag = (tagData: any) => {
  const currentTime = new Date().toISOString()
  const params = {
    "data": {
      "type": "taggings",
      "attributes": {
        "tagid": tagData.id,
        "tagname": tagData.name,
        "tagtype": tagData.type,
        "tagcategory": tagData.category,
        "starttime": currentTime,
        "endtime": currentTime,
        "triggertime": currentTime,
      }
    }
  }
  addItem('/models/taggings', params).then((res: any) => {
    ElMessage({
      message: "打标签成功",
      type: 'success',
    })
  }).catch((err: any) => {
    console.error(err, 'err')
    ElMessage({
      message: "打标签失败",
      type: 'error',
    })
  })
}

const handleCommand = (command, row) => {
  if(command == '删除'){  
    const params = {
      data: {
        id: row.id,
        type: 'taggings'
      }
    }
    deleteItem('/models/taggings', params).then(res => {
      ElMessage({
        message: "删除成功",
        type: 'success',
      })
      getTaggings()
    }).catch(err => {
      console.error(err, 'err')
      const {response:{data:{errors}}} = err
      let msg =  "删除失败"
      if(errors && errors[0]) {
        const errmsg = errors[0]['detail']
        msg =  t(`algorithm['${errmsg}']`)
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
    })
  }
}

const handleClick = (e) =>{
  // activeRow.value = e
  console.log(e)
}


const formatter = (thistime: any, fmt: string) => {
  if (!thistime) return '--'
  const isUTC = thistime.indexOf('Z') > -1 ? 'UTC' : ''
  // const isUTC = ""
  let $this = new Date(thistime)
  let o = {
    'M+': $this[`get${isUTC}Month`]() + 1,
    'd+': $this[`get${isUTC}Date`](),
    'h+': $this[`get${isUTC}Hours`](),
    'm+': $this[`get${isUTC}Minutes`](),
    's+': $this[`get${isUTC}Seconds`](),
    'q+': Math.floor(($this[`get${isUTC}Month`]() + 3) / 3),
    'S': $this[`get${isUTC}Milliseconds`]()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ($this[`get${isUTC}FullYear`]() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

const gotologsanalyze = () => {
  const routeUrl = router.resolve({ path: '/systemanage/statusmonitor' }).href;
  window.open(routeUrl, '_blank');
}

// 监听浏览器事件
function handleBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = ''; // 某些浏览器需要设置一个返回值来触发提示框
}

onMounted(() => {
  window.top.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('beforeunload', handleBeforeUnload);

  queryCurrentDrivers()
  getTags()

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
      pageLoading.value = false
      ElNotification({
        title: '收到一条新事件',
        type: severity !== '2' ? 'warning' : 'error',
        message: content,
        duration: 5000,
        position: 'bottom-right',
        onClick() {
          gotologsanalyze();
        },
      })
    } else if (state == '1') {
      pageLoading.value = false
    }
    
  };

  // 监听错误事件
  eventSource.onerror = () => {
    error.value = '连接失败或服务器错误';
    eventSource.close(); // 关闭连接
  };
})

onBeforeUnmount(() => {
  window.top.removeEventListener('beforeunload', handleBeforeUnload);
  window.removeEventListener('beforeunload', handleBeforeUnload);
});

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
.tags-transfer {

  .el-transfer-panel__filter {
    margin: 0 !important;
  }

  .el-button.is-disabled {
    background-color: #FFF1E5;
    border-color:#FFF1E5;
    color: #FF7900;
  }
  .el-button--primary {
    background-color: #FF7900;
    border-color:#FF7900;
  }

  .el-checkbox {
    // background-color: #FF7900;
    // border-color: #FF7900;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #FF7900;
    border-color: #FF7900;
  }
  .el-checkbox__input:hover .el-checkbox__inner  {
    border-color: #FF7900;
  }


  .el-checkbox__input.is-checked+.el-checkbox__label,  .el-checkbox__label:hover, .el-checkbox__input:hover, .el-checkbox__input:hover { 
    color: #FF7900;
  }
}
</style>