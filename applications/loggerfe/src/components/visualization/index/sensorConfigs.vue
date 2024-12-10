<template>
  <div class="display-panel disable-selector">
    <div class="grid-content ml">
     <div class="title-area">
      <div class="title">
        配置信息
        <el-tooltip placement="top" effect="light">
          <template #content>
            <div style="display: flex;flex-direction: column;">
              <div style="display: flex;align-items: center;">
                <div style="width: 10px;height: 10px;background-color: #d0d7de; margin-right: 6px;"></div> 
                <span style="color: black;">未知</span>
              </div>
              <div style="display: flex;align-items: center;">
                <div style="width: 10px;height: 10px;background-color: #28a745; margin-right: 6px;"></div> 
                <span style="color: black;">成功</span>
              </div>
              <div style="display: flex;align-items: center;">
                <div style="width: 10px;height: 10px;background-color: #ffc107; margin-right: 6px;"></div> 
                <span style="color: black;">警告</span>
              </div>
              <div style="display: flex;align-items: center;">
                <div style="width: 10px;height: 10px;background-color: #dc3545; margin-right: 6px;"></div> 
                <span style="color: black;">故障</span>
              </div>
            </div>
          </template>
          <el-icon><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
      <div class="status-title">
        <span class="status-title-item">设备</span>
        <span class="status-title-item">数据</span>
        <span class="status-title-item">显示</span>
        <span class="status-title-item">存储</span>
      </div>
     </div>

      <div class="tree-area">
        <el-tree
          ref="treeRef"
          style="width: 360px"
          :data="treedata"
          default-expand-all
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
          :props="defaultProps"
          :render-content="renderContent"
          @check-change="handleCheckChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, defineEmits, defineProps } from 'vue'
import DataSource from './DataSource.vue'
import { useI18n } from 'vue-i18n'
import { ElTree, ElMessage, ElMessageBox, ElIcon } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll, findItem, addItem } from '@/api/jsonApi'
import { getRemoteFile } from '@/api/api'
import gostore from '@/services/governance-store'
import type { TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import Vue from 'vue/dist/vue.esm-bundler.js';
import { Search, InfoFilled, Refresh } from "@element-plus/icons-vue"
const { t } = useI18n()

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const props = defineProps({
  viewportId: String,
  testDevice: Boolean,
  startCollect: Boolean,
  viewports: Array,
});

const renderTreeCheckbox = (isStartCollect: boolean) => {
  treedata.value.forEach((parent) => {
    const childrensBoolean = parent.children && parent.children.length > 0
    parent.disabled = isStartCollect ? true : (childrensBoolean ? false : true)
    if (childrensBoolean) {
      parent.children.forEach((child) => {
        child.disabled = isStartCollect ? true : (child.devicedata ? false : true)
      })
    }
  })
}

const form = reactive({})
const activeNameTab = ref('second')
const RemoteComponent = ref<any>(null);

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const treeRef = ref<InstanceType<typeof ElTree>>()

const emit = defineEmits(['update:leafNodes', 'setAllTreeKeys']);
const handleCheckChange = async(data, checked, indeterminate) => {
  //获取叶子节点信息并传递给父级组件
  const checkedNodes = treeRef.value.getCheckedNodes();
  console.log(checkedNodes)   
  const leafNodes = checkedNodes.filter(node => !node.children || node.children.length === 0);
  emit('update:leafNodes', leafNodes.map(node => ({ 
    id: node.id, 
    label: node.label, 
    deviceid: node.devicedata.id, 
    port: node.devicedata['display-port'] ,
    type: node.devicedata.type,
  })));
};

const allTreeKeys = ref([])

const selectAllNodes = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(allTreeKeys.value.map(node => node.value));
  }
};

const selectSomeNodes = (isrecordingNodes) => {
  const isrecordingArr = isrecordingNodes.map((node) => node.deviceKey);
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(allTreeKeys.value.filter(it => isrecordingArr.includes(it.key)).map(node => node.value));
  }
}

// 取消所有选中
const clearAllNodes = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([]);
  }
};

// 点击树节点
const handleNodeClick = (data: Tree) => {
  // getSensoronfigs(data.label)
}

// const getSensoronfigs = (lidarname: string) => {
//   try {
//     findAll('/models/devices', {'filter[slot]': lidarname}).then((res: any) => {
//       gostore.reset()
//       gostore.sync(res.data)
//       const datavalue = gostore.findAll('devices')
//     }).catch((err: any) => {
//       console.log(err, 'err')
//     })
//   } catch (error) {
//     console.error(error)
//   }
// }

const gotoSetConfigs = () => {
  window.history.pushState(null, '', `/loggerfe/root/createConfig`)
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const renderContentUrl = `http://loggertrash/monitor/d/c23d6b86-b6db-4188-860d-f48c9c79894c/device-state?orgId=1&refresh=1s&kiosk&theme=light`
const renderContentStyle = 'width: 20px; height: 20px; background-color: #fff; margin-left:10px;border: 2px solid #fff;'
// 自定义树节点的渲染内容
const renderContent = (h, { node, data }) => {
  if (!data.children && data.devicedata) {
    return h('div',{
        style: 'display:flex;align-items:center;',
      },
      [
      h('div', {
        style: 'margin-right: 16px;min-width:90px;text-align:left;',
      },node.label), // 节点标签
      h('iframe', {
        src: `${renderContentUrl}&var-device=${data.devicedata.key}`,
        style: `width: 115px;height:15px;background-color: #fff;border: 2px solid #fff;`,
      }),
      // h(
      //   'span',
      //   { title: '重启设备' },
      //   [
      //     h(ElIcon, {
      //       style: 'margin-left: 18px;color:#ff7900;font-size:16px;cursor:pointer;',
      //       onClick: () => handleTreeReconnectClick(node, data)
      //     }, { default: () => h(Refresh) })
      //   ]
      // ),
    ]);
  } else {
    return h('span', {style: 'margin-right: 16px;min-width:90px;text-align:left;'}, node.label); // 非叶子节点只显示标签
  }
};

const handleTreeReconnectClick = (node, data) => {
  if (!props.testDevice) {
    ElMessage.warning('请先初始化设备！')
    return;
  }
  if (props.startCollect) {
    ElMessage.warning('请先停止采集！')
    return;
  }
  ElMessageBox.alert(`是否重新启动设备 ${data.label} ?`, '', {
    confirmButtonText: '确认',
    autofocus: false,
    callback: (action: Action) => {
      if (action === 'confirm') {
        const params = {
          "data": {
            "type": "actions",
            "attributes": {
              "command": "reboot",
              "devices": [node.data.devicedata.id],
              "viewport": props.viewportId
            }
          }
        }
        addItem('/models/actions', params).then((res: any) => {
          ElMessage({
            message: "设备正在重启中 ",
            type: 'success',
          })
        }).catch((err: any) => {
          const errmsg = err?.response?.data?.errors[0]?.detail
          ElMessage({
            message: "重启设备失败: "+errmsg,
            type: 'error',
          })
        })
      }
    }
  })
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const getCurrentDrivers = (datavalue) => {
  try {
    // findAll('/models/viewports', {include: 'devices', 'filter[using]': true}).then((res: any) => {
    //   gostore.reset()
    //   gostore.sync(res.data)
    //   const datavalue = gostore.findAll('viewports')
      name.value = datavalue[0].name
      const devicehub = datavalue[0]['device-hub']
      const device = datavalue[0]['devices']
      sensorData.value = devicehub
      const devicehubdata = devicehub.map((item: any) => {
        return {
          ...item,
          devicedata: device.find((it: any) => it.slot === item.id),
        }
      })
      treedata.value = totree(devicehubdata)
    // }).catch((err: any) => {
    //   console.log(err, 'err')
    // })
  } catch (error) {
    console.error(error)
  }
}

const totree = (data) => {
  const tree = [];
  allTreeKeys.value = []
  const allports = []
  // 通过类型分组
  data.forEach(sensor => {
    let parent = tree.find(node => node.label === sensor.type);
    
    // 创建父节点
    if (!parent) {
      parent = {
        id: sensor.type,
        label: sensor.type,
        children: []
      };
      tree.push(parent);
    }

    // 添加子节点
    parent.children.push({
      id: sensor.type+'_'+sensor.id,
      devicedata: sensor.devicedata,
      label: sensor.id,
      disabled: !sensor.devicedata
    });
    if (sensor.devicedata) {
      allports.push({
        port:sensor.devicedata['display-port'],
        type:sensor.devicedata.type
      })
      allTreeKeys.value.push({
        key:sensor.id,
        value:sensor.type+'_'+sensor.id
      })
    }
  });
  emit('setAllTreeKeys', allports)
  return tree;
}

const changePointSize = (value: number) => {
  emit('changeProps', { size: value })
}

const changeColorProp = (value: string) => {
  emit('changeProps', { color: value.slice(1) })
}

onMounted(() => {
  // queryCurrentDrivers()
});

defineExpose({
  selectAllNodes,
  clearAllNodes,
  selectSomeNodes
});

watch(() => props.startCollect, (newVal) => {
  renderTreeCheckbox(newVal)
},{immediate: true})

watch(() => props.viewports, (newVal) => {
  getCurrentDrivers(newVal)
},{immediate: true})

</script>
<style lang="scss">

.el-tree-node__content {
  height: 32px;
}
.panel-header {
  display: none !important;
}

.el-button--primary {
  background: #FF7900;
  border: none;
}

// .el-button--primary:hover{
//   color: #FF7900;
//   background: #FFF1E5;
//   border: 1px solid #FF7900;
// }
</style>
<style scoped lang="scss">
.item-wrap {
  padding: 0 16px;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  .mr-2 {
    margin-right: 14px;
  }

  .mr-4 {
    margin-right: 28px;
  }

  .mr-6 {
    margin-right: 42px;
  }

  .size-input {
    width: 180px;

    ::v-deep .el-input__wrapper {
      width: 180px;
    }
  }
}

.ml {
  padding-left: 20px;
}
.tree-area {
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  min-height: 220px;
  overflow: auto;
  overflow-x: hidden;
}

.display-panel {
  // background: rgba(255, 255, 255, 1);
  width: 400px;
  min-width: 20rem;
  max-width: 30rem;
  height: 100%;
  overflow: auto;
  padding-right: 20px;

  .title-area {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    .title {
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 600;
      color: #5A5E72;
      text-align: left;
    }

    .status-title {
      margin-left: 52px;

      .status-title-item {
        font-size: 12px;
        margin-left: 5px;
        color: #606266;
      }
    }
  }

  

}

.el-descriptions__content {
  .el-select {
    width: 120px;
  }
}

.operation {
  display: flex;
  justify-content: space-around;
  align-items: center;

  > * {
    margin-left: 5px;
  }
}

.expand-form {
  .el-input-number--mini {
    width: 100px;
  }

  .el-form-item {
    margin-bottom: 0px;
  }
}
.el-collapse-item {
  padding-left: 0.75rem;
}
</style>


