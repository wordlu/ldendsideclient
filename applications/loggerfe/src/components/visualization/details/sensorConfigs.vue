<template>
  <div class="display-panel disable-selector">
    <div class="grid-content ml">
      <!-- <el-input v-model="search" class="search-bar" placeholder="搜索传感器名称" :prefix-icon="Search" style="margin-bottom: 20px;"/> -->
     <div class="title">配置信息</div>

      <div class="tree-area">
        <el-tree
          ref="treeRef"
          style="width: 300px"
          :data="treedata"
          show-checkbox
          default-expand-all
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
          :props="defaultProps"
          @check-change="handleCheckChange"
        />
      </div>
      <div class="config-area">
        <div v-if="setConfigValue" class="info-btn-group">
          <el-divider>
          </el-divider>
        </div>
        <div v-if="!setConfigValue" style="margin-top: 20px">
          <el-tabs
            v-model="activeNameTab"
            type="card"
            class="demo-tabs"
          >
            <el-tab-pane label="显示设置" name="second">
              <div class="item-wrap">
                <span class="mr-6">视角</span>
                <div class="py-2">
                  <el-button circle :disabled="selMode !== 'move'" @click="viewChange('xy')"
                    >XY</el-button
                  >
                  <el-button circle :disabled="selMode !== 'move'" @click="viewChange('xz')"
                    >XZ</el-button
                  >
                  <el-button circle :disabled="selMode !== 'move'" @click="viewChange('yz')"
                    >YZ</el-button
                  >
                </div>
              </div>
              <!-- <div class="item-wrap">
                <span class="mr-2">点云大小</span>
                <el-input-number
                  v-model="pointSize"
                  class="size-input"
                  :precision="2"
                  size="small"
                  :min="0.01"
                  :max="10"
                  :step="0.01"
                  @change="changePointSize" />
              </div> -->
              <!-- 当颜色策略为固定颜色值,设置固定颜色值 -->
              <!-- <div v-if="colorProp === 'fixed'" class="item-wrap">
                <span class="mr-4">颜色值</span>
                <el-color-picker v-model="color" size="small" @change="changeColorProp" />
              </div> -->
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, reactive, defineEmits, defineProps } from 'vue'
import DataSource from './DataSource.vue'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll } from '@/api/jsonApi'
import { getRemoteFile } from '@/api/api'
import gostore from '@/services/governance-store'
import type { TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import Vue from 'vue/dist/vue.esm-bundler.js';
import { Search } from "@element-plus/icons-vue"
import { useRoute } from 'vue-router';

// 获取当前路由对象
const route = useRoute();

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const props = defineProps({
  deviceids: Array
});

const form = reactive({})
const activeNameTab = ref('second')
const setConfigValue = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()
const emit = defineEmits(['update:leafNodes', 'setAllTreeKeys', 'setDevicesHub']);

const handleCheckChange = (node, checked) => {
  const checkedNodes = treeRef.value.getCheckedNodes();
  const leafNodes = checkedNodes.filter(node => !node.children || node.children.length === 0);
  console.log(leafNodes, 'leafNodes')
  emit('update:leafNodes', leafNodes.map(node => ({ id: node.id, label: node.label, deviceid: node.devicedata.id, port: node.devicedata['display-port'] })));
};

const allTreeKeys = ref([])

const selectAllNodes = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys(allTreeKeys.value);
    setTimeout(() => {
      handleCheckChange()
    })
  }
};

const handleNodeClick = (data: Tree) => {
  // 查询当前节点是否配置过
  getSensoronfigs(data.label)
}

const getSensoronfigs = (lidarname: string) => {
  try {
    findAll('/models/devices', {'filter[slot]': lidarname}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      if(datavalue.length > 0 && datavalue[0].type === 'lidar') {
        setConfigValue.value = false
      } else {
        setConfigValue.value = true
      }
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}
const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {include: 'devices', 'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      const devicehub = datavalue[0]['device-hub']
      emit('setDevicesHub', devicehub)
      const device = datavalue[0]['devices']
      const devicehubdata = devicehub.map((item: any) => {
        return {
          ...item,
          devicedata: device.find((it: any) => it.slot === item.id),
        }
      })
      treedata.value = totree(devicehubdata)
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const totree = (data) => {
  const tree = [];
  allTreeKeys.value = []
  // 通过类型分组
  data.forEach(sensor => {
    let parent = tree.find(node => node.label === sensor.type);
    
    // 创建父节点
    if (!parent) {
      parent = {
        id: sensor.type,
        label: sensor.type,
        children: [],
        disabled: sensor.type === 'imu' || sensor.type === 'radar',
      };
      tree.push(parent);
    }

    // 添加子节点
    parent.children.push({
      id: sensor.type+'_'+sensor.id,
      devicedata: sensor.devicedata,
      label: sensor.id,
      disabled: !sensor.devicedata || sensor.devicedata.type === 'radar' || sensor.devicedata.type === 'imu',
    });
    if (sensor.devicedata) {
      // 当前dataset中包含的设备id则自动勾选上
      if (props.deviceids.includes(sensor.devicedata.id)) {
        allTreeKeys.value.push(sensor.type+'_'+sensor.id)
      }
    }
  });
  selectAllNodes()
  return tree;
}

onMounted(() => {
  queryCurrentDrivers()
});

const changePointSize = (value: number) => {
  emit('changeProps', { size: value })
}

const changeColorProp = (value: string) => {
  emit('changeProps', { color: value.slice(1) })
}

defineExpose({
  selectAllNodes,
});

</script>

<style scoped lang="scss">

.el-button--primary {
  background: #FF7900;
  border: none;
}
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
  // height: 200px;
  height: auto;
  overflow: auto;
}

.display-panel {
  // background: rgba(255, 255, 255, 1);
  width: 400px;
  min-width: 20rem;
  max-width: 30rem;
  height: 100%;
  overflow: auto;
  padding-right: 20px;

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #5A5E72;
    margin-bottom: 10px;
    text-align: left;
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
<style>
.panel-header {
  display: none !important;
}
</style>
