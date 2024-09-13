<template>
  <div class="display-panel disable-selector">
    <div class="grid-content ml">
      <el-input v-model="search" class="search-bar" placeholder="搜索传感器名称" :prefix-icon="Search" style="width: 200px;margin-bottom: 20px;"/>
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
        />
      </div>
      <div class="config-area">
        <div v-if="setConfigValue" class="info-btn-group">
          <el-divider>
            <!-- <el-icon><Link /></el-icon> -->
          </el-divider>
          <!-- <el-button type="primary" class="info-btn" @click="gotoSetConfigs">配置设备</el-button> -->
        </div>
        <div v-if="!setConfigValue" style="margin-top: 20px">
          <el-tabs
            v-model="activeNameTab"
            type="card"
            class="demo-tabs"
            @tab-click="handleClick"
          >
            <el-tab-pane label="设备配置" name="first">
                <el-form :model="form" label-width="auto" style="max-width: 600px">
                  <el-form-item label="设备类型">
                    <el-select v-model="form.region" placeholder="please select your zone">
                      <el-option label="Zone one" value="shanghai" />
                      <el-option label="Zone two" value="beijing" />
                    </el-select>
                  </el-form-item>
                  <div v-if="RemoteComponent">
                    <!-- 动态渲染远程加载的组件 -->
                    <component :is="RemoteComponent"></component>
                  </div>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="显示设置" name="second">
              <!-- 可折叠配置 -->
              <!-- <el-collapse v-model="activeName"> -->
                <!-- 显示设置 -->
                <!-- <el-collapse-item name="viewSet" :title="t('visualize.visibleSet')"> -->
                  <div class="item-wrap">
                    <span class="mr-2">{{ t('visualize.pointSize') }}</span>
                    <el-input-number
                      v-model="pointSize"
                      size="small"
                      :min="0.0001"
                      :max="10"
                      :step="0.01"
                      @change="changePointSize" />
                  </div>
                  <div class="item-wrap">
                    <!-- 颜色维度 -->
                    <div class="flex mt-4">
                      <span class="mr-2">{{ t('visualize.colorProp') }}</span>
                      <el-select
                        v-model="colorProp"
                        :placeholder="t('common.selectHolder')"
                        size="small"
                        @change="changeColorProp">
                        <el-option v-for="item in colorPropOpt" :key="item" :label="item" :value="item" />
                        <el-option key="isFixColor" lable="fixed" value="fixed"></el-option>
                      </el-select>
                      <!-- 当颜色策略为固定颜色值,设置固定颜色值 -->
                      <div v-if="colorProp === 'fixed'" class="ml-4">
                        <span class="mr-2">{{ t('common.colorVal') }}</span>
                        <el-color-picker v-model="color" size="small" @change="changeColor" />
                      </div>
                    </div>
                    <!-- 最大值/最小值/自动 -->
                    <div class="mt-4">
                      <span class="mr-2">{{ t('visualize.minVal') }}</span>
                      <el-input-number
                        v-model="minColorPropVal"
                        size="small"
                        :disabled="autoColorRange"
                        :min="-numberLimit"
                        :max="maxColorPropVal"
                        @change="changeMinColor" />
                    </div>
                    <div class="mt-4">
                      <span class="mr-2">{{ t('visualize.maxVal') }}</span>
                      <el-input-number
                        v-model="maxColorPropVal"
                        size="small"
                        :disabled="autoColorRange"
                        :min="minColorPropVal"
                        :max="numberLimit"
                        @change="changeMaxColor" />
                      <span class="mr-2 ml-4">{{ t('visualize.auto') }}</span>
                      <el-switch v-model="autoColorRange" @change="changeAuto" />
                    </div>
                  </div>
                <!-- </el-collapse-item>
              </el-collapse> -->
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, reactive } from 'vue'
import DataSource from './DataSource.vue'
import { changeProps } from '@/basic_data/visualization'
import { useI18n } from 'vue-i18n'
import { numberLimit } from '@/utils/common'
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll } from '@/api/jsonApi'
import { getRemoteFile } from '@/api/api'
import gostore from '@/services/governance-store'
import type { TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import { Search } from "@element-plus/icons-vue"
const { t } = useI18n()

interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const activeNameTab = ref('first')
const RemoteComponent = ref<any>(null);

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const setConfigValue = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()

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
      if(datavalue.length > 0) {
        setConfigValue.value = false
        loadRemoteComponent()
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
    findAll('/models/viewports', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      console.log(datavalue, 'datavalue')
      name.value = datavalue[0].name
      sensorData.value = datavalue[0]['device-hub']
      treedata.value = totree(datavalue[0]['device-hub'])
      createSensorCanvas(treedata.value)
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const totree = () => {
  const tree = [];
  // 通过类型(type)分组
  sensorData.value.forEach(sensor => {
    // 查找当前type是否已经存在于树结构中
    let parent = tree.find(node => node.label === sensor.type);
    
    // 如果没有找到，创建一个新的节点
    if (!parent) {
      parent = {
        id: tree.length + 1,  // 自动生成id
        label: sensor.type,   // 使用type作为label
        children: []
      };
      tree.push(parent);
    }

    // 添加子节点（对应传感器的坐标点）
    parent.children.push({
      id: parent.children.length + 1 + tree.length,  // 子节点id
      label: sensor.id,       // 用坐标作为label
    });
  });
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

const createSensorCanvas = (treeData) => {
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  drawSensors(ctx);
}

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
    RemoteComponent.value = component;
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
const pointSize = ref<number>(storageVal.pointSize || 0.01) // 点云大小
const colorProp = ref<string>(storageVal.isFixColor ? 'fixed' : storageVal.colorProp) // 颜色策略
const color = ref<string>(storageVal.color || '#ff0000') // 固定颜色值
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
  changeProps(params)
  if (storageVal) {
    localStorage.setItem('user_settings', JSON.stringify(storageVal))
  }
}

const changePointSize = (value: number) => {
  setPropStorage({ pointSize: value })
}

const changeColorProp = (value: string) => {
  // 如果选择的是固定颜色,则设置颜色值
  if (value === 'fixed') {
    setPropStorage({ colorProp: '', isFixColor: true })
  } else {
    setPropStorage({ colorProp: value, isFixColor: false })
  }
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
</script>

<style scoped lang="scss">

.ml {
  padding-left: 20px;
}
.tree-area {
  display: flex;
  justify-content: space-between;
  padding-right: 20p
}

.display-panel {
  // background: rgba(255, 255, 255, 1);
  width: 400px;
  min-width: 20rem;
  max-width: 30rem;
  height: 100%;
  overflow: auto;
  padding-right: 20px;
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
