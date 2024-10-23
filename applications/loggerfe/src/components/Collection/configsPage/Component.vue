<!--采集配置 -->
<template>
  <div class="config-container"  
    :element-loading-text="loadingtext"
    v-loading="pageLoading" >
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集配置</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">{{ name }}</b>
          </div>
        </div>
      </div>
    </div>
    <el-row class="config-content">
      <el-col :span="8" style="height: 100%;">
        <div class="grid-content bg-black" ref="parent">
          <img ref="backgroundImage" :src="`http://loggertrash/dms-static/viewports/${viewport_bg}`" alt="Background Image" :style="[baseStyle]">
          <canvas 
            style="position: absolute;"
            ref="sensorCanvas" 
            @click="handleCanvasClick"
          >
            Your browser does not support canvas.
          </canvas>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content ml">
          <div class="tree-area">
            <el-tree
              ref="treeRef"
              class="tree-content"
              :data="treedata"
              default-expand-all
              node-key="id"
              :highlight-current="false"
              @node-click="handleNodeClick"
              :props="defaultProps"
            >
              <template #default="{ node, data }">
                <span :class="{ 'highlight': isLeaf(data, node) && selectedNode === node }">
                  {{ data.label }}
                </span>
              </template>
            </el-tree>
            <div class="btn-area" v-if="!setConfigValue">
              <el-button type="primary" @click="onSubmit">保存</el-button>
              <el-button @click="onDelete">删除</el-button>
            </div>
          </div>
          <div class="config-area" v-show="selectedNode">
            <div v-if="setConfigValue" class="info-btn-group">
              <el-divider />
              <el-button type="primary" class="info-btn" @click="gotoSetConfigs">配置设备</el-button>
            </div>
            <div v-if="!setConfigValue" style="margin-top: 20px">
              <el-tabs
                v-model="activeName"
                type="card"
                class="demo-tabs"
              >
                <el-tab-pane label="设备配置" name="first">
                    <el-form :model="form" label-width="auto" style="max-width: 600px">
                      <el-form-item label="设备驱动类型">
                        <el-select v-model="form.type" placeholder="请选择驱动" @change="handleDriverChange">
                          <!-- <el-option label="Zone one" value="shanghai" /> -->
                          <el-option v-for="item in driversdataOptions" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                      </el-form-item>
                      <div v-if="RemoteComponent">
                        <!-- 动态渲染远程加载的组件 -->
                        <component :is="RemoteComponent" ref="remoteComponentRef"></component>
                      </div>
                    </el-form>
                </el-tab-pane>
                <!-- <el-tab-pane label="显示设置" name="second">显示设置</el-tab-pane> -->
              </el-tabs>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
  
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useVisualizeStore } from '@/store/modules/visualize'
import { useCollectStore } from '@/store/modules/collect'
import TopOprt from '@/components/collect/TopOprt.vue'
import OperatingTags from '@/components/tags/OperatingTags.vue'
import PrepareInfo from '@/components/collect/PrepareInfo.vue'
import { ref, onMounted, watchEffect, reactive, nextTick, markRaw } from 'vue'
import { setCollectionStatus } from '@/api/s1/collect'
// import Monitor from '@/components/monitor/Index.vue'
import { Search } from "@element-plus/icons-vue"
import { ElTree, ElMessage } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll, addItem, patchItem, deleteItem } from '@/api/jsonApi'
import { getRemoteFile } from '@/api/api'
import gostore from '@/services/governance-store'
import type { TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';


interface Tree {
  id: number
  label: string
  children?: Tree[]
}
const baseStyle = ref({})
const loadingtext = ref('')
const pageLoading = ref(false)

const router = useRouter();
const form = reactive({})

const activeName = ref('first')
const RemoteComponent = ref<any>(null);
const search = ref('')
const onDelete = () => {
  const params = {
      data: {
        id: currentDevice.value.id,
        type: 'devices'
      }
    }
  deleteItem('/models/devices', params).then(res => {
    ElMessage({
      message: "删除成功",
      type: 'success',
    })
    refresh()
  }).catch(err => {
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

const refresh = () => {
  setTimeout(() => {
    router.go(0);
  }, 1000);
}

const remoteComponentRef = ref(null); // 用于获取远程组件实例

const getRemoteFormData = () => {
  if (remoteComponentRef.value && remoteComponentRef.value.getFormData) {
    const formData = remoteComponentRef.value.getFormData();
    Object.assign(form, formData);
    console.log('远程组件的表单数据:', formData);
  } else {
    console.error('远程组件加载错误，无法获取表单数据');
  }
};

const onSubmit = async () => {
  getRemoteFormData()
  try {
    // const deviceparams = {
    //   "points_topic": form.points_topic,
    //   "host_name": form.host_name,
    //   "timestamp_mode": form.timestamp_mode,
    //   "ptp_utc_tai_offset": form.ptp_utc_tai_offset,
    //   "point_type": form.point_type,
    //   "receive_topic": form.receive_topic,
    //   "save_topic": form.save_topic,
    //   "bag_file_name": form.bag_file_name,
    // }
    const {type, ...deviceparams} = form
    const params = {
      data: {
        type: 'devices',
        id: currentDevice.value.id,
        attributes: {
          "name": currentDriver.value.name,
          "type": currentDriver.value.type,
          "brand": currentDriver.value.brand,
          "model": currentDriver.value.model,
          "helm-path": currentDriver.value['helm-path'],
          "device-params-path": currentDriver.value['device-params-path'],
          "device-params": deviceparams,
          "driver": currentDriver.value.id,
          "slot": currentDeviceName.value,
          "isdeleted": false,
          "viewport": currentViewport.value.id,
        }
      }
          
    }
    patchItem('/models/devices', params).then((res) => {
      console.log(res)
      ElMessage({
        message: "保存配置成功",
        type: 'success',
      })
      // refresh()
    }).catch(err => {
      let msg = "保存配置失败"
      const {response:{data:{errors}}} = err
      if(errors && errors[0]) {
        msg = errors[0]['detail']
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
      // refresh()
    })
  } catch (error) {
    console.log(error)
  }
}

const setConfigValue = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()
const selectedNode = ref(null);
const handleNodeClick = (nodeData: Tree, node: any) => {
  if (isLeaf(nodeData)) {
    selectedNode.value = node; 
    getSensoronfigs(nodeData)
  }
}
const isLeaf = (nodeData, node) => {
  if (!selectedNode.value && !node.data.children) {
    selectedNode.value = node; 
    getSensoronfigs(nodeData)
  }
  return nodeData && (!nodeData.children || nodeData.children.length === 0);
};
const driversdata = ref<Row[]>([])
const driversdataOptions = ref<Row[]>([])
const queryDeviceDrivers = (page: number) => {
  try {
    findAll('/models/device-drivers', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      driversdata.value = gostore.findAll('device-drivers')
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}
const currentDriver = ref(null)
const handleDriverChange = (row: any) => {
  currentDriver.value = driversdata.value.find(it => it.id === row)
  console.log(currentDriver.value, 'currentDriver.value')
  loadRemoteComponent()

}
const currentDevice = ref({})
const currentDeviceName = ref('')
const getSensoronfigs = (nodedata) => {
  driversdataOptions.value = driversdata.value.filter(it => it.type === nodedata.type)
  currentDeviceName.value = nodedata.label
  try {
    findAll('/models/devices', {'filter[slot]': nodedata.label}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      if(datavalue.length > 0) {
        currentDevice.value = datavalue[0]

        currentDriver.value = driversdata.value.find(it => it.id === currentDevice.value.driver)
        setConfigValue.value = false
        setFormData(datavalue[0])
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

const setFormData = (details: any) => {
  form.type = details.driver
  Object.assign(form, details['device-params']);
}
const gotoSetConfigs = () => {
  window.history.pushState(null, '', `/loggerfe/root/createConfig?type=${selectedNode.value.data.type}&slot=${currentDeviceName.value}&viewport=${currentViewport.value.id}`)
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const currentViewport = ref(null)
const viewport_bg = ref('')
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      currentViewport.value = datavalue[0]
      viewport_bg.value = datavalue[0]['image-path']
      baseStyle.value = datavalue[0].type === "场端" ? {
        height: '689px',
      } : {
        width: '559px',
      }
      name.value = datavalue[0].name
      sensorData.value = datavalue[0]['device-hub']
      treedata.value = totree(datavalue[0]['device-hub'])
      setTimeout(() => {
        createSensorCanvas(treedata.value)
      }, 100)
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
        id: sensor.type,  // 自动生成id
        label: sensor.type,   // 使用type作为label
        children: []
      };
      tree.push(parent);
    }

    // 添加子节点（对应传感器的坐标点）
    parent.children.push({
      id: sensor.type+'_'+sensor.id,  // 子节点id
      label: sensor.id,   
      type: sensor.type    // 用坐标作为label
    });
  });
  console.log(tree, 'tree')
  return tree;
}


// 获取canvas的ref
const sensorCanvas = ref(null);
const backgroundImage = ref(null);
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

onMounted(async () => {
  await queryDeviceDrivers()
  queryCurrentDrivers()
  resizeCanvas();
  // 监听 parent 大小变化
  watchEffect(() => {
    resizeCanvas();
  });
});

// 弹窗提示
const showPopup = (sensor) => {
  
  const node = treeRef.value.getNode(sensor.type+'_'+sensor.id);
  if (node) {
    handleNodeClick(node.data, node)
  }

};

const createSensorCanvas = (treeData) => {
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  drawSensors(ctx);
}

// 画传感器
const drawSensors = (ctx) => {
  // 获取图片宽高
  const imageWidth = backgroundImage.value.clientWidth
  const imageHeight = backgroundImage.value.clientHeight

  // 更新 canvas 大小
  sensorCanvas.value.width = imageWidth
  sensorCanvas.value.height = imageHeight



  sensorData.value.forEach((sensor) => {
    let color;
    switch (sensor.type) {
      case 'camera':
        color = 'green';
        break;
      case 'lidar':
        color = '#ff7900';
        break;
      case 'imu':
        color = 'yellow';
        break;
      default:
        color = 'blue';
    }

    // @wodelu:TODO 计算适应缩放后的坐标
    const scaleX = imageWidth / imageWidth
    const scaleY = imageHeight / imageHeight
    const adjustedX = sensor.x * scaleX
    const adjustedY = sensor.y * scaleY

    
    // 绘制圆形
    ctx.beginPath();
    // ctx.arc(sensor.x, sensor.y, 10, 0, Math.PI * 2);
    ctx.arc(adjustedX, adjustedY, 10, 0, 2 * Math.PI) // 半径为5
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // 绘制 ID
    ctx.font = '14px bold';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textX = adjustedX + 15; // 文字x坐标，偏移圆形
    const textY = adjustedY + 3 // 文字y坐标，与圆形对齐

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
    if (distance < 20) {
      showPopup(sensor);
    }
  });
};

const loadRemoteComponent = async () => {
  try {
    const response = await fetch(`${window.server.mecPrefix}/dms-static/components/${currentDriver.value['component-path']}`);
    const vueFile = await response.text();
    const { descriptor } = parse(vueFile);
    const script = compileScript(descriptor, { id: 'remote-component' });
    const { code: templateCode } = compileTemplate({ source: descriptor.template!.content, id: 'remote-component' });

    const scriptFunction = new Function(`
      const exports = {};
      ${script.content.replace('export default', 'exports.default =')}
      return exports.default;
    `);

    const scriptExports = scriptFunction();

    const component = {
      template: descriptor.template!.content || '',
      setup() {
        const data = scriptExports.data ? scriptExports.data.call(this) : {};
        for (const key in data) {
          data[key] = form[key];
        }
        const methods = scriptExports.methods || {};
        for (const key in methods) {
          methods[key] = methods[key].bind(data);
        }

        if (scriptExports.mounted) {
          onMounted(scriptExports.mounted.bind(data));
        }

        return {
          ...data,
          ...methods,
        };
      },
    };
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

    RemoteComponent.value = markRaw(component);
  } catch (err) {
    console.error('Failed to load remote component:', err);
  }
};


</script>
<style scoped lang="scss">
.config-container {
  height: 100%;
  .el-button--primary {
    background: #FF7900;
    border: none;
  }

  .info-btn-group {
    text-align: center;

    .info-btn {
      margin-top: 88px;
    }
  }

  ::v-deep .el-input__icon {
    margin-left: 16px;
  }
  .el-row {
    height: calc(100% - 90px);
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-black {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    // border: 1px solid #eee;
  }
  .ml {
    padding-left: 20px;
  }

  .config-area {

    .el-tab-pane {
      height: calc(100vh - 500px);
      overflow: auto;
    }
  }

  .tree-area {
    display: flex;
    justify-content: space-between;
    padding-right: 20px;

    .highlight {
      padding: 4px;
      background-color: #FFF1E5;
      color: #FF7900;
    }

    .tree-content {
      width: 300px; 
      height: 260px; 
      overflow: auto;
    }
  }

  .grid-content {
    height: 100%;
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
  .config-content {
    padding: 0 10px;
  }

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }
  .search-bar {
    max-width: 300px;
    padding: 10px
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;

    .info {
      padding: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;
      // justify-content: space-between;

      .info-detail {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .title {
          padding: 4px 0;
        }

        .count {
          color: #687078;
          margin-left: 4px;
        }

        .desc {
          color: #545b64;
          font-size: 12px;
        }

        b {
          display: flex;
        }

        p {
          font-weight: 400;
          margin-top: 2px;
        }
      }

      .info-btn-group {
        flex-grow: 1;
        width: 100px;
        display: flex;
        flex-direction: row-reverse;

        .el-button--primary {
          background: #FF7900;
          border: none;
        }

        .info-btn {
          margin: 5px;
        }
      }

    }
  }

}
</style>
