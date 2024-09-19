<!--采集配置 -->
<template>
  <div class="config-container">
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
          <el-input v-model="search" class="search-bar" placeholder="搜索传感器名称" :prefix-icon="Search" />
        </div>
      </div>
    </div>
    <el-row class="config-content">
      <el-col :span="8">
        <div class="grid-content bg-black" ref="parent">
          <canvas 
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
              show-checkbox
              default-expand-all
              node-key="id"
              highlight-current
              @node-click="handleNodeClick"
              :props="defaultProps"
            />
            <div class="btn-area" v-if="!setConfigValue">
              <el-button type="primary" @click="onSubmit">保存</el-button>
              <el-button @click="onDelete">删除</el-button>
            </div>
          </div>
          <div class="config-area">
            <div v-if="setConfigValue" class="info-btn-group">
              <el-divider>
              </el-divider>
              <el-button type="primary" class="info-btn" @click="gotoSetConfigs">配置设备</el-button>
            </div>
            <div v-if="!setConfigValue" style="margin-top: 20px">
              <el-tabs
                v-model="activeName"
                type="card"
                class="demo-tabs"
                @tab-click="handleClick"
              >
                <el-tab-pane label="设备配置" name="first">
                    <el-form :model="form" label-width="auto" style="max-width: 600px">
                      <el-form-item label="设备类型">
                        <el-select v-model="form.type" placeholder="请选择驱动" @change="handleDriverChange">
                          <!-- <el-option label="Zone one" value="shanghai" /> -->
                          <el-option v-for="item in driversdata" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                      </el-form-item>
                      <div v-if="RemoteComponent">
                        <!-- 动态渲染远程加载的组件 -->
                        <component :is="RemoteComponent" @submit="handleFormSubmit"></component>
                        <!-- 展示从远程组件获取的表单数据 -->
                        <el-form :model="form" label-width="auto" ref="formRef" style="max-width: 600px">
                          <el-form-item label="host_name">
                            <el-input v-model="form.host_name" />
                          </el-form-item>
                          <el-form-item label="points_topic">
                            <el-input v-model="form.points_topic" />
                          </el-form-item>
                          <el-form-item label="timestamp_mode">
                            <el-input v-model="form.timestamp_mode" />
                          </el-form-item>
                          <el-form-item label="ptp_utc_tai_offset">
                            <el-input v-model="form.ptp_utc_tai_offset" />
                          </el-form-item>
                          <el-form-item label="point_type">
                            <el-input v-model="form.point_type" />
                          </el-form-item>
                          <el-form-item label="receive_topic">
                            <el-input v-model="form.receive_topic" />
                          </el-form-item>
                          <el-form-item label="save_topic">
                            <el-input v-model="form.save_topic" />
                          </el-form-item>
                          <el-form-item label="bag_file_name">
                            <el-input v-model="form.bag_file_name" />
                          </el-form-item>
                        </el-form>
                      </div>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="显示设置" name="second">显示设置</el-tab-pane>
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
import { ref, onMounted, watchEffect, reactive } from 'vue'
import { setCollectionStatus } from '@/api/s1/collect'
// import Monitor from '@/components/monitor/Index.vue'
import { Search } from "@element-plus/icons-vue"
import { ElTree } from 'element-plus'
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

const form = reactive({})

const activeName = ref('first')
const RemoteComponent = ref<any>(null);

const onDelete = () => {
  const params = {
      data: {
        id: currentDevice.value.id,
        type: 'algorithmversions'
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

const onSubmit = async () => {
  try {
    const deviceparams = {
      "points_topic": form.points_topic,
      "host_name": form.host_name,
      "timestamp_mode": form.timestamp_mode,
      "ptp_utc_tai_offset": form.ptp_utc_tai_offset,
      "point_type": form.point_type,
      "receive_topic": form.receive_topic,
      "save_topic": form.save_topic,
      "bag_file_name": form.bag_file_name,
    }
    const params = {
      data: {
        type: 'devices',
        id: currentDevice.value.id,
        attributes: {
          "device-params": deviceparams,
        }
      }
          
    }
    patchItem('/models/devices', params).then((res) => {
      console.log(res)
      ElMessage({
        message: "保存配置成功",
        type: 'success',
      })
    }).catch(err => {
      let msg = t(`common['操作失败']`)
      const {response:{data:{errors}}} = err
      if(errors && errors[0]) {
        msg = errors[0]['detail']
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
    })
  } catch (error) {
    console.log(error)
  }
}



const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const setConfigValue = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()

const handleNodeClick = (data: Tree) => {
  console.log(data)
  getSensoronfigs(data.label)
}
const driversdata = ref<Row[]>([])

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
  currentDriver.value = driversdata.value.find(it => it.name === row)
  console.log(currentDriver.value, 'currentDriver.value')
  loadRemoteComponent()

}
const currentDevice = ref({})
const currentlidarname = ref('')
const getSensoronfigs = (lidarname: string) => {
  currentlidarname.value = lidarname
  try {
    findAll('/models/devices', {'filter[slot]': lidarname}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      if(datavalue.length > 0) {
        currentDevice.value = datavalue[0]
        setConfigValue.value = false
        loadRemoteComponent()
        setFormData(datavalue[0])
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
  form.points_topic = details['device-params'].points_topic
  form.host_name = details['device-params'].host_name
  form.timestamp_mode = details['device-params'].timestamp_mode
  form.ptp_utc_tai_offset = details['device-params'].ptp_utc_tai_offset
  form.point_type = details['device-params'].point_type
  form.receive_topic = details['device-params'].receive_topic
  form.save_topic = details['device-params'].save_topic
  form.bag_file_name = details['device-params'].bag_file_name
  form.type = details.driver
}
const gotoSetConfigs = () => {
  window.history.pushState(null, '', `/loggerfe/root/createConfig?slot=${currentlidarname.value}&viewport=${currentViewport.value.id}`)
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const currentViewport = ref(null)
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      currentViewport.value = datavalue[0]
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
queryDeviceDrivers()

const loadRemoteComponent = async () => {
  try {
    const response = await fetch(`http://daily-report-dev.10.86.14.200.nip.io/test.vue`);
    const vueFile = await response.text();
    const { descriptor } = parse(vueFile);
    const script = compileScript(descriptor, { id: 'remote-component' });
    const { code: templateCode } = compileTemplate({ source: descriptor.template!.content, id: 'remote-component' });

    const component = {
      template: descriptor.template?.content || '',
      setup: () => {
        const scriptExports = {};
        eval(script.code);
        return scriptExports;
      }
    };

    // if (descriptor.styles.length > 0) {
    //   descriptor.styles.forEach(style => {
    //     const { code: styleCode } = compileStyle({
    //       source: style.content,
    //       id: 'remote-component',
    //       scoped: style.scoped
    //     });
    //     const styleTag = document.createElement('style');
    //     styleTag.innerHTML = styleCode;
    //     document.head.appendChild(styleTag);
    //   });
    // }

    // Set the compiled component to render
    RemoteComponent.value = component;
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
    background: #000;
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

    .tree-content {
      width: 300px; 
      height: 200px; 
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
      justify-content: space-between;

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
