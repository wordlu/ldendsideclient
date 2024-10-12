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
            @tab-click="handleClick"
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
              <div class="item-wrap">
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
              </div>
              <!-- 当颜色策略为固定颜色值,设置固定颜色值 -->
              <div v-if="colorProp === 'fixed'" class="item-wrap">
                <span class="mr-4">颜色值</span>
                <el-color-picker v-model="color" size="small" @change="changeColorProp" />
              </div>
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
import { useI18n } from 'vue-i18n'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll } from '@/api/jsonApi'
import { getRemoteFile } from '@/api/api'
import gostore from '@/services/governance-store'
import type { TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import Vue from 'vue/dist/vue.esm-bundler.js';
import { Search } from "@element-plus/icons-vue"
// import { changeProps } from '@/basic_data/visualization'

const { t } = useI18n()

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
const RemoteComponent = ref<any>(null);

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

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

const clearAllNodes = () => {
  if (treeRef.value) {
    treeRef.value.setCheckedKeys([]);
  }
};

const handleNodeClick = (data: Tree) => {
  console.log(data)
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
        // loadRemoteComponent()
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

const gotoSetConfigs = () => {
  window.history.pushState(null, '', `/loggerfe/root/createConfig`)
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {include: 'devices', 'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      console.log(datavalue, 'datavalue')
      name.value = datavalue[0].name
      const devicehub = datavalue[0]['device-hub']
      emit('setDevicesHub', devicehub)
      const device = datavalue[0]['devices']
      sensorData.value = devicehub
      const devicehubdata = devicehub.map((item: any) => {
        return {
          ...item,
          devicedata: device.find((it: any) => it.slot === item.id),
        }
      })
      treedata.value = totree(devicehubdata)
      console.log(treedata.value, 'treedata')
      // createSensorCanvas(treedata.value)
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
  const allport = []
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
      if (props.deviceids.includes(sensor.devicedata.id)) {
        allTreeKeys.value.push(sensor.type+'_'+sensor.id)
      }
      allport.push(sensor.devicedata['display-port'])
    }
  });
  selectAllNodes()
  emit('setAllTreeKeys', allport)
  return tree;
}


// 获取canvas的ref
const sensorCanvas = ref(null);
const parent = ref(null);

const resizeCanvas = () => {
  if (parent.value && sensorCanvas.value) {
    // 设置canvas的内部像素大小
    sensorCanvas.value.width = parent.value.clientWidth;
    sensorCanvas.value.height = parent.value.clientHeight;
    // sensorCanvas.value.height = 490;
    // sensorCanvas.value.width = 490;
  }
};

onMounted(() => {
  resizeCanvas();
  // 监听 parent 大小变化
  watchEffect(() => {
    resizeCanvas();
  });
});

// 弹窗提示
const showPopup = (sensor) => {
  alert(`Sensor Type: ${sensor.type}, Position: (${sensor.x}, ${sensor.y})`);
};

// const createSensorCanvas = (treeData) => {
//   const canvas = sensorCanvas.value;
//   const ctx = canvas.getContext("2d");
//   ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
//   drawSensors(ctx);
// }

// 画传感器
const drawSensors = (ctx) => {
  sensorData.value.forEach((sensor) => {
    let color;
    switch (sensor.type) {
      case 'camera':
        color = 'green';
        break;
      case 'lidar':
        color = 'red';
        break;
      default:
        color = 'blue';
    }

    // 绘制圆形
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // 绘制 ID
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white'; // 白色字体
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textX = sensor.x + 15; // 文字x坐标，偏移圆形
    const textY = sensor.y; // 文字y坐标，与圆形对齐

    ctx.fillText(sensor.id, textX, textY);
  });
};

// 点击事件处理
const handleCanvasClick = (event) => {
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  sensorData.value.forEach((sensor) => {
    const distance = Math.sqrt(
      (x - sensor.x) ** 2 + (y - sensor.y) ** 2
    );
    // 如果点击位置在传感器范围内
    if (distance < 10) {
      showPopup(sensor);
    }
  });
};


queryCurrentDrivers()

const loadRemoteComponent = async () => {
  try {
    // Step 1: Fetch the remote .vue file content
    const response = await fetch(`http://daily-report-dev.10.86.14.200.nip.io/test.vue`);
    const vueFile = await response.text();

    // Step 2: Parse the .vue file using @vue/compiler-sfc
    const { descriptor } = parse(vueFile);

    // Step 3: Compile <script> and <template> sections
    const script = compileScript(descriptor, { id: 'remote-component' });
    const { code: templateCode } = compileTemplate({ source: descriptor.template!.content });

    // Create a new Vue component using the compiled script and template
    const component = {
      template: descriptor.template!.content,
      setup: () => {
        const scriptExports = {};
        eval(script.code); // Dynamically evaluate script code
        return scriptExports;
      },
    };

    // Compile and apply styles (if present)
    if (descriptor.styles.length > 0) {
      descriptor.styles.forEach(style => {
        const { code: styleCode } = compileStyle({
          source: style.content,
          id: 'remote-component',
          scoped: style.scoped
        });
        const styleTag = document.createElement('style');
        styleTag.innerHTML = styleCode;
        document.head.appendChild(styleTag);
      });
    }

    // Set the compiled component to render
    RemoteComponent.value = Vue.extend(component);
  } catch (err) {
    console.error('Failed to load remote component:', err);
  }
};

const colorPropOpt = ['x', 'y', 'z', 'intensity'] // 颜色策略

const getStorage = () => {
  let storage
  try {
    storage = JSON.parse(localStorage.getItem('user_settings') || '{}')
  } catch {
    storage = {}
  }
  // 设置默认值:固定颜色自动赋色
  if (storage.isFixColor === undefined) storage.isFixColor = true
  if (storage.autoColorRange === undefined) storage.autoColorRange = true
  return storage
}

// 获取localStorage保存的值
const storageVal = getStorage()

const activeName = ref<string>('dataSources')
const pointSize = ref<number>(storageVal.pointSize || 0.1) // 点云大小
const colorProp = ref<string>(storageVal.isFixColor ? 'fixed' : storageVal.colorProp) // 颜色策略
const color = ref<string>('#00ffff') // 固定颜色值
const minColorPropVal = ref<number>(storageVal.minColorPropVal || 0) // 颜色范围最小值
const maxColorPropVal = ref<number>(storageVal.maxColorPropVal || 100) // 颜色范围最大值
const autoColorRange = ref<boolean>(storageVal.autoColorRange || false) // 是否是自动赋色

// 保存设置到localStorage
const setPropStorage = (params: { [key: string]: string | number | boolean }) => {
  for (let key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      storageVal[key] = params[key]
    }
  }
  console.log(params, 'changeProps')
  // changeProps(params)
  if (storageVal) {
    localStorage.setItem('user_settings', JSON.stringify(storageVal))
  }
}

const changePointSize = (value: number) => {
  // setPropStorage({ pointSize: value })
  emit('changeProps', { size: value })
}

const changeColorProp = (value: string) => {
  // 如果选择的是固定颜色,则设置颜色值
  // if (value === 'fixed') {
  //   setPropStorage({ colorProp: '', isFixColor: true })
  // } else {
  //   setPropStorage({ colorProp: value, isFixColor: false })
  // }
  emit('changeProps', { color: value.slice(1) })
}

const changeColor = (value: string) => {
  setPropStorage({ color: value })
}

const changeMinColor = (value: number) => {
  setPropStorage({ minColorPropVal: value })
}

const changeMaxColor = (value: number) => {
  setPropStorage({ maxColorPropVal: value })
}

const changeAuto = (value: boolean) => {
  setPropStorage({ autoColorRange: value })
}


defineExpose({
  selectAllNodes,
  clearAllNodes
});

</script>

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
  height: 200px;
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
